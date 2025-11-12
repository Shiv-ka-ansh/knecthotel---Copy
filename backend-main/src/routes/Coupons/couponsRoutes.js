const express = require("express");
const router = express.Router();
const { validateToken, guestAuth } = require("../../middlewares/authMiddleware");
const permissionMiddleware = require('../../middlewares/permissionMiddleware');
const couponController = require("../../controllers/Coupons/couponController");

router.get("/guests", guestAuth, couponController.getCouponsForGuest);
router.get("/hotels", validateToken, permissionMiddleware('hotel-management', "write"), couponController.getCouponsForHotel
)
router.post('/validate', guestAuth, couponController.validateCouponCode);

// Route to create a coupon
router.post("/", validateToken, permissionMiddleware("payment-management", "write"),couponController.createCoupon);

// Route to get all coupons
router.get('/', validateToken, permissionMiddleware("payment-management", "write"), couponController.getAllCoupons);
router.get(
  "/:id",
  validateToken,
  permissionMiddleware("payment-management", "write"),
  couponController.getCouponById
);

router.put(
  "/:id",
  validateToken,
  permissionMiddleware("payment-management", "write"),
  couponController.updateCoupon
);
router.delete(
  "/:id",
  validateToken,
  permissionMiddleware("payment-management", "write"),
  couponController.deleteCoupon
);


module.exports = router;
