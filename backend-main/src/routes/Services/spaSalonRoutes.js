const express = require("express");
const   router = express.Router();

const {
  addSpaSalonProduct,
  updateSpaSalonProduct,
  getSpaSalonProducts,
  createSpaSalonBooking,
  getSpaSalonBookings,
  getSpaSalonBookingById,
  updateSpaSalonBooking,
} = require("../../controllers/Services/spaSalonController");

const {
  validateToken,
  guestAuth,
} = require("../../middlewares/authMiddleware");
const { changeStatus, getServiceRequests, getServiceRequestById } = require("../../controllers/Services/serviceRequestController");
const { setServiceType } = require("../../utils/servicesHelper");

/* Admin */
router.post("/products", validateToken, addSpaSalonProduct);
router.put("/products/:id", validateToken, updateSpaSalonProduct);
router.get("/products", validateToken, getSpaSalonProducts);
router.patch("/status/:id", validateToken, changeStatus);
router.get("/bookings", setServiceType("SpaSalonBooking"),validateToken, getServiceRequests);
router.get("/booking/:id", setServiceType("SpaSalonBooking"), validateToken, getServiceRequestById);

/* Guest */
router.post("/guest/bookings", guestAuth, createSpaSalonBooking);
// router.get("/guest/bookings", guestAuth, getSpaSalonBookings);
router.get(
  "/guest/bookings",
  guestAuth,
  setServiceType("SpaSalonBooking"),
  getServiceRequests
);
router.get("/guest/bookings/:id", guestAuth, setServiceType("SpaSalonBooking"), getServiceRequestById);
router.post("/guests/products", guestAuth, getSpaSalonProducts);

module.exports = router;
