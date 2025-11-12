const mongoose = require("mongoose");

const HousekeepingItemSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    enum: ["Toiletries", "Laundry"],
    required: true,
  },
  name: { type: String, required: true },
  imageUrl: String,
  category: {
    type: String,
    required: true,
  },
  price: { type: Number, required: true },
  HotelId: {
    type: mongoose.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  visibility:Boolean
});

// Add pre-save validation to check category based on serviceType
HousekeepingItemSchema.pre("save", function (next) {
  const validCategories = {
    Toiletries: ["Bathroom Essentials", "Laboratory Essentials"],
    Laundry: ["Men", "Women", "Kids", "Other"],
  };
  
  if (!validCategories[this.serviceType].includes(this.category)) {
    const error = new Error(
      `Invalid category '${this.category}' for service type '${this.serviceType}'`
    );
    return next(error);
  }

  next();
});

module.exports = mongoose.model("HousekeepingItem", HousekeepingItemSchema);
