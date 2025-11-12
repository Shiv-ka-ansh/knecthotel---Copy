const express = require("express");
const { roomBookingInvoice, serviceInvoice, subscriptionInvoice } = require("../../controllers/invoices/invoices");
const { validateToken } = require("../../middlewares/authMiddleware");
const router = express.Router();

router.get("/booking/:bookingId", roomBookingInvoice);
router.get("/service/:serviceId", serviceInvoice);
router.get("/subscription/:HotelId",validateToken, subscriptionInvoice);

module.exports = router;