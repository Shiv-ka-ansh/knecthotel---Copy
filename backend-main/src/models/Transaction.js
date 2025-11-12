// models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    transactionType: {
      type: String,
      enum:['SubscriptionPayment', 'DuePayment', 'ServicePayment']
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required:false,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    gstPercentage: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: ["created", "pending", "completed", "failed", "refunded"],
      default: "created",
    },
    paymentGateway: {
      type: String,
      default: "cashfree",
    },
    paymentLink: {
      type: String,
      required: false,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    serviceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
    },
    discountAmount: Number,
    gatewayResponse: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
