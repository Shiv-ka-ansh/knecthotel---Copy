const mongoose = require("mongoose");
const ServiceRequest = require("./ServiceRequest");

const FacilityRequestSchema = new mongoose.Schema(
  {
    ...ServiceRequest.obj,
    facilityType: {
      type: String,
      enum: ["Gym", "ConferenceHall", "CommunityHall"],
      required: true,
    },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: "FacilityItem" },
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
  },
  { timestamps: true }
);

module.exports = ServiceRequest.discriminator(
  "FacilityRequest",
  FacilityRequestSchema
);
