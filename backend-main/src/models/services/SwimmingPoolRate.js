const mongoose = require("mongoose");

const SwimmingPoolRateSchema = new mongoose.Schema({
  HotelId: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: true, // one rate config per hotel
  },
  startTime: {
    type: String,
    default: "08:00", // opening time (24h format)
  },
  endTime: {
    type: String,
    default: "21:00", // closing time
  },
  slotDurationMinutes: {
    type: Number,
    default: 30,
  },
  pricePerSlot: {
    type: Number,
    required: true, // price per half-hour slot
  },
});

module.exports = mongoose.model("SwimmingPoolRate", SwimmingPoolRateSchema);
