const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  cuisines: [{ type: String }],
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  timing: {
    open: { type: String, default: '09:00 AM' },
    close: { type: String, default: '10:00 PM' }
  },
  isOpen: { type: Boolean, default: true },
  deliveryRadius: { type: Number, default: 5 }, // in km
  minOrder: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 40 },
  rating: { type: Number, default: 4.0 },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
