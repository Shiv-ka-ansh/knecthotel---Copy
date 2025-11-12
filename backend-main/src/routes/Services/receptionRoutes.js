// routes/Services/receptionRoutes.js
const express = require("express");
const router = express.Router();

const {
  createReceptionRequest,
  updateReceptionRequest,
} = require("../../controllers/Services/receptionController");

const {
  validateToken,
  guestAuth,
} = require("../../middlewares/authMiddleware");
const {
  changeStatus,
  getServiceRequests,
  getServiceRequestById,
} = require("../../controllers/Services/serviceRequestController");
const { setServiceType } = require("../../utils/servicesHelper");

/* ─────────── Admin (Hotel) endpoints ─────────── */
router.get(
  "/requests",
  validateToken,
  setServiceType("ReceptionRequest"),
  getServiceRequests
)

router.get("/requests/:id", validateToken, setServiceType("ReceptionRequest"), getServiceRequestById);
router.put("/requests/:id", validateToken, updateReceptionRequest);
router.patch("/status/:id", validateToken, changeStatus);


/* ─────────── Guest endpoints ─────────── */
router.post("/requests", guestAuth, createReceptionRequest);
router.get(
  "/guest/requests",
  guestAuth,
  setServiceType("ReceptionRequest"),
  getServiceRequests
);
router.get(
  "/guest/requests/:id",
  guestAuth,
  setServiceType("ReceptionRequest"),
  getServiceRequestById
);

module.exports = router;
