const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  razorpaySubscriptionId: { type: String, default: '' },
  razorpayCustomerId: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
