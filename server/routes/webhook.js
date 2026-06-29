const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const { emitOrderStatus } = require('../socket/socketHandler');

// @desc    Real Razorpay Webhook listener
// @route   POST /api/webhook/razorpay
// @access  Public
router.post('/', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mockWebhookSecret9012';
  const signature = req.headers['x-razorpay-signature'];

  // Calculate signature
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  // Verify signature (allow pass-through in development with mock keys)
  const isMock = process.env.NODE_ENV === 'development' || !signature;
  if (!isMock && digest !== signature) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  try {
    if (event === 'subscription.charged') {
      const entity = payload.subscription.entity;
      const razorpaySubscriptionId = entity.id;

      // Find subscription
      const sub = await Subscription.findOne({ razorpaySubscriptionId });
      if (sub) {
        sub.isActive = true;
        await sub.save();

        // Update user
        const user = await User.findById(sub.userId);
        if (user) {
          user.isPrime = true;
          user.primeExpiry = sub.endDate;
          await user.save();
        }
      }
    } else if (event === 'order.paid' || event === 'payment.captured') {
      // payment confirmation for orders
      const payment = payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      
      const order = await Order.findOne({ paymentId: razorpayOrderId });
      if (order) {
        order.paymentStatus = 'Paid';
        order.status = 'Confirmed';
        await order.save();
        emitOrderStatus(order._id.toString(), 'Confirmed', 'Restaurant confirmed your order');
      }
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Developer mock webhook emitter for local testing
// @route   POST /api/webhook/razorpay/mock
// @access  Public (Dev only)
router.post('/mock', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ success: false, message: 'Not allowed in production' });
  }

  const { type, id } = req.body;

  try {
    if (type === 'subscription') {
      const sub = await Subscription.findById(id);
      if (!sub) return res.status(404).json({ success: false, message: 'Sub not found' });
      sub.isActive = true;
      await sub.save();

      const user = await User.findById(sub.userId);
      if (user) {
        user.isPrime = true;
        user.primeExpiry = sub.endDate;
        await user.save();
      }
      return res.status(200).json({ success: true, message: 'Mock subscription confirmed', data: sub });
    }

    if (type === 'order') {
      const order = await Order.findById(id).populate('restaurant', 'name');
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      order.paymentStatus = 'Paid';
      order.status = 'Confirmed';
      order.paymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
      await order.save();

      emitOrderStatus(order._id.toString(), 'Confirmed', 'Restaurant confirmed your order');
      return res.status(200).json({ success: true, message: 'Mock order payment confirmed', data: order });
    }

    res.status(400).json({ success: false, message: 'Invalid mock type' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
