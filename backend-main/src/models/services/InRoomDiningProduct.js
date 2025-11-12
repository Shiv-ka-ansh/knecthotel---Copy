const mongoose = require("mongoose");

const InRoomDiningProductSchema = new mongoose.Schema({
  HotelId: {
    type: mongoose.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  productType: {
    type: String,
    required: true,
    // e.g. "starter", "main course", "chineese"
  },
  productName: {
    type: String,
    required: true,
  },
  description: String,
  cost: {
    type: Number,
    required: true,
  },
  foodType: {
    type: String,
    enum: ["vegetarian", "non-vegetarian"],
    required: true,
  },
  visibility: {
    type: Boolean,
    default: true,
    // true = visible to guests, false = hidden from guests
  },
  imageUrl: String,
});

module.exports = mongoose.model(
  "InRoomDiningProduct",
  InRoomDiningProductSchema
);
