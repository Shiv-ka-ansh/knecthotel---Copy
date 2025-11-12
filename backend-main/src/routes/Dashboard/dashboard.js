// routes/dashboard.ts
const { Router } = require("express");
const { getEscalationCounts, getServiceStatusCounts, getBookingKPIs, getServiceRevenue } = require("../../controllers/Dashboard/hotel-KPIs");
const { validateToken } = require("../../middlewares/authMiddleware");

const router = Router();
router.get("/cases", validateToken, getEscalationCounts);
router.get("/service-status", validateToken, getServiceStatusCounts);
router.get("/booking-kpis", validateToken, getBookingKPIs);
router.get("/service-revenue", validateToken, getServiceRevenue);


module.exports = router;
