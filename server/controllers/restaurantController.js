const Restaurant = require('../models/Restaurant');

// @desc    Get all approved restaurants with filters & sorting
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    const { cuisine, rating, maxDeliveryFee, search, sort } = req.query;
    
    // Default query: only show approved restaurants for customers
    let query = { isApproved: true };

    // Search by name or cuisine
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisines: { $regex: search, $options: 'i' } }
      ];
    }

    // Cuisine filter
    if (cuisine) {
      query.cuisines = { $in: Array.isArray(cuisine) ? cuisine : [cuisine] };
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Delivery fee filter
    if (maxDeliveryFee) {
      query.deliveryFee = { $lte: parseFloat(maxDeliveryFee) };
    }

    // Build query builder
    let queryBuilder = Restaurant.find(query);

    // Sorting
    if (sort) {
      if (sort === 'rating') {
        queryBuilder = queryBuilder.sort({ rating: -1 });
      } else if (sort === 'cost') {
        queryBuilder = queryBuilder.sort({ minOrder: 1 });
      } else if (sort === 'delivery') {
        queryBuilder = queryBuilder.sort({ deliveryFee: 1 });
      } else {
        queryBuilder = queryBuilder.sort({ createdAt: -1 }); // relevance/newest
      }
    } else {
      queryBuilder = queryBuilder.sort({ rating: -1 }); // default sort by highest rating
    }

    const restaurants = await queryBuilder;

    res.status(200).json({
      success: true,
      message: 'Restaurants fetched successfully',
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

// @desc    Get single restaurant details
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant details fetched successfully',
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

// @desc    Get restaurant profile for logged-in owner
// @route   GET /api/restaurants/owner/profile
// @access  Private (Restaurant Owner)
exports.getOwnerProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found for this owner. Please create one.',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant profile fetched successfully',
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

// @desc    Create/Update restaurant profile
// @route   POST /api/restaurants/owner/profile
// @access  Private (Restaurant Owner)
exports.upsertOwnerProfile = async (req, res) => {
  try {
    const {
      name, description, cuisines, street, city, state, zipCode,
      lat, lng, openTime, closeTime, deliveryRadius, minOrder, deliveryFee, bankDetails
    } = req.body;

    let restaurant = await Restaurant.findOne({ owner: req.user._id });

    const restaurantData = {
      name,
      owner: req.user._id,
      description,
      cuisines: typeof cuisines === 'string' ? cuisines.split(',').map(c => c.trim()) : cuisines,
      address: { street, city, state, zipCode },
      location: { lat: lat || 0, lng: lng || 0 },
      timing: { open: openTime || '09:00 AM', close: closeTime || '10:00 PM' },
      deliveryRadius: deliveryRadius || 5,
      minOrder: minOrder || 0,
      deliveryFee: deliveryFee || 40,
      // Bank details are placed in a raw JSON field or logged, we store in a sub-document or skip for DB schema. We can log it or add description fields.
    };

    if (restaurant) {
      // Update
      restaurant = await Restaurant.findOneAndUpdate(
        { owner: req.user._id },
        { $set: restaurantData },
        { new: true, runValidators: true }
      );
    } else {
      // Create (Defaults to pending approval)
      restaurant = new Restaurant(restaurantData);
      await restaurant.save();
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant profile saved successfully. Wait for admin approval.',
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

// @desc    Toggle restaurant open/close status
// @route   PATCH /api/restaurants/owner/status
// @access  Private (Restaurant Owner)
exports.toggleOpenStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
        data: null
      });
    }

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: `Restaurant is now ${restaurant.isOpen ? 'OPEN' : 'CLOSED'}`,
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
