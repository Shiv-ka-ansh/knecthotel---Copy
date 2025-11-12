const express = require('express');
const router = express.Router();
const {
  addHotel,
  updateHotel,
  getAllHotels,
  deleteHotel,
  getHotelById,
  submitJoinRequest,
  getPendingRequests,
  approveHotelRequest,
  getPendingRequestById,
  getHotelForGuests,
  calculateNetPrice,
  updateHotelProfile,
  getWifiDetails,
  getSubHotels,
  submitReview,
  rejectHotelRequest,
  getJoinDetailsFromEmail,
  updateServiceAvailability,
  getServiceAvailability,
  getServiceAvailabilityByDepartment,
  getCheckIn_CheckOutTime,
  searchHotelByHotelId,
} = require("../../controllers/Hotel/hotelController");
const { validateToken, guestAuth } = require('../../middlewares/authMiddleware')
const permissionMiddleware = require('../../middlewares/permissionMiddleware');
const { updateProfile } = require('../../controllers/Guests/guestsContollers');
const { updateCashreeMerchantId, addCashreeMerchantId, getMerchanByHotelId } = require('../../controllers/MerchantController/merchantController');

router.post(
  '/add-hotel',
  validateToken, permissionMiddleware('hotel-management', 'write'),
  addHotel,
);

router.post(
  '/cashfree-merchant/:HotelId',
  validateToken, permissionMiddleware('hotel-management', 'write'),
  addCashreeMerchantId
);

router.get(
  '/cashfree-merchant/:HotelId',
  validateToken, permissionMiddleware('hotel-management', 'read'),
  getMerchanByHotelId
);

router.put(
  '/cashfree-merchant/:HotelId',
  validateToken, permissionMiddleware('hotel-management', 'write'),
  updateCashreeMerchantId
);

router.put(
  '/update-hotel/:hotelId',
  validateToken, permissionMiddleware('hotel-management', 'write'),
  updateHotel,
); 
router.put('/update-profile', validateToken, permissionMiddleware("hotel-management", "write"), updateHotelProfile);

router.get(
  "/get-hotels",
  validateToken,
  permissionMiddleware("hotel-management", "read"),
  getAllHotels
);

router.get(
  "/sub-hotels",
  validateToken,
  permissionMiddleware("hotel-management", "read"),
  getSubHotels
);
router.get(
  "/get-hotel/:HotelId",
  validateToken,
  permissionMiddleware("hotel-management", "read"),
  getHotelById
);

router.delete(
    '/delete-hotel/:hotelId',
    validateToken,
    permissionMiddleware('hotel-management', 'delete'),
    deleteHotel,
); 

//
router.post("/join-request", submitJoinRequest);
router.post("/fetchJoinDetails", getJoinDetailsFromEmail);
router.get(
  "/pending-requests",
  validateToken,
  permissionMiddleware("hotel-management", "read"),
  getPendingRequests
);
router.get(
  "/pending-request/:id",
  validateToken,
  permissionMiddleware("hotel-management", "read"),
  getPendingRequestById
);

router.post(
  "/approve-request",
  validateToken,
  permissionMiddleware('hotel-management', 'write'),
  approveHotelRequest
);
router.post(
  "/reject-request",
  validateToken,
  permissionMiddleware("hotel-management", "write"),
  rejectHotelRequest
);
router.post("/calculateNetPrice", calculateNetPrice )
router.get("/guests/wifi", guestAuth, getWifiDetails);

router.get("/guests/:HotelId", guestAuth, getHotelForGuests)

router.post("/guests/review/:bookingId",guestAuth, submitReview)

router.put("/service-availability", validateToken, updateServiceAvailability);
router.get("/service-availability",validateToken, getServiceAvailability);
router.get(
  "/service-availability/:serviceName",
  validateToken,
  getServiceAvailabilityByDepartment
);

router.get("/check-In-Out-Time", validateToken, getCheckIn_CheckOutTime)

router.get("/HotelId/:HotelId", validateToken, searchHotelByHotelId)
module.exports = router;

