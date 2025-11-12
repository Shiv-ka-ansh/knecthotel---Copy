// routes/savedGuests.js
const router = require("express").Router();
const { guestAuth } = require("../../middlewares/authMiddleware");
const {
  listSavedGuests,
  addSavedGuest,
  updateSavedGuest,
  deleteSavedGuest,
} = require("../../controllers/Guests/savedGuestsController");

router.get("/", guestAuth, listSavedGuests);
router.post("/", guestAuth, addSavedGuest);
router.patch("/:savedId", guestAuth, updateSavedGuest);
router.delete("/:savedId", guestAuth, deleteSavedGuest);

module.exports = router;
