const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: {
    type: String,
    enum: ['percent', 'flat', 'free_delivery'],
    required: true
  },
  value: { type: Number, required: true }, // percentage value (e.g. 10 for 10%) or flat amount (e.g. 50 for ₹50)
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 }, // 0 = no limit (relevant for percent type)
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null means public
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('PromoCode', PromoCodeSchema);
