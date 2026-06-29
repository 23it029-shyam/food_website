const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up disk storage for local temp caching (and fallback storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (accept images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Configure Cloudinary
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloudinary_cloud' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Middleware to process upload to Cloudinary or fallback to local URL
const uploadImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const localFilePath = req.file.path;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'shyameats_menu'
      });
      // Delete local temporary file
      fs.unlinkSync(localFilePath);
      // Replace path with cloudinary URL
      req.file.url = result.secure_url;
      next();
    } catch (err) {
      console.error('Cloudinary Upload Error, falling back to local storage:', err);
      // On error, fallback to local URL representation
      req.file.url = `/uploads/${req.file.filename}`;
      next();
    }
  } else {
    // Cloudinary not configured, serve locally
    req.file.url = `/uploads/${req.file.filename}`;
    next();
  }
};

module.exports = { upload, uploadImage };
