const mongoose = require("mongoose");
const ServiceRequest = require("./ServiceRequest");

const SwimmingPoolBookingSchema = new mongoose.Schema({
  ...ServiceRequest.obj,
  slot: {
      // Store COMPLETE slot data
      _id: mongoose.Schema.Types.ObjectId,
      dayOfWeek: String,
      startTime: String,
      endTime: String,
      price: Number,
      maxCapacity: Number,
      currentCapacity: Number,
    },
  bookingDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true, // e.g. '08:00'
  },
  endTime: {
    type: String,
    required: true, // e.g. '08:30'
  },
  rules:String
});

module.exports = ServiceRequest.discriminator(
  "SwimmingPoolBooking",
  SwimmingPoolBookingSchema
);
