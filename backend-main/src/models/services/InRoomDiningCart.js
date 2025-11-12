const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Types.ObjectId,
    ref: "InRoomDiningProduct",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const InRoomDiningCartSchema = new mongoose.Schema({
  guest: {
    type: mongoose.Types.ObjectId,
    ref: "Guest",
    required: true,
    unique: true, // One cart per guest
  },
  items: [CartItemSchema],
});

module.exports = mongoose.model("InRoomDiningCart", InRoomDiningCartSchema);
