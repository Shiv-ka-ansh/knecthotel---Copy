const mongoose = require('mongoose');
const generateUniqueId = require('../utils/idGenerator');
const PendingHotelSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvalDate: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    hotelData: mongoose.Schema.Types.Mixed, // Contains all submitted hotel details
    subscriptionPlan: String,
    couponCode: String,
    adminNotes: String,
  },
  { timestamps: true }
);

PendingHotelSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId("PendingHotel", "uniqueId", "HD", 6);
  }
  next();
});
module.exports = mongoose.model("PendingHotel", PendingHotelSchema);
    