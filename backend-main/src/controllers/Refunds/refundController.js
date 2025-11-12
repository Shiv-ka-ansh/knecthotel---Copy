  const Refund = require("../../models/Refund");
  const Hotel = require("../../models/Hotel")
  const ApiError = require("../../utils/ApiError");
  const Guest = require("../../models/Guest");
  const Admin = require("../../models/SuperAdmin/Admin");
  const { createRefund, createRefundForGuest } = require("../../utils/cashfreeServices");
  const Transaction = require("../../models/Transaction");
  const generateUniqueId = require("../../utils/idGenerator");

  // Create Refund for payment links (Platform -> Hotel)
  exports.createRefundForHotel = async (req, res, next) => {
    try {
      const admin = req.user;

      // 1. Scope check
      if (admin.scope !== "Platform") {
        throw new ApiError(
          403,
          "Access Denied! Only Platform Admin can create refunds for Hotel"
        );
      }

      // 2. Required fields check
      const {
        amount,
        reason,
        transactionId,
        HotelId,
        mode,
      } = req.body;
      if (!mode || !amount || !reason) {
        throw new ApiError(400, "mode, amount, reason are required fields");
      }

      // 3. Hotel existence check
      const hotel = await Hotel.findOne({ HotelId });
      if (!hotel) {
        throw new ApiError(404, "Hotel not found with provided HotelId");
      }

      // 4. Cash refund
      if (mode === "cash") {
        const refund = new Refund({
          hotel: hotel._id,
          scope: "Platform",
          amount,
          reason,
          orderId: transactionId,
          status: "In-progress",
          processedBy: admin._id,
          mode: "cash",
        });
        await refund.save();
        return res.status(201).json({
          success: true,
          message: "Refund initiated successfully",
          refund,
        });
      }

      // 5. Transaction existence and status check
      const transaction = await Transaction.findOne({
        transactionId,
        hotel: hotel._id,
      });
      if (!transaction) {
        throw new ApiError(404, "Transaction not found for this hotel");
      }
      if (transaction.status !== "completed") {
        throw new ApiError(
          400,
          "Transaction is not completed, cannot process refund"
        );
      }
      const orderId =
        transaction.gatewayResponse?.data.order.order_id
      // 6. Create refund doc (for online refund)
      const merchantRefundId = await generateUniqueId(
        "Refund",
        "uniqueId",
        "RF", 
        6
      );
      const refund = new Refund({
        uniqueId: merchantRefundId,
        hotel: hotel._id,
        scope: "Platform",
        amount,
        reason,
        status: "In-progress",
        processedBy: admin._id,
        orderId: transactionId,
        hotel: hotel._id,
        merchantRefundId,
      });

      // 7. Call Cashfree
      const cfBody = {
        refund_amount: Number(amount),
        refund_id: merchantRefundId,
        refund_note: reason?.slice(0, 250) || "Refund",
        refund_speed: "STANDARD",
      };

      const { data: cfResp } = await createRefund(orderId, cfBody);
      if (!cfResp || !cfResp.cf_payment_id) {
        throw new ApiError(500, "Cashfree refund creation failed");
      }

      // 8. Persist Cashfree identifiers & status snapshot
      refund.cfPaymentId = cfResp?.cf_payment_id || null;
      refund.cfRefundId = cfResp?.cf_refund_id || null;
      refund.refundMode = cfResp?.refund_mode || "STANDARD";
      refund.refundCurrency = cfResp?.refund_currency || "INR";
      refund.refundArn = cfResp?.refund_arn || null;
      refund.cfStatusDescription = cfResp?.status_description || null;
      refund.gatewayResponse = cfResp;
      refund.status = "In-progress";

      // 9. Save the refund document
      await refund.save();

      return res.status(201).json({
        success: true,
        message: "Refund initiated successfully",
        refund,
      });
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.code === "order_not_found"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found in payment gateway. Please check the order ID.",
          details: error.response.data.message,
        });
      }
      return next(error);
    }
  };

  // Create Refund for Guest for payments
  exports.createRefundForGuest = async (req, res, next) => {
    try {
      const admin = req.user;

      // 1. Scope check
      if (admin.scope !== "Hotel") {
        throw new ApiError(
          403,
          "Access Denied! Only Hotel Admin can create refunds for guests"
        );
      }

      // 2. Required fields check
      const { amount, reason, transactionId: orderId, guestPhone, mode } = req.body;
      if (!mode || !amount || !reason) {
        throw new ApiError(400, "mode, amount, reason are required fields");
      }

      // 3. Guest existence check
      const guest = await Guest.findOne({ phoneNumber: guestPhone });
      if (!guest) {
        throw new ApiError(404, "Guest not found");
      }

      // 4. Cash refund 
      if (mode === "cash") {
        const refund = new Refund({
          hotel: admin.HotelId._id,
          scope: "Hotel",
          amount,
          reason,
          orderId,
          status: "In-progress",
          processedBy: admin._id,
          mode: "cash",
          guest: guest._id,
        });
        await refund.save();
        return res.status(201).json({
          success: true,
          message: "Refund initiated successfully",
          refund,
        });
      }

      // 5. Transaction existence and status check
      if (!orderId) {
        throw new ApiError(400, "transactionId (orderId) is required for non-cash refunds");
      }
      const transaction = await Transaction.findOne({ transactionId: orderId, guest: guest._id });
      if (!transaction) {
        throw new ApiError(404, "Transaction not found for this guest");
      }
      if (transaction.status !== "completed") {
        throw new ApiError(400, "Transaction is not completed, cannot process refund");
      }

      // 6. Create refund doc (for online refund)
      const merchantRefundId = await generateUniqueId(
        "Refund",
        "uniqueId",
        "RF", 
        6
      );
      const refund = new Refund({
        uniqueId: merchantRefundId,
        hotel: admin.HotelId._id,
        scope: "Hotel",
        amount,
        reason,
        status: "In-progress",
        processedBy: admin._id,
        orderId,
        guest: guest._id,
        merchantRefundId,
      });

      // 7. Call Cashfree
      const cfBody = {
        refund_amount: Number(amount),
        refund_id: merchantRefundId,
        refund_note: reason?.slice(0, 250) || "Refund",
        refund_speed: "STANDARD",
      };

      const { data: cfResp } = await createRefundForGuest(orderId, cfBody, admin.HotelId._id);
      if (!cfResp || !cfResp.cf_payment_id) {
        throw new ApiError(500, "Cashfree refund creation failed");
      }

      // 8. Persist Cashfree identifiers & status snapshot
      refund.cfPaymentId = cfResp?.cf_payment_id || null;
      refund.cfRefundId = cfResp?.cf_refund_id || null;
      refund.refundMode = cfResp?.refund_mode || "STANDARD";
      refund.refundCurrency = cfResp?.refund_currency || "INR";
      refund.refundArn = cfResp?.refund_arn || null;
      refund.cfStatusDescription = cfResp?.status_description || null;
      refund.gatewayResponse = cfResp;
      refund.status = "In-progress";

      // 9. Save the refund document
      await refund.save();

      return res.status(201).json({
        success: true,
        message: "Refund initiated successfully",
        refund,
      });
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.code === 'order_not_found'
      ) {
        return res.status(404).json({
          success: false,
          message: "Order not found in payment gateway. Please check the order ID.",
          details: error.response.data.message,
        });
      }
      return next(error);
    }
  };

  // Get All Refunds (with filters)
  exports.getAllRefunds = async (req, res, next) => {
      try {
          let filter = {}
          if (req.user.scope === "Platform") {
            filter.scope = "Platform";
          } else if (req.user.scope === "Hotel") {
            filter.scope = "Hotel";
            filter.hotel = req.user.HotelId;
          }
        const refunds = await Refund.find(filter)
          .populate("hotel", "name email HotelId")
          .populate("guest", "firstName lastName phoneNumber uniqueId")
          .populate("processedBy assignedTo", "email firstName lastName uniqueId")
          .sort({ createdAt: -1 })
          
          return res.status(200).json({
          success: true,
          refunds,
          });
      } catch (error) {
          console.log(error);
          return next(error);
      }
  };

  exports.getRefundById = async (req, res, next) => {
    try {
      const { refundId } = req.params;

      // Find the refund by ID
      const refund = await Refund.findById(refundId)
        .populate("guest", "firstName lastName phoneNumber uniqueId")
        .populate(
        "hotel processedBy assignedTo",
        "name email firstName lastName HotelId uniqueId"
      );

      if (!refund) {
        throw new ApiError(404, "Refund not found");
        }
      if (refund.scope === "Platform") {
        if (refund.scope !== req.user.scope) {
          throw new ApiError(403, "Access Denied!");
        }
      } else if (refund.scope === "Hotel") {
        if (refund.hotel._id.toString() !== req.user.HotelId.toString()) {
          throw new ApiError(403, "Access Denied!");
        }
      } else {
        throw new ApiError(400, "Invalid Scope, Access Denied");
      }
        
      return res.status(200).json({
        success: true,
        refund,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };

  exports.assignEmployee = async (req, res, next) => {
    try {
      const { adminId } = req.body;
      if (!adminId) {
        throw new ApiError(404, "adminId is missing");
      }
      const refundId = req.params.refundId
      if (!refundId) {
        throw new ApiError(404, 'refundId is missing!')
      }
      const refund = await Refund.findById (refundId);
      if (!refund) {
        throw new ApiError(404, 'Refund not found!')
      }
      if (refund.scope === "Platform") {
        if (refund.scope !== req.user.scope) 
          throw new ApiError(403, "Access Denied!");
      } else if (refund.scope === "Hotel") {
        if (refund.hotel._id.toString() !== req.user.HotelId.toString()) 
          throw new ApiError(403, "Access Denied!");
      } else 
        throw new ApiError(400, "Invalid Scope, Access Denied");
      if (refund.status === 'completed') {
        throw new ApiError(400, 'Cannot assign Employee to a completed refund')
      }
      const admin = await Admin.findById(adminId)
      if (admin.scope !== req.user.scope) {
        throw new ApiError(403, 'Assigned Employee Out of Scope!')
      }
      if (req.user.scope === 'Hotel' && req.user.HotelId.toString() !== admin.HotelId.toString()) {
        throw new ApiError(403, "Assigned Employee Out of Scope!");
      }
      refund.assignedTo = adminId;
      await refund.save()
      return res.status(200).json({
        message: 'Employee Assigned To Refund',
        refund
      })
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  // Update Refund Status
  exports.updateRefund = async (req, res, next) => {
    try {
      const { refundId } = req.params;
      const { status, reason, feedback, rejectreason } = req.body;

      // Validate refund ID
      const refund = await Refund.findById(refundId);
      if (!refund) {
        throw new ApiError(404, "Refund not found");
      }
      if (!refund) {
      throw new ApiError(404, "Refund not found");
      }
    if (refund.scope === "Platform") {
      if (refund.scope !== req.user.scope) {
        throw new ApiError(403, "Access Denied!");
      }
    } else if (refund.scope === "Hotel") {
      if (refund.hotel._id.toString() !== req.user.HotelId.toString()) {
        throw new ApiError(403, "Access Denied!");
      }
    } else {
      throw new ApiError(400, "Invalid Scope, Access Denied");
    }
      // Update the status of the refund
      refund.status = status || refund.status;
      refund.reason = reason || refund.reason;
      refund.feedback = feedback;
      refund.rejectreason = rejectreason;
      // Save updated refund
      await refund.save();

      return res.status(200).json({
        success: true,
        message: "Refund updated successfully",
        refund,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };
  exports.searchRefunds = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
      const { searchTerm } = req.query;

      if (!searchTerm || searchTerm.trim() === "") {
        throw new ApiError(400, "Search term is required!");
      }

      // Create case-insensitive regex pattern
      const escapedTerm = searchTerm
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedTerm, "i");

      // Build base pipeline
      const pipeline = [
        {
          $lookup: {
            from: "guests",
            localField: "guest",
            foreignField: "_id",
            as: "guest",
          },
        },
        { $unwind: "$guest" },
        {
          $match: {
            $or: [
              { uniqueId: regex },
              { "guest.firstName": regex },
              { "guest.lastName": regex },
              { "guest.phoneNumber": regex },
              { "guest.email": regex },
            ],
          },
        },
      ];

      pipeline.push({
            $facet: {
              metadata: [{ $count: "total" }],
              data: [
                { $sort: { requestTime: -1 } }, // Sort by newest first
                { $skip: skip },
                { $limit: limit },
                
              ],
            },
          });
      
          const results = await Refund.aggregate(pipeline);
      
          // Extract metadata and data
          const metadata = results[0]?.metadata[0] || { total: 0 };
          const data = results[0]?.data || [];
          const total = metadata.total;
      
          res.status(200).json({
            success: true,
            count: data.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            limit,
            data,
          });
    } catch (error) {
      return next(error);
    }
  };