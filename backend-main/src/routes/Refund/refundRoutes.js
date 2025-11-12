const express = require("express");
const router = express.Router();
const {
  validateToken,
} = require("../../middlewares/authMiddleware");
const permissionMiddleware = require("../../middlewares/permissionMiddleware");

const { createRefundForHotel, getAllRefunds, getRefundById, updateRefund, createRefundForGuest, assignEmployee, searchRefunds } = require("../../controllers/Refunds/refundController");

router.get(
  "/search",
  validateToken,
  permissionMiddleware("guest-management", "read"),
  searchRefunds
);

router.post("/hotel",
    validateToken,
    permissionMiddleware('refund-management', 'write'),
    createRefundForHotel
);

router.post(
  "/guest",
  validateToken,
  permissionMiddleware("refund-management", "write"),
  createRefundForGuest
);

router.get(
  "/",
  validateToken,
  permissionMiddleware("refund-management", "read"),
  getAllRefunds
);
router.get(
  "/:refundId",
  validateToken,
  permissionMiddleware("refund-management", "read"),
  getRefundById
);
router.put(
  "/assignEmployee/:refundId",
  validateToken,
  permissionMiddleware("refund-management", "write"),
  assignEmployee
);

router.put(
  "/:refundId",
  validateToken,
  permissionMiddleware("refund-management", "write"),
  updateRefund
);



module.exports = router;
