const express = require('express');
const router = express.Router();
const { createSubscription, confirmSubscription, cancelSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All subscription operations require active session

router.post('/', createSubscription);
router.post('/confirm', confirmSubscription);
router.post('/cancel', cancelSubscription);

module.exports = router;
