const express = require("express");
const router = express.Router();
const {
  assignEmployee,
  addHousekeepingService,
  createHousekeepingRequest,
  getAllHousekeepingRequests,
  getHousekeepingRequestById,
  updateHousekeepingRequest,
  getHousekeepingItemsForAdmin,
  getHousekeepingItemsForGuest,
  calculatePrice,
  updateHousekeepingService,
} = require("../../controllers/Services/housekeepingController");
const {
  validateToken,
  guestAuth,
} = require("../../middlewares/authMiddleware");
const permissionMiddleware = require("../../middlewares/permissionMiddleware");
const { changeStatus, getServiceRequests, getServiceRequestById } = require("../../controllers/Services/serviceRequestController");
const { setServiceType } = require("../../utils/servicesHelper");


// Admin routes
router.post(
  "/items",
  validateToken,
  permissionMiddleware("housekeeping", "write"),
  addHousekeepingService
);
router.put(
  "/items/:itemId", // PUT /housekeeping/items/:itemId
  validateToken,
  permissionMiddleware("housekeeping", "write"),
  updateHousekeepingService
);

router.get(
  "/requests",
  validateToken,
  permissionMiddleware("housekeeping", "read"),
  setServiceType("HousekeepingRequest"),
  getServiceRequests
);
// router.get("/requests", validateToken, getAllHousekeepingRequests);
router.get(
  "/requests/:id",
  validateToken,
  permissionMiddleware("housekeeping", "read"),
  setServiceType("HousekeepingRequest"),
  getServiceRequestById
);
// router.get("/requests/:id", validateToken, getHousekeepingRequestById);
router.put(
  "/requests/:id",
  validateToken,
  permissionMiddleware("housekeeping", "write"),
  updateHousekeepingRequest
);
router.patch(
  "/status/:id",
  validateToken,
  permissionMiddleware("housekeeping", "write"),
  changeStatus
);
router.get(
  "/items",
  validateToken,
  permissionMiddleware("housekeeping", "read"),
  getHousekeepingItemsForAdmin
);
// Guest routes 
router.post("/requests/calculatePrice", guestAuth, calculatePrice);
router.post("/requests", guestAuth, createHousekeepingRequest);
router.get('/guest/requests', guestAuth, setServiceType('HousekeepingRequest'), getServiceRequests);
// router.get("/guest/requests", guestAuth, getAllHousekeepingRequests);
router.get(
  "/guest/requests/:id",
  guestAuth,
  setServiceType("HousekeepingRequest"),
  getServiceRequestById
);
// router.get("/guest/requests/:id", guestAuth, getHousekeepingRequestById);
router.post("/guest/items", guestAuth, getHousekeepingItemsForGuest);

module.exports = router;
