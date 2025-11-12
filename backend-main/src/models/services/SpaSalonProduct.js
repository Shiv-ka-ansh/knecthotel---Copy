const mongoose = require("mongoose");

const AdditionalServiceSchema = new mongoose.Schema({
  name: { type: String },
  price: { type: Number, default: 0 },
  imageUrl: { type:String}
});

const SpaSalonProductSchema = new mongoose.Schema({
  HotelId: {
    type: mongoose.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  serviceType: {
    type: String,
    enum: ["Spa", "Salon"],
    required: true,
  },
  productCategory: {
    type: String,
    required: true,
    // e.g. Massage, Facial for Spa; Radiance, Couple Offers for Salon
  },
  productName: {
    type: String,
    required: true,
    // e.g. Swedish massage, Hydrating facial
  },
  price: {
    type: Number,
    required: true,
  },
  description: String,
  imageUrl: String,
  additionalServices: [AdditionalServiceSchema],
  visibility: Boolean,
});

module.exports = mongoose.model("SpaSalonProduct", SpaSalonProductSchema);
