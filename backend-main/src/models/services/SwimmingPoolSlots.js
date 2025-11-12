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

const SwimmingPoolDetailsSchema = new mongoose.Schema({
  HotelId: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true, // For faster queries
  },
  slots: [SlotSchema],
  images: [String],
  poolDetails: String,
  timeAndAccess: String,
  amenities: [
    {
      title: String,
      image: String,
    },
  ],
  rulesAndRegulation: String,
});

module.exports = mongoose.model("SwimmingPoolDetails", SwimmingPoolDetailsSchema)

