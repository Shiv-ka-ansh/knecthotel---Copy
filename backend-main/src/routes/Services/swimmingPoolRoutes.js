const express = require("express");
const router = express.Router();

const {
  setSwimmingPoolRate,
  getAvailableSlots,
  createSwimmingPoolBooking,
  getAllSwimmingPoolBookings,
  getSwimmingPoolBookingById,
  updateSwimmingPoolBooking,
} = require("../../controllers/Services/swimmingPoolController");

const {
  validateToken,
  guestAuth,
} = require("../../middlewares/authMiddleware");
const { changeStatus, getServiceRequests, getServiceRequestById } = require("../../controllers/Services/serviceRequestController");
const { setServiceType } = require("../../utils/servicesHelper");

/* Admin */
router.post("/rate", validateToken, setSwimmingPoolRate);
router.get("/slots", validateToken, getAvailableSlots);
router.get(
  "/requests",
  validateToken,
  setServiceType("SwimmingPoolBooking"),
  getServiceRequests
);
// router.get(
//   "/requests/:id",
//   validateToken,
//   getSwimmingPoolBookingById
// );
router.get(
  "/requests/:id",
  validateToken,
  setServiceType("SwimmingPoolBooking"),
  getServiceRequestById
);
router.put(
  "/requests/:id",
  validateToken,
  updateSwimmingPoolBooking
);
router.patch("/status/:id", validateToken, changeStatus);

/* Guest */
router.get("/guest/slots", guestAuth, getAvailableSlots);
router.post(
  "/guest/requests",
  guestAuth,
  createSwimmingPoolBooking
);
// router.get(
//   "/guest/requests",
//   guestAuth,
//   getAllSwimmingPoolBookings
// );
router.get(
  "/guest/requests",
  guestAuth,
  setServiceType("SwimmingPoolBooking"),
  getServiceRequests
);
router.get(
  "/guest/requests/:id",
  guestAuth,
  setServiceType("SwimmingPoolBooking"),
  getServiceRequestById
);


module.exports = router;
