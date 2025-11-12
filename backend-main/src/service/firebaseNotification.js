const admin = require("../config/firebase"); // Assuming you exported the initialized admin instance
const Guest = require("../models/Guest");

/**
 * Sends a notification to a specific device.
 * @param {string} fcmToken - The FCM registration token of the device.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body text of the notification.
 * @param {object} [data] - Optional key-value pairs for custom data.
 */
async function sendNotificationToDevice(fcmToken, title, body, data) {
  if (!fcmToken || typeof fcmToken !== "string" || fcmToken.trim() === "") {
    throw new Error("FCM token is required and must be a non-empty string.");
  }

  const message = {
    token: fcmToken, // The target device's FCM token
    notification: {
      title: title, // e.g., 'New Message from Jane'
      body: body, // e.g., 'Hey, are you coming?'
    },
    data: data || {}, // Optional data payload
    android: {
      priority: "high",
      notification: {
        sound: "default", // ✅ plays default notification sound
      },
    },
    apns: {
      payload: {
        aps: {
          "content-available": 1,
        },
      },
    },
  };
  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    if (error.code === "messaging/registration-token-not-registered") {
      console.warn(`Token ${fcmToken} is invalid. Deleting from DB.`);
      await deleteInvalidToken(fcmToken); // your function to remove from DB
    } else {
      console.error("Error sending notification:", error);
      throw error; // or handle it as needed
    }
  }
}
const deleteInvalidToken = async (token) => {
  await Guest.findOneAndReplace({ fcmToken: token }, { fcmToken: null });
}
module.exports = { sendNotificationToDevice };
