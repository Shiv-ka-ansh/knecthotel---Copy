const mongoose = require('mongoose')

const verificationSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      required: true,
    },
    document_type: String,
    status: String,
    document_url: String,
    s3Key: String,
    s3Url: String,
    guest: {
      type: mongoose.Types.ObjectId,
      ref: "Guest",
    },
    HotelId: {
      type: mongoose.Types.ObjectId,
      ref: "Hotel",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', verificationSchema)