const mongoose = require("mongoose");

const SlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  price: { type: Number, default: 0 },
  maxCapacity: { type: Number, required: true }, // Admin sets this
  currentCapacity: { type: Number, required: true }, // Managed by the system
});

const FacilityItemSchema = new mongoose.Schema(
  {
    facilityType: {
      type: String,
      enum: ["Gym", "ConferenceHall", "CommunityHall"],
      required: true,
      unique: true, // Enforce one per type per hotel
    },
    name: { type: String, required: false },
    images: [String],
    slots: [SlotSchema],
    HotelId: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true, // For faster queries
    },
  },
  {
    // Enforce unique combination of facilityType and HotelId
    index: { fields: { facilityType: 1, HotelId: 1 }, unique: true },
  }
);

module.exports = mongoose.model("FacilityItem", FacilityItemSchema);
