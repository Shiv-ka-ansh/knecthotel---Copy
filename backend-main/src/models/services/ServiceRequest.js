const { default: mongoose } = require("mongoose");
const generateUniqueId = require("../../utils/idGenerator");
const Guest = require("../Guest");
// Shared across all service modules
const ServiceRequestSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    requestTime: { type: Date, default: Date.now },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed","cancelled"],
      default: "pending",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    requestDetail: String,
    responseDetail: String,
    estimatedDeliveryTime: Date,
    HotelId: {
      type: mongoose.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    additionalGuests: {type: Number, default: 0},
    amount: {
      subtotal: Number,
      discount: Number,
      gstAmount: Number, // GST amount
      finalAmount: Number,
    },
    gst: Number,
    coupon: {
      code: String,
      type: { type: String },
      value: Number,
    },
    paymentStatus: {
      type: String,
      enum: ["NA", "pending", "paid", "failed", "refunded", "pay-later"],
      default: "NA",
    },

    paymentDate: Date,
    paymentMode: String,
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    feedback: {
        serviceFeedback: String,
        serviceRating: Number,
        agentFeedback: String,
        agentRating: Number,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    roomNumber: String,
    completedAt: Date

  },
  {
    timestamps: true,
    discriminatorKey: "__t",
  }
);
exports.ServiceRequestSchema = ServiceRequestSchema;
ServiceRequestSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId("ServiceRequest", "uniqueId", "RQ", 6);
  }
  if (!this.bookingId || !this.roomNumber) {
    const guest = await Guest.findById(this.guest);
    if (guest) {
      if (!guest.currentBooking || !guest.assignedRoomNumber) {
        return next(new Error("Guest does not have an active booking or assigned room number"));
      }
      this.bookingId = guest.currentBooking;
      this.roomNumber = guest.assignedRoomNumber;
    }
  }
  if (this.isModified('amount')) {
    this.amount.subtotal = Number(this.amount.subtotal).toFixed(2)
    this.amount.discount = Number(this.amount.discount).toFixed(2)
    this.amount.gstAmount = Number(this.amount.gstAmount).toFixed(2)
    this.amount.finalAmount = Number(this.amount.finalAmount).toFixed(2)
  }
  next();
});

module.exports = mongoose.model("ServiceRequest", ServiceRequestSchema)