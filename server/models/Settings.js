const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  commissionPercent: { type: Number, default: 10 },
  minOrderValue: { type: Number, default: 100 },
  deliveryFee: { type: Number, default: 40 },
  maintenanceMode: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', SettingsSchema);
