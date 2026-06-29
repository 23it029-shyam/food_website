require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const PromoCode = require('./models/PromoCode');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shyameats');
    console.log('Connected to MongoDB for seeding...');

    // Clear old data (optional, but clean for reset)
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await PromoCode.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create Users
    const customer = await User.create({
      name: 'Shyam Customer',
      email: 'user@shyameats.com',
      password: 'user123',
      phone: '9876543210',
      role: 'user',
      addresses: [
        { street: '123 Shyam Vihar', city: 'New Delhi', state: 'Delhi', zipCode: '110001', isDefault: true }
      ]
    });

    const owner = await User.create({
      name: 'Shyam Owner',
      email: 'owner@shyameats.com',
      password: 'owner123',
      phone: '8765432109',
      role: 'restaurant'
    });

    const admin = await User.create({
      name: 'Shyam Admin',
      email: 'admin@shyameats.com',
      password: 'admin123',
      phone: '7654321098',
      role: 'admin'
    });

    console.log('Users created (Passwords: user123, owner123, admin123).');

    // 2. Create Restaurants
    const r1 = await Restaurant.create({
      name: 'The Gold Imperial',
      owner: owner._id,
      description: 'Experience premium royal Mughlai and authentic North Indian cuisines.',
      cuisines: ['North Indian', 'Biryani', 'Mughlai'],
      address: { street: '12 Khel Gaon', city: 'New Delhi', state: 'Delhi', zipCode: '110016' },
      location: { lat: 28.5562, lng: 77.2138 },
      timing: { open: '10:00 AM', close: '11:00 PM' },
      isOpen: true,
      deliveryRadius: 10,
      minOrder: 150,
      deliveryFee: 45,
      rating: 4.8,
      isApproved: true
    });

    const r2 = await Restaurant.create({
      name: 'Pizza Planet',
      owner: owner._id,
      description: 'Fresh dough pizzas, loaded garlic bread, and delicious hand-crafted pastas.',
      cuisines: ['Italian', 'Pizza', 'Pasta'],
      address: { street: '45 Connaught Place', city: 'New Delhi', state: 'Delhi', zipCode: '110001' },
      location: { lat: 28.6304, lng: 77.2177 },
      timing: { open: '11:00 AM', close: '11:30 PM' },
      isOpen: true,
      deliveryRadius: 7,
      minOrder: 100,
      deliveryFee: 30,
      rating: 4.5,
      isApproved: true
    });

    const r3 = await Restaurant.create({
      name: 'Shyam Dhaba (Pending)',
      owner: owner._id,
      description: 'Home-style delicious food, hot tandoori paranthas, and pure vegetarian dishes.',
      cuisines: ['North Indian', 'Street Food', 'Veg'],
      address: { street: '78 Chandni Chowk', city: 'New Delhi', state: 'Delhi', zipCode: '110006' },
      location: { lat: 28.6506, lng: 77.2303 },
      timing: { open: '08:00 AM', close: '10:00 PM' },
      isOpen: true,
      deliveryRadius: 5,
      minOrder: 50,
      deliveryFee: 20,
      rating: 4.2,
      isApproved: false // Requires Admin approval
    });

    const r4 = await Restaurant.create({
      name: 'Bento Box',
      owner: owner._id,
      description: 'Delectable Japanese sushi rolls, bento boxes, ramen, and warm dumplings.',
      cuisines: ['Japanese', 'Sushi', 'Chinese'],
      address: { street: '56 Saket District Centre', city: 'New Delhi', state: 'Delhi', zipCode: '110017' },
      location: { lat: 28.5284, lng: 77.2184 },
      timing: { open: '12:00 PM', close: '10:30 PM' },
      isOpen: true,
      deliveryRadius: 6,
      minOrder: 200,
      deliveryFee: 50,
      rating: 4.6,
      isApproved: true
    });

    const r5 = await Restaurant.create({
      name: 'Sweet Tooth Desserts',
      owner: owner._id,
      description: 'Satisfy your sweet cravings with warm waffles, hot fudge sundaes, and cheesecakes.',
      cuisines: ['Desserts', 'Bakery', 'Ice Cream'],
      address: { street: '89 Greater Kailash II', city: 'New Delhi', state: 'Delhi', zipCode: '110048' },
      location: { lat: 28.5302, lng: 77.2428 },
      timing: { open: '11:00 AM', close: '12:00 AM' },
      isOpen: true,
      deliveryRadius: 5,
      minOrder: 80,
      deliveryFee: 30,
      rating: 4.7,
      isApproved: true
    });

    const r6 = await Restaurant.create({
      name: 'Burger Junction',
      owner: owner._id,
      description: 'Juicy chicken and veg burgers, crispy onion rings, loaded potato fries, and thick milkshakes.',
      cuisines: ['American', 'Burgers', 'Fast Food'],
      address: { street: '23 Nehru Place', city: 'New Delhi', state: 'Delhi', zipCode: '110019' },
      location: { lat: 28.5494, lng: 77.2518 },
      timing: { open: '10:00 AM', close: '11:00 PM' },
      isOpen: true,
      deliveryRadius: 8,
      minOrder: 120,
      deliveryFee: 40,
      rating: 4.4,
      isApproved: true
    });

    console.log('Restaurants seeded.');

    // 3. Create Menu Items
    await MenuItem.create([
      {
        restaurant: r1._id,
        name: 'Special Paneer Tikka',
        description: 'Tandoori cottage cheese cubes marinated in rich Indian spices.',
        price: 249,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883db6d8?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r1._id,
        name: 'Butter Chicken Masala',
        description: 'Succulent chicken pieces cooked in a creamy spiced tomato sauce.',
        price: 349,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
        isVeg: false,
        isAvailable: true
      },
      {
        restaurant: r1._id,
        name: 'Shahi Veg Biryani',
        description: 'Aromatic basmati rice cooked with fresh seasonal vegetables and saffron.',
        price: 279,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r1._id,
        name: 'Butter Naan',
        description: 'Soft tandoori flatbread brushed with fresh butter.',
        price: 45,
        category: 'Breads',
        image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r2._id,
        name: 'Margherita Deluxe Pizza',
        description: 'Fresh basil leaves, double mozzarella cheese, and premium olive oil.',
        price: 299,
        category: 'Pizzas',
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r2._id,
        name: 'Farmhouse Loaded Pizza',
        description: 'Topped with onions, capsicum, tomatoes, mushrooms, and fresh golden corn.',
        price: 379,
        category: 'Pizzas',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r2._id,
        name: 'Creamy White Sauce Pasta',
        description: 'Penne pasta tossed in rich white garlic sauce with mushrooms.',
        price: 229,
        category: 'Pastas',
        image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r2._id,
        name: 'Cheesy Garlic Breadsticks',
        description: 'Served warm with a side of creamy cheese dip.',
        price: 149,
        category: 'Sides',
        image: 'https://images.unsplash.com/photo-1573145959956-e9dfc63a43bc?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r4._id,
        name: 'Classic Salmon Sushi Roll',
        description: 'Premium raw salmon, fresh cucumber, and seasoned rice rolled in nori.',
        price: 399,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
        isVeg: false,
        isAvailable: true
      },
      {
        restaurant: r4._id,
        name: 'Vegetarian Ramen Bowl',
        description: 'Ramen noodles served in a rich soy broth with tofu, scallions, and soft boiled egg.',
        price: 349,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r4._id,
        name: 'Steamed Chicken Gyoza',
        description: 'Pan-fried Japanese dumplings stuffed with minced seasoned chicken.',
        price: 249,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500',
        isVeg: false,
        isAvailable: true
      },
      {
        restaurant: r5._id,
        name: 'Red Velvet Loaded Waffle',
        description: 'Warm red velvet waffle base drizzled with rich cream cheese glaze.',
        price: 199,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1562376502-6f769499c886?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r5._id,
        name: 'Warm Chocolate Fudge Brownie',
        description: 'Served warm, dripping with rich liquid dark chocolate fudge.',
        price: 149,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r6._id,
        name: 'Crispy Veg Double Patty Burger',
        description: 'Toasted buns, dual crispy potato patties, cheddar cheese, and signature sauce.',
        price: 159,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500',
        isVeg: true,
        isAvailable: true
      },
      {
        restaurant: r6._id,
        name: 'Juicy Chicken Cheese Crunch Burger',
        description: 'Crispy spiced chicken breast, liquid cheese sauce, and fresh lettuce leaves.',
        price: 199,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        isVeg: false,
        isAvailable: true
      }
    ]);

    console.log('Menu items seeded.');

    // 4. Create Promo Codes
    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(now.getMonth() + 3);

    await PromoCode.create([
      {
        code: 'WELCOME50',
        type: 'percent',
        value: 50,
        minOrderAmount: 150,
        maxDiscount: 100,
        usageLimit: 1000,
        expiresAt: expiry,
        isActive: true
      },
      {
        code: 'FLAT100',
        type: 'flat',
        value: 100,
        minOrderAmount: 400,
        maxDiscount: 100,
        usageLimit: 500,
        expiresAt: expiry,
        isActive: true
      },
      {
        code: 'FREEDEL',
        type: 'free_delivery',
        value: 0,
        minOrderAmount: 100,
        maxDiscount: 50,
        usageLimit: null,
        expiresAt: expiry,
        isActive: true
      }
    ]);

    console.log('Promo codes seeded.');
    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
