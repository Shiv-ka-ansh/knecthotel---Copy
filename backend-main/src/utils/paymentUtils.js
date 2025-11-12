const crypto = require("crypto");

exports.verifyWebhookSignature = (rawBody, timestamp, signature) => {
  if (!rawBody || !timestamp || !signature) return false;

  console.log("Verifying webhook with timestamp:", timestamp);

  // Convert Buffer to UTF-8 string if needed
  const bodyString = Buffer.isBuffer(rawBody)
    ? rawBody.toString("utf8")
    : rawBody;

  console.log("Raw Body (String):", bodyString);

  const message = `${timestamp}${bodyString}`;
  const secretKey = process.env.CASHFREE_CLIENT_SECRET;

  const generatedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");

  console.log("Generated Signature:", generatedSignature);
  console.log("Received Signature:", signature);

  if (generatedSignature === signature) {
    console.log("================Webhook Signature Verified===============");
    return JSON.parse(bodyString);
  }

  console.error("Signature mismatch!");
  // throw new Error("Generated signature and received signature did not match.");
};
