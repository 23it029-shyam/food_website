const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const PromoCode = require('../models/PromoCode');
const User = require('../models/User');
const { emitOrderStatus } = require('../socket/socketHandler');
const nodemailer = require('nodemailer');

// Mock or real Razorpay setup
let razorpayInstance = null;
const isRazorpayConfigured = 
  process.env.RAZORPAY_KEY_ID && 
  process.env.RAZORPAY_KEY_ID !== 'rzp_test_mockKeyId1234' &&
  process.env.RAZORPAY_KEY_SECRET;

if (isRazorpayConfigured) {
  try {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  } catch (error) {
    console.error('Failed to initialize Razorpay SDK:', error.message);
  }
}

// Mail transporter helper
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER || null,
      pass: process.env.SMTP_PASS || null
    }
  });
};

const sendConfirmationEmail = async (order, user) => {
  const mailHtml = `
    <div style="font-family: 'Inter', sans-serif; background-color: #131921; color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
      <div style="text-align: center; border-bottom: 2px solid #FF9900; padding-bottom: 10px;">
        <h1 style="color: #FF9900; margin: 0;">ShyamEats</h1>
        <p style="color: #FEBD69; margin: 5px 0 0 0; font-size: 14px;">Hungry? ShyamEats Delivers!</p>
      </div>
      <div style="padding: 20px 0;">
        <h2 style="color: #FEBD69;">Order Confirmed!</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for ordering with <strong>ShyamEats</strong>. Your order is being prepared and will be delivered shortly.</p>
        
        <div style="background-color: #ffffff; color: #131921; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #131921; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Order Summary</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Restaurant:</strong> ${order.restaurant.name || 'Selected Restaurant'}</p>
          <p><strong>Delivery Address:</strong> ${order.address.street}, ${order.address.city}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="border-bottom: 1px solid #ddd; text-align: left;">
                <th>Item</th>
                <th>Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td style="text-align: right;">₹${(item.price * item.qty).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 15px; text-align: right;">
            <p style="margin: 3px 0;">Discount: -₹${order.discount.toFixed(2)}</p>
            <p style="margin: 3px 0;">Delivery Fee: ₹${order.deliveryFee.toFixed(2)}</p>
            <h4 style="margin: 5px 0; color: #FF9900; font-size: 18px;">Total Paid: ₹${order.total.toFixed(2)}</h4>
          </div>
        </div>
      </div>
      <div style="text-align: center; font-size: 12px; color: #FEBD69; border-top: 1px solid #232f3e; padding-top: 10px;">
        <p>&copy; ${new Date().getFullYear()} ShyamEats. All rights reserved.</p>
        <p>Fast, Safe, and Delicious Food straight to your doorstep.</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: '"ShyamEats Support" <support@shyameats.com>',
      to: user.email,
      subject: `ShyamEats Order Confirmed! ID: ${order._id}`,
      html: mailHtml
    });
    console.log(`Confirmation Email sent successfully for Order ${order._id}. URL: ${nodemailer.getTestMessageUrl(info) || 'SMTP Output'}`);
  } catch (error) {
    console.log('--- MOCK EMAIL EMITTED (No SMTP settings available) ---');
    console.log(`To User: ${user.name} (${user.email})`);
    console.log(`Subject: ShyamEats Order Confirmed! ID: ${order._id}`);
    console.log(`Email Body Snapshot: \n`, mailHtml.substring(0, 500) + '... (truncated)');
    console.log('-------------------------------------------------------');
  }
};

// Map status key to user status message
const getStatusMessage = (status) => {
  switch (status) {
    case 'Placed': return 'ShyamEats received your order!';
    case 'Confirmed': return 'Restaurant confirmed your order';
    case 'Preparing': return 'Chef is preparing your food';
    case 'Out for Delivery': return 'Your rider is on the way!';
    case 'Delivered': return 'Enjoy your meal! Rate your experience';
    default: return 'Your order status has been updated';
  }
};

// @desc    Create a new pending order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, restaurantId, promoCode, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required to place an order',
        data: null
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
        data: null
      });
    }

    // Double check item prices and details
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const cartItem of items) {
      const dbItem = await MenuItem.findById(cartItem._id);
      if (!dbItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item '${cartItem.name}' not found`,
          data: null
        });
      }
      calculatedSubtotal += dbItem.price * cartItem.qty;
      orderItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        qty: cartItem.qty,
        price: dbItem.price
      });
    }

    // Apply Prime delivery fee benefit
    const user = await User.findById(req.user._id);
    const isPrimeUser = user.isPrime && user.primeExpiry && new Date(user.primeExpiry) > new Date();
    const deliveryFee = isPrimeUser ? 0 : restaurant.deliveryFee;

    // Check minimum order amount requirement
    if (calculatedSubtotal < restaurant.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Order subtotal is ₹${calculatedSubtotal}, but restaurant requires at least ₹${restaurant.minOrder}`,
        data: null
      });
    }

    // Calculate discount
    let discount = 0;
    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase(), isActive: true });
      if (promo && new Date(promo.expiresAt) > new Date() && (promo.usageLimit === null || promo.usedCount < promo.usageLimit)) {
        if (calculatedSubtotal >= promo.minOrderAmount) {
          if (promo.type === 'percent') {
            discount = (calculatedSubtotal * promo.value) / 100;
            if (promo.maxDiscount > 0 && discount > promo.maxDiscount) {
              discount = promo.maxDiscount;
            }
          } else if (promo.type === 'flat') {
            discount = promo.value;
          } else if (promo.type === 'free_delivery') {
            discount = deliveryFee;
          }

          if (discount > calculatedSubtotal) {
            discount = calculatedSubtotal;
          }

          // Lock promo code count
          promo.usedCount += 1;
          await promo.save();
        }
      }
    }

    const total = calculatedSubtotal - discount + deliveryFee;

    // Save Order
    const order = new Order({
      user: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      total,
      discount,
      deliveryFee,
      promoCode: promoCode || '',
      status: 'Placed',
      address,
      paymentStatus: 'Pending',
      isPrimeOrder: isPrimeUser
    });

    await order.save();

    // Create Razorpay Order if configured
    let razorpayOrderData = null;
    if (razorpayInstance) {
      try {
        const rzOrder = await razorpayInstance.orders.create({
          amount: Math.round(total * 100), // in paise
          currency: 'INR',
          receipt: `receipt_order_${order._id}`
        });
        razorpayOrderData = {
          id: rzOrder.id,
          amount: rzOrder.amount,
          currency: rzOrder.currency
        };
      } catch (err) {
        console.error('Razorpay Order creation error:', err.message);
      }
    }

    // If Razorpay not configured or creation failed, generate standard mock structure
    if (!razorpayOrderData) {
      razorpayOrderData = {
        id: `rzp_mock_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.round(total * 100),
        currency: 'INR',
        isMock: true
      };
    }

    res.status(201).json({
      success: true,
      message: 'Order created, ready for payment',
      data: {
        order,
        razorpayOrderData,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId1234'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Confirm payment status and transition order to Confirmed status
// @route   POST /api/orders/confirm
// @access  Private
exports.confirmOrderPayment = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;

    const order = await Order.findById(orderId).populate('restaurant', 'name');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    order.paymentId = paymentId || `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
    order.paymentStatus = 'Paid';
    order.status = 'Confirmed';
    await order.save();

    // Broadcast update via socket
    emitOrderStatus(order._id.toString(), 'Confirmed', getStatusMessage('Confirmed'));

    // Send confirmation email
    const user = await User.findById(req.user._id);
    await sendConfirmationEmail(order, user);

    res.status(200).json({
      success: true,
      message: 'Order paid and confirmed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Get order history for customer
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name cuisines rating deliveryFee address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Orders history fetched successfully',
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Get single order details (for tracking)
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name cuisines timing address location rating deliveryFee phone')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    // Ensure only the user, restaurant owner, or admin can access
    const isUser = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    let isRestaurantOwner = false;

    if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (restaurant && restaurant._id.toString() === order.restaurant._id.toString()) {
        isRestaurantOwner = true;
      }
    }

    if (!isUser && !isAdmin && !isRestaurantOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order details',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order details fetched successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Get incoming orders list for restaurant owners
// @route   GET /api/orders/restaurant/incoming
// @access  Private (Restaurant Owner)
exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found for this user',
        data: null
      });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Restaurant orders fetched successfully',
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Update order status by restaurant owner (Confirm -> Preparing -> Out for Delivery)
// @route   PATCH /api/orders/:id/status
// @access  Private (Restaurant Owner or Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition value',
        data: null
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    // Check ownership permissions
    if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findById(order.restaurant);
      if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. You do not own the restaurant for this order.',
          data: null
        });
      }
    }

    order.status = status;
    await order.save();

    // Send real-time updates through Socket.io
    emitOrderStatus(order._id.toString(), status, getStatusMessage(status));

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}' successfully`,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
