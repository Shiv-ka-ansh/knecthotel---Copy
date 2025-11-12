const crypto = require("crypto");
const mongoose = require("mongoose");
const ApiError = require("../../utils/ApiError");
const Transaction = require("../../models/Transaction");
const Hotel = require("../../models/Hotel");

// Try to reuse your existing helper from webhooksController.js (if exported).
let updatePaymentStatus = null;
try {
  ({ updatePaymentStatus } = require("./webhooksController"));
} catch (_) {
  // fallback used below
}

/* --------------------------- Status mapping --------------------------- */
function mapExternalStatus(s) {
  const x = String(s || "").toUpperCase();
  return (
    {
      SUCCESS: "completed",
      PAID: "completed",
      PARTIAL: "pending",
      PARTIALLY_PAID: "pending",
      PENDING: "pending",
      FAILED: "failed",
      CANCELLED: "failed",
      REFUNDED: "refunded",
    }[x] || "pending"
  );
}

/* ---------------------- Local update (fallback) ----------------------- */
async function localUpdatePaymentStatus(filter, newStatus, amountPaid, gatewayResponse) {
  const txn = await Transaction.findOne(filter);
  if (!txn) throw new ApiError(404, "Transaction not found");

  txn.status = newStatus;
  if (amountPaid != null) txn.amount = amountPaid;
  txn.gatewayResponse = gatewayResponse;
  await txn.save();

  // Minimal reflection to Hotel (same spirit as your other controller)
  if (txn.hotel && txn.subscription) {
    const hotelUpdate = {};
    if (newStatus === "completed") {
      hotelUpdate.subscriptionPaymentStatus = "paid";
      hotelUpdate.subscriptionPaymentDate = new Date();
      hotelUpdate.subscriptionStatus = "Active";
      hotelUpdate.status = "Active";
    } else if (newStatus === "failed") {
      hotelUpdate.subscriptionPaymentStatus = "failed";
      hotelUpdate.subscriptionPaymentDate = undefined;
    } else if (newStatus === "refunded") {
      hotelUpdate.subscriptionPaymentStatus = "refunded";
      hotelUpdate.subscriptionPaymentDate = undefined;
    } else {
      hotelUpdate.subscriptionPaymentStatus = "pending";
    }
    await Hotel.updateOne({ _id: txn.hotel }, { $set: hotelUpdate });
  }
}

const _update = (...args) =>
  (updatePaymentStatus ? updatePaymentStatus : localUpdatePaymentStatus)(...args);

/* ---------------------- Map hotelId -> Hotel._id ---------------------- */
/**
 * Accepts:
 *  - Mongo _id (24-char ObjectId)
 *  - Hotel.HotelId (e.g., "HD000123")
 */
async function resolveHotelObjectId(hotelIdRaw) {
  if (!hotelIdRaw) return null;

  // If Mongo ObjectId
  if (mongoose.isValidObjectId(hotelIdRaw)) {
    const byId = await Hotel.findById(hotelIdRaw).lean();
    if (byId) return byId._id;
  }

  // Fallback: your custom HotelId field (capital H)
  const byHotelId = await Hotel.findOne({ HotelId: hotelIdRaw }).lean();
  if (byHotelId) return byHotelId._id;

  // (Optional) You may add more mappings here (e.g., by name/code/phone)
  return null;
}

/* ---------------- Controller: Create/Update Payment ------------------- */
/**
 * POST /partners/stayflexi/payments
 * Headers:
 *   Authorization: Bearer <TOKEN>
 *   Content-Type: application/json
 *   (Optional) Idempotency-Key: <uuid>  // not stored in DB since schema has no fields
 *
 * Body (Normal or Gateway):
 *  - Normal:  { hotelId, bookingId, amount, status, paymentMode, paymentType }
 *  - Gateway: { orderId, pmChargeId, pmAmount, status, ... (optional fields) }
 *
 * Idempotency approach:
 *  - We rely on a stable `transactionId` (preferably provided by Stayflexi).
 *  - If not provided, we derive from orderId/pmChargeId/pgOrderId/bookingId.
 *  - If none present, we generate a fallback KNECT-<ts>.
 */
exports.createOrUpdatePayment = async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body || typeof body !== "object") throw new ApiError(400, "Invalid JSON");
    if (!body.status) throw new ApiError(400, "status is required");

    // Amount is required by your schema
    const paidAmount = body.pmAmount != null ? body.pmAmount : body.amount;
    if (paidAmount == null) {
      return res.status(400).json({
        status: false,
        message: "amount/pmAmount is required",
      });
    }

    // Resolve required Hotel reference
    const hotelObjectId = await resolveHotelObjectId(body.hotelId);
    if (!hotelObjectId) {
      return res.status(400).json({
        status: false,
        message:
          "Unknown hotelId. Send a valid Knect Hotel _id or Hotel.HotelId (e.g., HD000123).",
      });
    }
 
    // after: const hotelObjectId = await resolveHotelObjectId(body.hotelId);
let _hotelObjectId = hotelObjectId;
if (!_hotelObjectId && process.env.ALLOW_DEV_HOTEL_FALLBACK === "true") {
  const anyHotel = await Hotel.findOne().select("_id HotelId name").lean();
  if (anyHotel) {
    _hotelObjectId = anyHotel._id;
  }
}

if (!_hotelObjectId) {
  return res.status(400).json({
    status: false,
    message:
      "Unknown hotelId. Send a valid Knect Hotel _id or Hotel.HotelId (e.g., HD000123).",
  });
}

    // Choose/derive a stable transactionId (for idempotency via unique index)
    const externalRefs = [body.transactionId, body.orderId, body.pmChargeId, body.pgOrderId, body.bookingId].filter(Boolean);
    const txId = externalRefs[0] || `KNECT-${Date.now()}`;

    // Upsert Transaction (DO NOT set transactionType; your enum doesn't include "Payment")
    let txn = await Transaction.findOne({ transactionId: txId });
    if (!txn) {
      txn = await Transaction.create({
        transactionId: txId,
        amount: paidAmount,            // required
        status: "created",             // will be updated below
        hotel: hotelObjectId,          // required
        paymentGateway: body.pmGatewayName || "cashfree", // harmless default
        gatewayResponse: body,
        // transactionType: undefined   // left unset (enum-safe)
      });
    } else {
      // Update existing doc
      txn.gatewayResponse = body;
      if (paidAmount != null) txn.amount = paidAmount;
      if (!txn.hotel) txn.hotel = hotelObjectId;
      // Keep transactionType untouched
      await txn.save();
    }

    // Map external status and persist via standard helper/fallback
    const mapped = mapExternalStatus(body.status);
    if (txn.status !== mapped) {
      await _update({ _id: txn._id }, mapped, paidAmount, body);
    }

    return res.status(200).json({ transactionId: txn.transactionId, status: mapped });
  } catch (err) {
    return next(err);
  }
};
