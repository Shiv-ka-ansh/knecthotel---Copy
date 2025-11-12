// controllers/transactionController.js
const { default: mongoose } = require("mongoose");
const Transaction = require("../../models/Transaction");
const ApiError = require("../../utils/ApiError");

exports.getAllTransactions = async (req, res, next) => {
  try {
    // 1. Filtering
    const filter = {};
    if (req.user.scope === 'Platform') {
      filter.subscription = { $ne: null };
    }
    if (req.user.scope === "Hotel") {
      filter.subscription = { $eq: null };
      filter.hotel = req.user.HotelId
    }
    if (req.query.status) {
      filter.status = req.query.status; // e.g. ?status=completed
    }
    if (req.query.hotelId) {
      filter.hotel = req.query.hotelId;
    }
    if (req.query.fromDate || req.query.toDate) {
      filter.createdAt = {};
      if (req.query.fromDate) {
        filter.createdAt.$gte = new Date(req.query.fromDate);
      }
      if (req.query.toDate) {
        filter.createdAt.$lte = new Date(req.query.toDate);
      }
    }

    // 2. Sorting (default: newest first)
    const sort = {};
    sort[req.query.sortBy || "createdAt"] = req.query.sortOrder || "desc";

    // 3. Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 4. Query with population
    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("hotel", "name email phoneNo subscriptionEndDate HotelId")
      .populate("subscription", "planName planDuration")
      .populate("coupon", "code value discountType")
      .populate("guest", "firstName lastName phoneNumber assignedRoom uniqueId")
      .populate("serviceRequestId", "__t uniqueId")
      .populate("coupon", "couponCode");

    // 5. Count total for pagination info
    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) {
    next(new ApiError(500, "Failed to fetch transactions", error.message));
  }
};
exports.getTransactionById = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new ApiError(400, "Invalid transaction ID format");
    }

    const transaction = await Transaction.findById(req.params.id)
      .populate(
        "hotel",
        "name email phoneNo subscriptionEndDate address HotelId"
      )
      .populate("subscription", "planName planDuration cost")
      .populate("coupon", "code value discountType")
      .populate("guest", "firstName lastName phoneNumber assignedRoom uniqueId")
      .populate("serviceRequestId");

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    // Format response
    const response = {
      ...transaction.toObject(),
      paymentDetails: {
        amount: transaction.amount,
        status: transaction.status,
        paymentLink: transaction.paymentLink,
        gateway: transaction.paymentGateway,
      },
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
   return next(error);
  }
};
