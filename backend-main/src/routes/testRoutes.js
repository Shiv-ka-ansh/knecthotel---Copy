const express = require("express");
const router = express.Router();
const { sendNotificationToDevice } = require("../service/firebaseNotification");

router.post("/notify", async (req, res) => {
  const { token, title, body } = req.body;
  try {
    await sendNotificationToDevice(token, title, body);
    res.status(200).json({ message: "Notification sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send", error: err.message });
  }
});

module.exports = router;
