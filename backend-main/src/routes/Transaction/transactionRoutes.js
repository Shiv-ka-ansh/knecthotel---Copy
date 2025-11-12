// routes/transactionRoutes.js
const express = require("express");
const { getAllTransactions, getTransactionById } = require("../../controllers/Transactions/transactionController");
const { validateToken } = require("../../middlewares/authMiddleware");
const permissionMiddleware = require("../../middlewares/permissionMiddleware");

const router = express.Router();

router.get(
  "/",
  validateToken,
  permissionMiddleware("payment-management", "read"),
  getAllTransactions
);
router.get(
  "/:id",
  validateToken,
  permissionMiddleware("payment-management", "read"),
  getTransactionById
);

module.exports = router;
