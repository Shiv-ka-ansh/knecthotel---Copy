const express = require("express");
const router = express.Router();
const { processPaymentWebhook , processPaymentLinkWebhook, processRefundWebhook} = require("../../controllers/Payments/webhooksController");
const { verifyWebhookSignature } = require("../../utils/paymentUtils");

router.post(
  "/payments",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    const signature =
      req.headers["x-webhook-signature"] || req.headers["x-cashfree-signature"];
    const timestamp =
      req.headers["x-webhook-timestamp"] || req.headers["x-cashfree-timestamp"];
    console.log(signature);
    console.log(timestamp);
    if (!verifyWebhookSignature(req.body, timestamp, signature)) {
      console.log("Invalid webhook signature");
      // return res.status(401).send("Invalid webhook signature");
    }

    // Safe to parse now
    if (Buffer.isBuffer(req.body)) {
      req.parsedPayload = JSON.parse(req.body.toString("utf8"));
    } else if (typeof req.body === "string") {
      req.parsedPayload = JSON.parse(req.body);
    } else {
      req.parsedPayload = req.body; // already parsed
    }    next();
  },
  processPaymentWebhook
);
router.post(
  "/payment-links",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    const signature = req.headers["x-cashfree-signature"] || req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-cashfree-timestamp"] || req.headers["x-webhook-timestamp"];
      console.log("Payment_link webhook received!")
      
    if (!verifyWebhookSignature(req.body, timestamp, signature)) {
      // return res.status(401).send("Invalid webhook signature");
      console.log("Invalid webhook signature");
    }
    // Safe to parse now
    req.parsedPayload = JSON.parse(req.body.toString("utf8"));
    next();
  },
  processPaymentLinkWebhook
);

router.post(
  "/refunds",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    console.log("Refund webhook received!")
    console.log("Signature:", signature);
    console.log("Timestamp:", timestamp);
    const verified = verifyWebhookSignature(req.body, timestamp, signature);
    if (!verified){
      console.log("Invalid webhook signature");
      // return res.status(401).send("Invalid webhook signature");
    }
    req.parsedPayload = JSON.parse(req.body.toString("utf8"));
    next();
  },
  processRefundWebhook
);
module.exports = router;
