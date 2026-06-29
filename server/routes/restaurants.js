const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurantById, getOwnerProfile, upsertOwnerProfile, toggleOpenStatus } = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes for restaurant listing and details
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes for restaurant owners
router.get('/owner/profile', protect, authorize('restaurant'), getOwnerProfile);
router.post('/owner/profile', protect, authorize('restaurant'), upsertOwnerProfile);
router.patch('/owner/status', protect, authorize('restaurant'), toggleOpenStatus);

module.exports = router;
