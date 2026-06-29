const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const Settings = require('../models/Settings');

// @desc    Get Admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeRestaurants = await Restaurant.countDocuments({ isApproved: true });
    
    // Start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    const orders = await Order.find({ paymentStatus: 'Paid' });
    const platformRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Recent orders activity feed
    const recentActivity = await Order.find()
      .populate('user', 'name')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Health data charts (mock monthly orders)
    const monthlyStats = [
      { month: 'Jan', orders: 45, revenue: 18000 },
      { month: 'Feb', orders: 60, revenue: 24000 },
      { month: 'Mar', orders: 85, revenue: 34000 },
      { month: 'Apr', orders: 120, revenue: 48000 },
      { month: 'May', orders: 150, revenue: 60000 },
      { month: 'Jun', orders: orders.length, revenue: platformRevenue }
    ];

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: {
        metrics: {
          totalUsers,
          activeRestaurants,
          ordersToday,
          platformRevenue
        },
        recentActivity,
        monthlyStats
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

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } });
    
    // Enrich users with order count
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const orderCount = await Order.countDocuments({ user: user._id });
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPrime: user.isPrime,
        primeExpiry: user.primeExpiry,
        createdAt: user.createdAt,
        orderCount,
        isBanned: user.isBanned || false
      };
    }));

    res.status(200).json({
      success: true,
      message: 'Users list retrieved',
      data: enrichedUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Toggle Ban/Unban user state
// @route   PATCH /api/admin/users/:id/ban
// @access  Private (Admin)
exports.toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User '${user.name}' has been ${user.isBanned ? 'BANNED' : 'UNBANNED'}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Get all restaurants
// @route   GET /api/admin/restaurants
// @access  Private (Admin)
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('owner', 'name email');
    res.status(200).json({
      success: true,
      message: 'Restaurants list retrieved',
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Approve/Suspend a restaurant
// @route   PATCH /api/admin/restaurants/:id/status
// @access  Private (Admin)
exports.updateRestaurantApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
        data: null
      });
    }

    restaurant.isApproved = isApproved;
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: `Restaurant is approved status set to: ${isApproved}`,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Get all platform orders with filters
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, restaurantId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (restaurantId) query.restaurant = restaurantId;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
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

// @desc    Get active subscriptions and revenue metrics
// @route   GET /api/admin/subscriptions
// @access  Private (Admin)
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate('userId', 'name email');
    const activeMembersCount = await Subscription.countDocuments({ isActive: true });
    
    // Calculate subscription revenue
    const allSubs = await Subscription.find({ isActive: true });
    const subRevenue = allSubs.reduce((sum, sub) => {
      return sum + (sub.plan === 'monthly' ? 99 : 699);
    }, 0);

    res.status(200).json({
      success: true,
      message: 'Subscriptions data retrieved',
      data: {
        subscriptions,
        activeMembersCount,
        subRevenue
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

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      message: 'Platform settings retrieved',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
  try {
    const { commissionPercent, minOrderValue, deliveryFee, maintenanceMode } = req.body;
    let settings = await Settings.findOne();

    const updateFields = {};
    if (typeof commissionPercent !== 'undefined') updateFields.commissionPercent = parseFloat(commissionPercent);
    if (typeof minOrderValue !== 'undefined') updateFields.minOrderValue = parseFloat(minOrderValue);
    if (typeof deliveryFee !== 'undefined') updateFields.deliveryFee = parseFloat(deliveryFee);
    if (typeof maintenanceMode !== 'undefined') updateFields.maintenanceMode = maintenanceMode;

    if (!settings) {
      settings = new Settings(updateFields);
      await settings.save();
    } else {
      settings = await Settings.findOneAndUpdate(
        {},
        { $set: updateFields },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Platform settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Revoke user Prime status (Admin only)
// @route   POST /api/admin/subscriptions/:userId/revoke
// @access  Private (Admin)
exports.revokePrimeSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    user.isPrime = false;
    user.primeExpiry = null;
    await user.save();

    // Deactivate subscription records
    await Subscription.updateMany({ userId: user._id }, { $set: { isActive: false } });

    res.status(200).json({
      success: true,
      message: `Prime membership revoked successfully for ${user.name}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
