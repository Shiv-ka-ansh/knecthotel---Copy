const mongoose = require("mongoose");
const generateUniqueId = require("../utils/idGenerator");

const refundSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    scope: {
      type: String,
      enum: ["Platform", "Hotel"],
    },
    // Only required for hotel-to-guest refunds
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Initiated", "In-progress", "Completed", "Rejected"],
      default: "Initiated",
    },

    reason: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    feedback: {
      type: String,
    },
    rejectreason: String,
    orderId: {
      type: String,
      ref: "Transaction",
    },
    mode: {
      type: String,
      enum: ["cash", "cashfree"],
      default: "cash",
    },
      // Cashfree
    cfOrderId: { type: String }, // path param you’ll use to refund
    cfPaymentId: { type: String }, // returned by Cashfree (or you may send for validation)
    cfRefundId: { type: String }, // Cashfree’s refund id
    merchantRefundId: { type: String }, // your idempotent refund_id you send in body
    refundMode: { type: String }, // STANDARD / INSTANT (if enabled)
    refundCurrency: { type: String },
    refundArn: { type: String },
    cfStatusDescription: { type: String },
    gatewayResponse: { type: Object }, // store entire response for audit/debug
  },
  { timestamps: true }
);
refundSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId("Refund", "uniqueId", "RD", 6);
  }
  next();
});

module.exports = mongoose.model("Refund", refundSchema);
