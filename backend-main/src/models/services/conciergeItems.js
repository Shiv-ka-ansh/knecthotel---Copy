const mongoose = require('mongoose')
const conciergeItemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    category: {
        type: String,
        required: true,
    },
    serviceType: {
        type: String,
        enum: ["Nearby Attraction", "Nearby Cafe & Restaurant" , "Taxi Service"],
        required: true,
    },
    distance: Number,
    imageUrl: String,
    HotelId: {
        type: mongoose.Types.ObjectId,
        ref:'Hotel',
        required: true,
  },
});

module.exports = mongoose.model('ConciergeItem', conciergeItemsSchema)