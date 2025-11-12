const express = require("express");
const {
  addConciergeService,
  getConciergeItemsForAdmin,
  updateConciergeItem,
  deleteConciergeItem,
  getConciergeItemsForGuest,
  createConciergeRequest,
  getAllConciergeRequests,
  getConciergeRequestById,
  updateConciergeRequest,
  createTaxiRequest,
} = require("../../controllers/Services/conciergeController");

const { validateToken } = require("../../middlewares/authMiddleware");
const { guestAuth } = require("../../middlewares/authMiddleware"); // New guest middleware
const permissionMiddleware = require("../../middlewares/permissionMiddleware");
const { setServiceType } = require("../../utils/servicesHelper");
const { getServiceRequests, getServiceRequestById } = require("../../controllers/Services/serviceRequestController");

const router = express.Router();

// ======================================
// ADMIN ROUTES (Require hotel admin token)
// ======================================
router.post(
  "/items",
  validateToken,
  permissionMiddleware("conciergeservice", "write"),
  addConciergeService
);

router.get(
  "/items/admin",
  validateToken,
  permissionMiddleware("conciergeservice", "read"),
  getConciergeItemsForAdmin
);

router.put(
  "/items/:id",
  validateToken,
  permissionMiddleware("conciergeservice", "write"),
  updateConciergeItem
);

router.delete(
  "/items/:id",
  validateToken,
  permissionMiddleware("conciergeservice", "write"),
  deleteConciergeItem
);

// router.get(
//   "/requests",
//   validateToken,
//   permissionMiddleware("conciergeservice", "read"),
//   getAllConciergeRequests
// );

router.get(
  "/requests",
  validateToken,
  permissionMiddleware("conciergeservice", "read"),
  setServiceType('ConciergeRequest'),
  getServiceRequests
);

router.get(
  "/requests/:id",
  validateToken,
  permissionMiddleware("conciergeservice", "read"),
  setServiceType("ConciergeRequest"),
  getServiceRequestById
);

router.put(
  "/requests/:id",
  validateToken,
  permissionMiddleware("conciergeservice", "write"),
  updateConciergeRequest
);

// ======================================
// GUEST ROUTES (Require guest authentication)
// ======================================
router.get(
  "/guest/items/:HotelId",
  guestAuth, // Only guest authentication
  getConciergeItemsForGuest
);

router.post(
  "/guest/requests",
  guestAuth, // Only guest authentication
  createConciergeRequest
);

router.get(
  "/guest/requests",
  guestAuth, // Only guest authentication
  setServiceType('ConciergeRequest'),
  getServiceRequests
  
);

router.get(
  "/guest/requests/:id",
  guestAuth, // Only guest authentication
  setServiceType("ConciergeRequest"),
  getServiceRequestById // Only returns if guest owns it
);

router.post("/guest/requestTaxi", guestAuth, createTaxiRequest)

module.exports = router;
