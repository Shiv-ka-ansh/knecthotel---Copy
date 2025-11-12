const express = require("express");
const router = express.Router();

const {
    employeesCount,
    couponCount,
    refundCount,
    bookingReports,
    serviceReports,
    complaintsReports,
    incomeTimeSeries,
    hotelCounts,
    allBookingsReports,
    subscriptionReports,
    paymentManagement

} = require("../../controllers/Reports/reports");
const { validateToken } = require("../../middlewares/authMiddleware");
const { roomBookingInvoice } = require("../../controllers/invoices/invoices");


router.post("/employees", validateToken, employeesCount);

router.post("/coupons", validateToken, couponCount);

router.post("/refunds", validateToken, refundCount);


router.post("/bookings", validateToken, bookingReports);


router.post("/services", validateToken, serviceReports);

router.post("/complaints", validateToken, complaintsReports);

router.post("/income-time-series", validateToken, incomeTimeSeries);

router.post("/hotel-counts", validateToken, hotelCounts);

router.post("/allBookings", validateToken, allBookingsReports);

router.post("/subscriptionReports", validateToken, subscriptionReports);

router.post("/paymentReports", validateToken, paymentManagement);

module.exports = router;