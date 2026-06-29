const express = require('express');
const router = express.Router();
const { createOrder, confirmOrderPayment, getUserOrders, getOrderById, getRestaurantOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // All order actions require logging in

router.post('/', createOrder);
router.post('/confirm', confirmOrderPayment);
router.get('/', getUserOrders);
router.get('/restaurant/incoming', authorize('restaurant'), getRestaurantOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorize('restaurant', 'admin'), updateOrderStatus);

module.exports = router;
