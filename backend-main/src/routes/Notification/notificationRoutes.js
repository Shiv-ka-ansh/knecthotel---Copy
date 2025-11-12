const express = require('express');
const { getNotifications, markAsRead } = require('../../controllers/Notifications/notificationController');
const { validateToken } = require('../../middlewares/authMiddleware');

const router = express.Router();

// Controller function (replace with your actual controller)

// Route to get notifications
router.get('/', validateToken, getNotifications);
router.get('/markRead/:id', validateToken, markAsRead);

module.exports = router;