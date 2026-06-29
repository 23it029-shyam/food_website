const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc    Get all menu items for a specific restaurant
// @route   GET /api/menu/restaurant/:restaurantId
// @access  Public
exports.getMenuByRestaurant = async (req, res) => {
  try {
    const items = await MenuItem.find({ 
      restaurant: req.params.restaurantId,
      isAvailable: true 
    });
    
    res.status(200).json({
      success: true,
      message: 'Menu fetched successfully',
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Get owner's restaurant menu items (including unavailable items)
// @route   GET /api/menu/owner
// @access  Private (Restaurant Owner)
exports.getOwnerMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found',
        data: null
      });
    }

    const items = await MenuItem.find({ restaurant: restaurant._id });

    res.status(200).json({
      success: true,
      message: 'Menu items fetched successfully',
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private (Restaurant Owner)
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isVeg, isAvailable } = req.body;
    
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Please create a restaurant profile before adding menu items',
        data: null
      });
    }

    const imageUrl = req.file ? req.file.url : '';

    const menuItem = new MenuItem({
      restaurant: restaurant._id,
      name,
      description,
      price: parseFloat(price),
      category,
      image: imageUrl,
      isVeg: isVeg === 'true' || isVeg === true,
      isAvailable: isAvailable === 'true' || isAvailable === true || typeof isAvailable === 'undefined'
    });

    await menuItem.save();

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private (Restaurant Owner)
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isVeg, isAvailable } = req.body;
    
    let menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
        data: null
      });
    }

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You do not own the restaurant for this menu item.',
        data: null
      });
    }

    const updateFields = {
      name,
      description,
      category
    };

    if (price) updateFields.price = parseFloat(price);
    if (typeof isVeg !== 'undefined') updateFields.isVeg = isVeg === 'true' || isVeg === true;
    if (typeof isAvailable !== 'undefined') updateFields.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (req.file) updateFields.image = req.file.url;

    menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private (Restaurant Owner)
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
        data: null
      });
    }

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You do not own the restaurant for this menu item.',
        data: null
      });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
