const router = require("express").Router();
const guestController = require("../../controllers/Guests/guestsContollers");
const { uploadDocument } = require("../../controllers/Upload/uploadDocument");
const { guestAuth } = require("../../middlewares/authMiddleware");

router.post("/send-otp", guestController.sendOTP);
router.post("/verify-otp", guestController.verifyOTP);
router.post("/completeSignup", guestAuth, guestController.completeSignup);
router.get("/profile", guestAuth, guestController.getProfile);
router.post("/updateProfile", guestAuth, guestController.updateProfile);
router.post("/uploadDocument", uploadDocument)

router.post("/register-device", guestAuth, guestController.saveFcmToken);
module.exports = router;
