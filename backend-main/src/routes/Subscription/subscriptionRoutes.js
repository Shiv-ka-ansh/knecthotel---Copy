const express = require('express');
const router = express.Router();
const { validateToken } = require('../../middlewares/authMiddleware');
const permissionMiddleware = require('../../middlewares/permissionMiddleware');
const {
  createSubscription,
  updateSubscription,
  getAllSubscriptions,
  getSubscriptionById,
} = require("../../controllers/Subscription/subscriptionController");

router.post('/', validateToken, permissionMiddleware("subscription-management", "write"), createSubscription)
router.put("/:id", validateToken, permissionMiddleware("subscription-management", "write"), updateSubscription);
router.get("/", validateToken, permissionMiddleware("subscription-management", "read"), getAllSubscriptions);
router.get("/:id", validateToken,  permissionMiddleware("subscription-management", "read"), getSubscriptionById);


module.exports = router;
