const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getUsers, toggleBanUser, getRestaurants,
  updateRestaurantApproval, getAllOrders, getSubscriptions, getSettings, updateSettings, revokePrimeSubscription
} = require('../controllers/adminController');
const { getPromos, createPromo, updatePromo, deletePromo } = require('../controllers/promoController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin')); // Restrict all endpoints to platform administrators

// Dashboard Stats
router.get('/dashboard', getDashboardStats);

// User Controls
router.get('/users', getUsers);
router.patch('/users/:id/ban', toggleBanUser);

// Restaurant Controls
router.get('/restaurants', getRestaurants);
router.patch('/restaurants/:id/status', updateRestaurantApproval);

// Orders Controls
router.get('/orders', getAllOrders);

// Promo Code CRUD
router.route('/promos')
  .get(getPromos)
  .post(createPromo);
router.route('/promos/:id')
  .patch(updatePromo)
  .delete(deletePromo);

// Subscriptions Auditing
router.get('/subscriptions', getSubscriptions);
router.post('/subscriptions/:userId/revoke', revokePrimeSubscription);

// Platform Settings CRUD
router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

module.exports = router;
