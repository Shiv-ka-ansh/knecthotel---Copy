// src/controllers/Payments/paymentsController.js
const Transaction = require("../../models/Transaction");
const Subscription = require("../../models/Subscription");
const ApiError = require("../../utils/ApiError"); 
const Hotel = require("../../models/Hotel");
const ServiceRequest = require("../../models/services/ServiceRequest");
const Refund = require("../../models/Refund");
const Bookings = require("../../models/Bookings");
const Guest = require("../../models/Guest");

/**
 * --------  PAYMENT LINK WEBHOOK  -------------------------------------------
 * Cashfree event.type  : PAYMENT_LINK_EVENT
 * Interested statuses  : PAID  |  PARTIALLY_PAID  |  EXPIRED  |  CANCELLED
 */
exports.processPaymentLinkWebhook = async (req, res, next) => {
  try {
    
    const payload = req.parsedPayload; // set in router
    if (payload.data.test_object || payload.data.cf_link_id === 1576977) {
      return res.status(200).json({ message: "All okay." });
    }
    const data = payload.data;
    const transactionId =  data.link_id ; // your paymentLink field
    const linkStatus = data.link_status; // PAID → paid, etc.
    const newStatus = translateStatus(linkStatus, "link")
  
    await updatePaymentStatus(
      { transactionId },
      newStatus,
      data.link_amount,
      payload
    );

    return res.sendStatus(200);
  } catch (err) {
    return next(err);
  }
};

/**
 * --------  PAYMENTS (ORDER PAY) WEBHOOK ------------------------------------
 * Cashfree event.type : PAYMENT_SUCCESS_WEBHOOK / PAYMENT_FAILED_WEBHOOK / PAYMENT_USER_DROPPED_WEBHOOK
 */
exports.processPaymentWebhook = async (req, res, next) => {
  try {
    const payload = req.parsedPayload;
    if (payload.data.test_object) {
      return res.status(200).json({message:'All okay.'})
    }
    const { order, payment } = payload.data;
    const orderId = order.order_id; // your transactionId
    const paymentStatus = payment.payment_status.toLowerCase() // SUCCESS, FAILED, USER_DROPPED
    console.log("Payment Status ====>"+paymentStatus)
    await updatePaymentStatus(
      { transactionId: orderId },
      translateStatus(paymentStatus, "payment"), 
      payment.payment_amount,
      payload
    );
    
    return res.sendStatus(200);
  } catch (err) {
    console.log("Error processing payment webhook:", err);
    return next(err);
  }
};

exports.processRefundWebhook = async (req, res, next) => {
  try {
    const payload = req.parsedPayload; // set in router
    console.log("Refund Webhook Payload:", payload);
    if (payload.data.test_object) {
      return res.status(200).json({ message: "All okay." });
    }
    const data = payload.data;
    const refundId = data.refund.refund_id; // your refundId field
    
    const refund = await Refund.findOne({ uniqueId: refundId });
    if (!refund) {
      throw new ApiError(404, "Refund not found");
    }
  
    const newStatus = data.refund.refund_status // e.g. SUCCESS, FAILED
    if (newStatus === "SUCCESS") {
      refund.status = "Completed";
    }
    if (newStatus === "FAILED") {
      refund.status = "Rejected";
    }
    if (newStatus === "PENDING") {
      refund.status = "In-progress";
    }
    refund.cfRefundId = data.refund.cf_refund_id; // Cashfree’s refund id
    refund.cfStatusDescription = data.refund.cf_status_description; // e.g. "Refund initiated successfully"
    refund.gatewayResponse = payload; // store entire response for audit/debug
    await refund.save();
    
    return res.sendStatus(200);
    
  }
  catch (err) {
    console.log("Error processing refund webhook:", err);
    return next(err);
  }
}
    
/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Maps Cashfree status → internal Transaction.status
 * @param {string} status   cashfree status (already lower-cased)
 * @param {'link'|'payment'} kind
 */
function translateStatus(status, kind) {
  const map = {
    link: {
      SUCCESS: "completed",
      PAID: "completed",
      PARTIALLY_PAID: "pending",
      EXPIRED: "failed",
      CANCELLED: "failed",
    },
    payment: {
      success: "completed",
      failed: "failed",
      user_dropped: "failed",
    },
  };
  return map[kind][status] || "pending";
}

/**
 * Updates the Transaction and (optionally) marks the Subscription active.
 * @param {object}   filter            — mongoose filter to locate the Txn
 * @param {string}   newStatus         — 'completed' | 'pending' | 'failed'
 * @param {number}   amountPaid        — numeric amount actually paid
 * @param {object}   gatewayResponse   — full webhook payload (for auditing)
 */
async function updatePaymentStatus(
  filter,
  newStatus,
  amountPaid,
  gatewayResponse
) {
  const txn = await Transaction.findOne(filter);
  if (!txn) throw new ApiError(404, "Transaction not found");
  // 2. Update Transaction document
  txn.status = newStatus;
  if (amountPaid != null) txn.amount = amountPaid; // keep old if undefined
  txn.gatewayResponse = gatewayResponse;
  await txn.save();

  // 3. Reflect the result in the Hotel that owns this transaction
  if (txn.hotel && txn.subscription) {
    const hotelUpdate = {};
    if (newStatus === "completed") {
      hotelUpdate.subscriptionPaymentStatus = "paid";
      hotelUpdate.subscriptionPaymentDate = new Date();
      hotelUpdate.subscriptionStatus = 'Active'
      hotelUpdate.status = 'Active'
    } else if ("failed" === newStatus) {
      hotelUpdate.subscriptionPaymentStatus = "failed";
      hotelUpdate.subscriptionPaymentDate = undefined;
    } else if ("refunded" === newStatus) {
      hotelUpdate.subscriptionPaymentStatus = "refunded";
      hotelUpdate.subscriptionPaymentDate = undefined;
    }else
    {
      hotelUpdate.subscriptionPaymentStatus = "pending";
    }
    await Hotel.updateOne({ _id: txn.hotel }, { $set: hotelUpdate });
  }
  
  if (txn.serviceRequestId) {
    const serviceRequest = await ServiceRequest.findById(txn.serviceRequestId);
    if (!serviceRequest) {
      console.error(`ServiceRequest not found: ${txn.serviceRequestId}`);
    } else {
      const update = {
        
        paymentStatus: mapTxnStatusToPaymentStatus(newStatus),
        transaction: txn._id  // Link transaction to service request
      };
      
      if (newStatus === "completed") {
        update.paymentDate = new Date();
      }
      
      if(newStatus === "refunded" || newStatus === "failed"){
        update.status = 'cancelled'
      }

      await ServiceRequest.updateOne(
        { _id: txn.serviceRequestId },
        { $set: update }
      );
    }
  }
  if (txn.transactionType === "DuePayment") {
    const booking = await Bookings.findById(txn.booking)
    const dueServices = booking.services
    for (service of dueServices) {
      const serviceRequest = await ServiceRequest.findById(service.serviceRequestId);
      if (!serviceRequest) {
        console.error(`ServiceRequest not found: ${service.serviceRequestId}`);
      } else {
        const update = {
          paymentStatus: mapTxnStatusToPaymentStatus(newStatus),
          transaction: txn._id  // Link transaction to service request
        };

        if (newStatus === "completed") {
          update.paymentDate = new Date();
        }

        if (newStatus === "refunded" || newStatus === "failed") {
          update.status = 'cancelled'
        }

        await ServiceRequest.updateOne(
          { _id: service.serviceRequestId },
          { $set: update }
        );
      }
      
    }
    if (newStatus === "completed") {
      booking.receivedAmt += booking.roomTariffDue;
        booking.roomTariffDue = 0,
        booking.serviceDue = 0,
        booking.paymentMode = 'cashfree',
        booking.paymentStatus = 'paid',
        booking.status = 'Checked-Out'
        booking.checkOutDate = new Date();
      await booking.save();
      if (booking.guest) {
        await Guest.findOneAndUpdate(
          { _id: booking.guest },
          {
            currentBooking: null,
            HotelId: null
          }
        );
      }
    }
  }
}
function mapTxnStatusToPaymentStatus(txnStatus) {
  return (
    {
      completed: "paid",
      pending: "pending",
      failed: "failed",
      refunded: "refunded",
    }[txnStatus] || "pending"
  );
}

module.exports.updatePaymentStatus = updatePaymentStatus;
