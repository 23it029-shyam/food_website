const express = require('express');
const router = express.Router();
const { getMenuByRestaurant, getOwnerMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload, uploadImage } = require('../middleware/upload');

// Public route to fetch restaurant menu
router.get('/restaurant/:restaurantId', getMenuByRestaurant);

// Protected routes for restaurant owners to run CRUD on menu
router.use(protect);
router.use(authorize('restaurant'));

router.get('/owner', getOwnerMenu);
router.post('/', upload.single('image'), uploadImage, createMenuItem);
router.route('/:id')
  .put(upload.single('image'), uploadImage, updateMenuItem)
  .delete(deleteMenuItem);

module.exports = router;
