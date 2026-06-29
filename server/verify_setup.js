require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const PromoCode = require('./models/PromoCode');

const runVerification = async () => {
  console.log('=== ShyamEats Verification System ===');
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shyameats';
    console.log(`Connecting to: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✓ MongoDB Connected Successfully.');

    const usersCount = await User.countDocuments();
    const restaurantsCount = await Restaurant.countDocuments();
    const menuCount = await MenuItem.countDocuments();
    const promoCount = await PromoCode.countDocuments();

    console.log('\n--- Seeding Statistics ---');
    console.log(`- Registered Users: ${usersCount}`);
    console.log(`- Seeded Restaurants: ${restaurantsCount}`);
    console.log(`- Seeded Menu Items: ${menuCount}`);
    console.log(`- Active Promo Codes: ${promoCount}`);
    console.log('--------------------------');

    // Assert that the database contains seeded data
    if (usersCount > 0 && restaurantsCount > 0 && menuCount > 0 && promoCount > 0) {
      console.log('✓ Database seeding verified successfully.');
      console.log('=== Verification Passed ===');
      process.exit(0);
    } else {
      console.error('✗ Error: Seeded data is missing or incomplete.');
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Verification Failed due to database connection error:', error.message);
    process.exit(1);
  }
};

runVerification();
