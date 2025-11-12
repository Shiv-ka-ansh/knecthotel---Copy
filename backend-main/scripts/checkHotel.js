// scripts/checkHotel.js
require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("ERROR: MONGO_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected DB:", mongoose.connection.name);

  const Hotel = mongoose.model("Hotel", new mongoose.Schema({}, { strict: false }), "hotels");

  // 1) Try by HotelId
  const hotelIdValue = "HD580024";
  const byHotelId = await Hotel.findOne({ HotelId: hotelIdValue }).lean();
  console.log("find by HotelId (" + hotelIdValue + "):", !!byHotelId);
  if (byHotelId) console.dir({ _id: byHotelId._id, HotelId: byHotelId.HotelId, name: byHotelId.name }, { depth: 2 });

  // 2) Try by exact _id string
  const idStr = "68f34164cb177d3924722301";
  let byId = null;
  try {
    byId = await Hotel.findOne({ _id: new mongoose.Types.ObjectId(idStr) }).lean();
  } catch (e) {
    byId = null;
  }
  console.log("find by _id (" + idStr + "):", !!byId);
  if (byId) console.dir({ _id: byId._id, HotelId: byId.HotelId, name: byId.name }, { depth: 2 });

  // 3) Try by email or phone if you know them
  const email = "aditya1234@gmail.com";
  const phone = "6203015505";
  const byEmail = await Hotel.findOne({ email }).lean();
  console.log("find by email (" + email + "):", !!byEmail);
  if (byEmail) console.dir({ _id: byEmail._id, HotelId: byEmail.HotelId, name: byEmail.name }, { depth: 2 });

  const byPhone = await Hotel.findOne({ phoneNo: phone }).lean();
  console.log("find by phone (" + phone + "):", !!byPhone);
  if (byPhone) console.dir({ _id: byPhone._id, HotelId: byPhone.HotelId, name: byPhone.name }, { depth: 2 });

  // 4) Print count of hotels in DB (quick check)
  const count = await Hotel.countDocuments();
  console.log("Total hotels in this DB:", count);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error("ERR:", err);
  process.exit(1);
});
