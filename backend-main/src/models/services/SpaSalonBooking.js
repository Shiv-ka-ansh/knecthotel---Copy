const mongoose = require("mongoose");
const ServiceRequest = require("./ServiceRequest");

const SpaSalonBookingSchema = new mongoose.Schema({
  ...ServiceRequest.obj,
  HotelId: {
    type: mongoose.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  spaSalonProduct: {
    type: mongoose.Types.ObjectId,
    ref: "SpaSalonProduct",
    required: true,
  },
  slot: {
    // Store COMPLETE slot data, similar to SwimmingPoolBooking and FacilityRequest
    _id: mongoose.Schema.Types.ObjectId,
    dayOfWeek: String,
    startTime: String,
    endTime: String,
    maxCapacity: Number,
    currentCapacity: Number,
  },
  additionalServicesSelected: [
    {
      name: String,
      price: Number,
    },
  ],
  bookingDate: {
    type: Date,
    required: true,
  },
  bookingTime: {
    type: String, // e.g. '15:30'
    required: true,
  },
  description: String, // guest notes or special requests
});

module.exports = ServiceRequest.discriminator(
  "SpaSalonBooking",
  SpaSalonBookingSchema
);
