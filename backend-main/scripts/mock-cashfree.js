const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Mock Cashfree Server Running'));

// Create payment link
app.post('/links', (req, res) => {
  const payload = req.body || {};
  const link_id = payload.link_id || uuidv4();
  const link_url = `http://localhost:4000/links/${link_id}`;
  return res.json({ link_url, link_id, link_status: 'ACTIVE' });
});

// Create order
app.post('/orders', (req, res) => {
  const body = req.body || {};
  const order_id = body.order_id || `ORD-${uuidv4()}`;
  const cf_order_id = `CF-${uuidv4()}`;
  const order_amount = body.order_amount || 0;
  const response = {
    order_id,
    cf_order_id,
    order_status: 'CREATED',
    order_amount,
    payment_link: `http://localhost:4000/pay/${cf_order_id}`,
  };
  return res.status(200).json(response);
});

// Refund endpoint
app.post('/orders/:id/refunds', (req, res) => {
  const cfOrderId = req.params.id;
  const refund_id = `RF-${uuidv4()}`;
  return res.status(200).json({ refund_id, refund_status: 'INITIATED', cfOrderId });
});

const PORT = process.env.MOCK_CASHFREE_PORT || 4000;
app.listen(PORT, () => console.log(`Mock Cashfree server listening on port ${PORT}`));
