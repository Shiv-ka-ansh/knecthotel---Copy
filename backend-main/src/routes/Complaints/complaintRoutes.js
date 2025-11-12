// src/routes/complaint.routes.js
const express = require("express");
const router = express.Router();

const {
  createHotelComplaint,
  createPlatformComplaint,
  getAllComplaints,
  getHotelLoggedComplaints,
  getComplaintById,
  updateComplaint,
  fetchComplaintStats,
  giveFeedback
} = require("../../controllers/Complaint/complaintControllers");

const { validateToken, guestAuth } = require("../../middlewares/authMiddleware");
const permissionMiddleware = require("../../middlewares/permissionMiddleware");

/* ------------------------------------------------------------------ */
/* 1 ── Guest app (raise or view ONLY their own “Hotel-scope” issues) */
/* ------------------------------------------------------------------ */

router.post(
  "/guest/complaints",
  guestAuth, // attaches req.user (Guest)
  createHotelComplaint // scope set to "Hotel" inside
);

router.get(
  "/guest/complaints",
  guestAuth,
  getAllComplaints // filter limits to caller
);

router.get(
  "/guest/complaints/:id",
  guestAuth,
  getComplaintById // filter limits to caller
);

router.put("/guest/complaints/feedback/:id", guestAuth, giveFeedback)

/* ------------------------------------------------------------------ */
/* 2 ── Hotel admin panel (guest complaints about *their* hotel)      */
/* ------------------------------------------------------------------ */

router.post(
  "/hotel/complaints",
  validateToken,
  permissionMiddleware("complaint-management", "write"),
  createPlatformComplaint 
);

router.get(
  "/hotel/complaints", // list guest complaints for that hotel
  validateToken,
  permissionMiddleware("complaint-management", "read"),
  getAllComplaints
);

router.get(
  "/hotel/my-complaints",
  validateToken,
  permissionMiddleware("complaint-management", "read"),
  getHotelLoggedComplaints 
);

router.get(
  "/hotel/complaints/:id",
  validateToken,
  permissionMiddleware("complaint-management", "read"),
  getComplaintById
);
router.put(
  "/hotel/complaints/:id", // e.g. change status, assign staff
  validateToken,
  permissionMiddleware("complaint-management", "write"),
  updateComplaint
);


/* ------------------------------------------------------------------ */
/* 3 ── Platform staff (super-admin or admin.scope === "Platform")    */
/* ------------------------------------------------------------------ */

router.post(
  "/platform/complaints/platform",
  validateToken,
  permissionMiddleware("complaint-management", "write"),
  createPlatformComplaint
);


router.get(
  "/platform/complaints", // hotel-raised complaints to platform
  validateToken,
  permissionMiddleware("complaint-management", "read"),
  getAllComplaints
);

router.get(
  "/platform/complaints/:id",
  validateToken,
  permissionMiddleware("complaint-management", "read"),
  getComplaintById
);

router.put(
  "/platform/complaints/:id", // e.g. change status, assign staff
  validateToken,
  permissionMiddleware("complaint-management", "write"),
  updateComplaint
);

router.get(
  "/stats",
  validateToken,
  permissionMiddleware("complaint-management", "write"),
  fetchComplaintStats
);


module.exports = router;
