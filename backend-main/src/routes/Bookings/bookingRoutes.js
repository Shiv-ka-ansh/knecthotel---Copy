const router = require("express").Router();
const { validateToken, guestAuth } = require("../../middlewares/authMiddleware")
const permissionMiddleware = require('../../middlewares/permissionMiddleware');
const { fetchGuest } = require("../../controllers/Guests/guestsContollers")

const {
  addBooking,
  getAllBookings,
  getHotelBookings,
  getHotelBookingById,
  getBookingById,
  updateBooking,
  getGuestBookings,
  getGuestBookingById,
  createPreCheckInRequest,
  getPreCheckInRequests,
  checkInForGuests,
  checkOutForGuests,
  deleteBooking,
  rejectPreCheckIn,
  approvePreCheckIn,
  getPendingPreCheckInCount,
  allowPreCheckIn,
  searchBookings,
  getGSTIn,
  updateGSTIn,
} = require("../../controllers/Bookings/bookingController");
const {
  getGuests,
  addOrReplaceGuests,
  appendGuests,
  updateGuest,
  deleteGuest,
} = require("../../controllers/Bookings/additionGuestsController");

router.get(
  "/hotel/search",
  validateToken,
  permissionMiddleware("guest-management", "read"),
  searchBookings
);
router.get("/fetch-guest/:phoneNumber",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  fetchGuest
);

router.post(
  "/addBooking",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  addBooking
);

router.get(
  "/platform",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  getAllBookings
);
router.get(
  "/preCheckins",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  getPreCheckInRequests
);
router.get(
  "/platform/:id",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  getBookingById
);

router.get(
  "/hotel",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  getHotelBookings
);

router.get(
  "/hotel/:id",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  getHotelBookingById
);

router.put(
  "/hotel/:id",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  updateBooking
);
router.get(
  "/hotel/precheckin/pending/count",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  getPendingPreCheckInCount
);

router.put(
  "/approve-precheckin/:id",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  approvePreCheckIn
);

router.put(
  "/allow-precheckin/:id",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  allowPreCheckIn
);
router.put(
  "/reject-precheckin/:id",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  rejectPreCheckIn
);

router.delete(
  "/hotel/:id",
  validateToken,
  permissionMiddleware("guest-management", "write"),
  deleteBooking
);
router.get('/guestBookings', guestAuth, getGuestBookings)
router.get("/guestBooking/:bookingId", guestAuth, getGuestBookingById);
router.post("/preCheckIn/:bookingId", guestAuth, createPreCheckInRequest);
router.get("/checkIn/:bookingId", guestAuth, checkInForGuests);
router.get("/checkOut/:bookingId", guestAuth, checkOutForGuests)

// get current guests on a booking
router.get("/additionalGuests/:bookingId", guestAuth, getGuests);

// replace all guests (hard replace)
router.post("/additionalGuests/:bookingId/guests/replace", guestAuth, addOrReplaceGuests);

// append some guests (does not remove existing)
router.post("/additionalGuests/:bookingId/guests", guestAuth, appendGuests);

// update a specific embedded guest by its _id
router.patch("/additionalGuests/:bookingId/guests/:guestId", guestAuth, updateGuest);

// remove a specific embedded guest by its _id
router.delete("/additionalGuests/:bookingId/guests/:guestId", guestAuth, deleteGuest);

router.get("/gstIn/:bookingId", guestAuth, getGSTIn);
router.post("/gstIn/:bookingId", guestAuth, updateGSTIn);
module.exports = router;
