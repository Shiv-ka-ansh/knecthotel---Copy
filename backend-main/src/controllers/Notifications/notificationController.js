const Notifications = require("../../models/Notifications");

exports.getNotifications = async (req, res) => {
  try {
    const adminId = req.user._id;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const notifications = await Notifications.find({ adminId})
      .sort({ isRead: 1, createdAt: -1 , })
      .skip((page - 1) * limit)
      .limit(limit); // or paginate as needed
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notifications.findByIdAndUpdate(notificationId, {isRead:true});
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}