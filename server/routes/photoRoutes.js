const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middlewares/authMiddleware');
const {
  uploadPhoto,
  getPhotos,
  deletePhoto,
} = require('../controllers/photoController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save to uploads folder
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: fileFilter,
});

// All routes are protected by authentication middleware
router.route('/')
  .post(protect, upload.single('image'), uploadPhoto) // POST /api/photos - Upload photo
  .get(protect, getPhotos); // GET /api/photos - Get user's photos

router.route('/:id')
  .delete(protect, deletePhoto); // DELETE /api/photos/:id - Delete photo

module.exports = router;
