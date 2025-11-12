const express = require('express');
const { guestAuth, validateToken } = require('../../middlewares/authMiddleware');
const {
  createSos,
  viewAll,
  viewById,
  updateSos,
  viewGuestsSos,
} = require("../../controllers/SOS/sosController");
const router = express.Router();

router.post("/", guestAuth, createSos);
router.get("/guests", guestAuth, viewGuestsSos);
router.get("/", validateToken, viewAll)
router.get('/:id', validateToken, viewById)
router.put("/:id", validateToken, updateSos)

module.exports = router;
