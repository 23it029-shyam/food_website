const PromoCode = require('../models/PromoCode');

// @desc    Validate a promo code for cart total
// @route   POST /api/promo/validate
// @access  Private
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, cartTotal, deliveryFee } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required',
        data: null
      });
    }

    const promo = await PromoCode.findOne({ code: code.toUpperCase() });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code. Check spelling.',
        data: null
      });
    }

    if (!promo.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This promo code is no longer active',
        data: null
      });
    }

    // Expiry check
    if (new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This promo code has expired',
        data: null
      });
    }

    // Usage limit check
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This promo code limit has been reached',
        data: null
      });
    }

    // Min order check
    if (cartTotal < promo.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${promo.minOrderAmount} required for this code`,
        data: null
      });
    }

    // Assigned check
    if (promo.assignedTo && promo.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This promo code is not valid for your account',
        data: null
      });
    }

    // Calculate discount
    let discount = 0;
    if (promo.type === 'percent') {
      discount = (cartTotal * promo.value) / 100;
      if (promo.maxDiscount > 0 && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else if (promo.type === 'flat') {
      discount = promo.value;
    } else if (promo.type === 'free_delivery') {
      discount = deliveryFee || 0;
    }

    // Cap discount at total cart value
    if (discount > cartTotal) {
      discount = cartTotal;
    }

    res.status(200).json({
      success: true,
      message: `✓ ${promo.code} applied! You save ₹${discount.toFixed(2)}`,
      data: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discount: parseFloat(discount.toFixed(2))
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

// @desc    Get all promo codes (Admin only)
// @route   GET /api/admin/promos
// @access  Private (Admin)
exports.getPromos = async (req, res) => {
  try {
    const promos = await PromoCode.find().populate('assignedTo', 'name email');
    res.status(200).json({
      success: true,
      message: 'Promo codes fetched successfully',
      data: promos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Create a promo code (Admin only)
// @route   POST /api/admin/promos
// @access  Private (Admin)
exports.createPromo = async (req, res) => {
  try {
    const {
      code, type, value, minOrderAmount, maxDiscount,
      usageLimit, expiresAt, assignedTo, isActive
    } = req.body;

    const exists = await PromoCode.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Promo code with name '${code}' already exists`,
        data: null
      });
    }

    const promo = new PromoCode({
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      minOrderAmount: parseFloat(minOrderAmount || 0),
      maxDiscount: parseFloat(maxDiscount || 0),
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiresAt: new Date(expiresAt),
      assignedTo: assignedTo || null,
      isActive: typeof isActive !== 'undefined' ? isActive : true
    });

    await promo.save();

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      data: promo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Update a promo code active state or properties (Admin only)
// @route   PATCH /api/admin/promos/:id
// @access  Private (Admin)
exports.updatePromo = async (req, res) => {
  try {
    const { isActive, type, value, minOrderAmount, maxDiscount, usageLimit, expiresAt } = req.body;
    let promo = await PromoCode.findById(req.params.id);

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found',
        data: null
      });
    }

    const updateFields = {};
    if (typeof isActive !== 'undefined') updateFields.isActive = isActive;
    if (type) updateFields.type = type;
    if (value) updateFields.value = parseFloat(value);
    if (typeof minOrderAmount !== 'undefined') updateFields.minOrderAmount = parseFloat(minOrderAmount);
    if (typeof maxDiscount !== 'undefined') updateFields.maxDiscount = parseFloat(maxDiscount);
    if (typeof usageLimit !== 'undefined') updateFields.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (expiresAt) updateFields.expiresAt = new Date(expiresAt);

    promo = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Promo code updated successfully',
      data: promo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// @desc    Delete a promo code (Admin only)
// @route   DELETE /api/admin/promos/:id
// @access  Private (Admin)
exports.deletePromo = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found',
        data: null
      });
    }

    await PromoCode.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Promo code deleted successfully',
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
