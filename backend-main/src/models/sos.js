const mongoose = require("mongoose");
const generateUniqueId = require("../utils/idGenerator");

const sosSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum:['Fire', 'Medical', 'Security'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    HotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
    
  },
  { timestamps: true }
);

sosSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId("sos", "uniqueId", "SOS", 6);
  }
  next();
});

module.exports = mongoose.model("sos", sosSchema);
