const express = require("express");
const router = express.Router();

const {
  createInRoomControlRequest,
  getAllInRoomControlRequests,
  getInRoomControlRequestById,
  updateInRoomControlRequest,
} = require("../../controllers/Services/inRoomControlController");

const {
  validateToken,
  guestAuth,
} = require("../../middlewares/authMiddleware");
const { changeStatus, getServiceRequests, getServiceRequestById } = require("../../controllers/Services/serviceRequestController");
const { setServiceType } = require("../../utils/servicesHelper");

// Admin routes
// router.get(
//   "/requests",
//   validateToken,
//   getAllInRoomControlRequests
// );
router.get(
  "/requests",
  validateToken,
  setServiceType("InRoomControlRequest"),
  getServiceRequests
);
router.get(
  "/requests/:id",
  validateToken,
  setServiceType("InRoomControlRequest"),
  getServiceRequestById
);
router.put(
  "/requests/:id",
  validateToken,
  updateInRoomControlRequest
);
router.patch("/status/:id", validateToken, changeStatus);

// Guest routes
router.post("/requests", guestAuth, createInRoomControlRequest);
router.get(
  "/guest/requests",
  guestAuth,
  setServiceType("InRoomControlRequest"),
  getServiceRequests
);
router.get(
  "/guest/requests/:id",
  guestAuth,
  setServiceType("InRoomControlRequest"),
  getServiceRequestById
);

module.exports = router;
