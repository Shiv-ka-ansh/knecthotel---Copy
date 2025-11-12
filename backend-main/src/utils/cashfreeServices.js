const axios = require("axios");
const { Cashfree, CFEnvironment } = require("cashfree-pg");
const ApiError = require("./ApiError");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");
const Partner  =  require("../models/CashfreeMerchant");
const CashfreeMerchant = require("../models/CashfreeMerchant");

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL;
const CASHFREE_PARTNER_API_KEY = process.env.CASHFREE_PARTNER_API_KEY;

const form = new FormData();

const verifyAadhaar = async (verification_id, document_type, file) => {
  const form = new FormData();
  form.append("verification_id", verification_id);
  form.append("document_type", document_type);
  // form.append(
  //   "file_url",
  //   "https://dibstestbucket0403.s3.ap-south-1.amazonaws.com/Hotel/1750405319534_Aadhar%20new.pdf"
  // );
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });
  // form.append("do_verification", "true");

  const headers = {
    "content-type": `multipart/form-data; boundary=${form.boundary}`, // ← manual
    "x-api-version": "2024-12-01",
    "x-client-id": "CF10493393D1CHNL6M4RAC73ASVGS0",
    "x-client-secret": "cfsk_ma_test_8343249ef5f209bf78284f763ff60aed_9a9beb48",
  };

  const { data } = await axios.post(
    "https://sandbox.cashfree.com/verification/bharat-ocr",
    form,
    { headers }
  );
  return data;
};

const generatePaymentLink = async (
  customer_details,
  amount,
  transaction_id
) => {
  try {
    const payload = {
      order_id: transaction_id,
      link_id: transaction_id, // must be unique for every request
      link_amount: amount, // integer paise, not rupees if “amount” is in paise
      link_currency: "INR",
      link_purpose: "Subscription",
      customer_details, // {customer_name, customer_phone, customer_email}
      link_notify: {
        send_sms: false,
        send_email: true,
      },
      order_meta: {
        return_url: "https://knecthotel.com/",
        notify_url: "http://13.127.80.211:5001/api/webhooks/payment-links",
      },
    };

    const response = await axios.post(`${CASHFREE_BASE_URL}/links`, payload, {
      headers: {
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "x-api-version": "2025-01-01",
        "Content-Type": "application/json",
      },
    });

    // Cashfree returns {link_url, link_id, link_status, ...}
    return response.data.link_url;
  } catch (err) {
    // Axios wraps the API error inside err.response
    console.error(
      "Cashfree link generation failed:",
      err?.response?.data || err
    );
    throw err; // bubble up so your controller can handle it
  }
};



// orderId is the service request Id.
const createOrder = async (order_id, order_amount, HotelId, customer_details) => {
  const partnerDetails = await CashfreeMerchant.findOne({ HotelId });
  if (!partnerDetails) {
    throw new ApiError(401, "Hotel Payment System Not Active!");
  }

  if (!partnerDetails.merchantId) {
    throw new ApiError(500, "Partner missing merchantID.");
  }
  if (!process.env.CASHFREE_PARTNER_API_KEY) {
    throw new ApiError(500, "CASHFREE_PARTNER_API_KEY not set in environment.");
  }

  // Ensure order_amount is numeric with 2 decimals (sent as Number)
  const amountNum = Number(parseFloat(order_amount).toFixed(2));

  const url = CASHFREE_BASE_URL+"/orders";
  const headers = {
    "x-api-version": "2025-01-01",
    "x-partner-merchantid": partnerDetails.merchantId,
    "x-partner-apikey": process.env.CASHFREE_PARTNER_API_KEY,
    "Content-Type": "application/json",
  };

  const body = {
    order_id,
    order_amount: amountNum,
    order_currency: "INR",
    customer_details, // must be an object with allowed fields (customer_id, customer_phone, etc.)
    order_meta: {
      return_url: "https://knecthotel.com/",
      notify_url: "https://lp3vj7gm-5001.inc1.devtunnels.ms/api/webhooks/payments",
    },
    order_note: "",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    // Debug: log full response body on non-2xx status
    // Cashfree returns non-2xx status for errors — surface useful details
    if (!res.status || res.status !== 200 ) {
      const text = await res.text().catch(() => "");
      throw new ApiError(res.status, `Cashfree API error: ${res.status} ${res.statusText} - ${text}`);
    }
    if (
      res.status !== 200) {
      throw new ApiError(res.status, res.statusText || "Cashfree order creation failed");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    // Keep original behavior of wrapping in ApiError where possible
    if (error instanceof ApiError) throw error;
    // If fetch/network error, wrap it so your callers get consistent error shape
    throw new ApiError(error.statusCode || 500, error.message || "Failed to create Cashfree order", error);
  }
};

const CF_API_VERSION = process.env.CF_API_VERSION || "2025-01-01"; // per docs

if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
  // fail fast if missing creds
  console.warn(
    "Cashfree credentials missing. Set CASHFREE_CLIENT_ID & CASHFREE_CLIENT_SECRET"
  );
}

const cf = axios.create({
  baseURL: CASHFREE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-version": CF_API_VERSION,
    "x-client-id": CASHFREE_CLIENT_ID,
    "x-client-secret": CASHFREE_CLIENT_SECRET,
  },
  timeout: 15000,
});

/**
 * Create a refund against an order (and implicitly a payment under that order).
 * @param {string} cfOrderId - Cashfree order_id / cf_order_id
 * @param {object} body - { refund_amount, refund_id, refund_note, refund_speed }
 * @param {string} [idempotencyKey] - optional UUID for safe retries
 */
async function createRefund(cfOrderId, body, idempotencyKey = uuidv4()) {
  return cf.post(`/orders/${cfOrderId}/refunds`, body, {
    headers: { "x-idempotency-key": idempotencyKey },
  });
}

async function createRefundForGuest(cfOrderId, body, HotelId,  idempotencyKey = uuidv4()) {
  
  const partnerDetails = await Partner.findOne({ HotelId })
  if (!partnerDetails) {
    throw new ApiError(401, "Hotel Payment System Not Active!")
  }
  const cf = axios.create({
    baseURL: CASHFREE_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "x-api-version": CF_API_VERSION,
      "x-partner-merchantid": partnerDetails.merchantId,
      "x-partner-apikey": process.env.CASHFREE_PARTNER_API_KEY,
    },
    timeout: 15000,
  });
  return cf.post(`/orders/${cfOrderId}/refunds`, body, {
    headers: { "x-idempotency-key": idempotencyKey },
  });
}

module.exports = {
  verifyAadhaar,
  generatePaymentLink,
  createOrder,
  createRefund,
  createRefundForGuest
};
