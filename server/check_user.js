require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shyameats');
    console.log('Connected to MongoDB.');

    const admin = await User.findOne({ email: 'admin@shyameats.com' });
    if (!admin) {
      console.error('✗ Admin user NOT found in the database!');
      process.exit(1);
    }

    console.log('✓ Admin user found:');
    console.log(`- Name: ${admin.name}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- Hashed Password in DB: ${admin.password}`);

    // Let's test bcrypt manually
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log(`- Password Match for '${testPassword}': ${isMatch ? 'SUCCESS' : 'FAILED'}`);

    process.exit(0);
  } catch (err) {
    console.error('Error during check:', err);
    process.exit(1);
  }
};

checkAdmin();
