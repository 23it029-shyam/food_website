const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @desc    Create a Prime subscription (real or mock)
// @route   POST /api/subscriptions
// @access  Private
exports.createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const allowedPlans = ['monthly', 'yearly'];

    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan. Choose 'monthly' or 'yearly'",
        data: null
      });
    }

    const price = plan === 'monthly' ? 99 : 699;
    const durationDays = plan === 'monthly' ? 30 : 365;

    // Create inactive subscription first
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    const subscription = new Subscription({
      userId: req.user._id,
      plan,
      startDate,
      endDate,
      isActive: false, // Inactive until paid
      razorpaySubscriptionId: `sub_mock_${Math.random().toString(36).substr(2, 9)}`,
      razorpayCustomerId: `cust_mock_${Math.random().toString(36).substr(2, 9)}`
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Subscription order created successfully',
      data: {
        subscription,
        price,
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

// @desc    Confirm subscription payment and activate Prime status
// @route   POST /api/subscriptions/confirm
// @access  Private
exports.confirmSubscription = async (req, res) => {
  try {
    const { subscriptionId, paymentId } = req.body;

    const sub = await Subscription.findById(subscriptionId);
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: 'Subscription order not found',
        data: null
      });
    }

    // Activate subscription
    sub.isActive = true;
    await sub.save();

    // Update user Prime status
    const user = await User.findById(req.user._id);
    user.isPrime = true;
    user.primeExpiry = sub.endDate;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Welcome to ShyamEats Prime! Your subscription is now active.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isPrime: user.isPrime,
          primeExpiry: user.primeExpiry
        },
        subscription: sub
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

// @desc    Cancel active Prime subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id, isActive: true });
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found to cancel',
        data: null
      });
    }

    sub.isActive = false;
    await sub.save();

    // Remove user Prime flags
    const user = await User.findById(req.user._id);
    user.isPrime = false;
    user.primeExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isPrime: user.isPrime,
          primeExpiry: user.primeExpiry
        }
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
