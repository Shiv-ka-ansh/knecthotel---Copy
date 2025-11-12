const express = require("express");
const router = express.Router();

const verifyPartnerToken = require("../middlewares/verifyPartnerToken");
const {
  createOrUpdatePayment,
} = require("../controllers/Payments/knectPartnerPaymentsController");

// Stayflexi -> Knect: Create/Update Payment
router.post("/partners/stayflexi/payments", verifyPartnerToken, createOrUpdatePayment);

module.exports = router;
