const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema({
    HotelId: {
        type: mongoose.Types.ObjectId,
        ref: "Hotel",
        unique:true,
        required: true
    },
    merchantId: {
        type: String,
        unique: true,
        required: true
    },
    addedBy: {
        type: mongoose.Types.ObjectId,
        ref: "Admin",
        required: true
    },
},
{ timestamps: true }
)

module.exports = mongoose.model("CashfreeMerchant", merchantSchema)