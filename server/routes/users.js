const express = require('express');
const router = express.Router();
const { updateProfile, getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All user profile & address book operations require login

router.put('/profile', updateProfile);
router.route('/addresses')
  .get(getAddresses)
  .post(addAddress);

router.route('/addresses/:addressId')
  .put(updateAddress)
  .delete(deleteAddress);

module.exports = router;
