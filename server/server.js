require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketHandler');

// Routes imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const restaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const promoRoutes = require('./routes/promo');
const subscriptionRoutes = require('./routes/subscriptions');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhook');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local images in dev environment
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Inline Cookie Parser (0-dependency fallback)
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        req.cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
      }
    });
  }
  next();
});

// Serve local upload folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP to 100 auth attempts per 15 mins
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply Auth Limiter on auth routes
app.use('/api/auth', authLimiter, authRoutes);

// Apply Routes
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhook/razorpay', webhookRoutes);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `ShyamEats API route not found: ${req.originalUrl}`,
    data: null
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`ShyamEats server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
