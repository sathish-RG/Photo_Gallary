const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middlewares/authMiddleware');
const {
  uploadMedia,
  getMedia,
  deleteMedia,
} = require('../controllers/mediaController');

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

// File filter to accept images, videos, and audio
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // Allowed video types
  const videoTypes = /mp4|mkv|webm|avi|mov/;
  // Allowed audio types
  const audioTypes = /mp3|wav|ogg|m4a/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const isImage = imageTypes.test(extname.slice(1)) && file.mimetype.startsWith('image/');
  const isVideo = videoTypes.test(extname.slice(1)) && file.mimetype.startsWith('video/');
  const isAudio = audioTypes.test(extname.slice(1)) && file.mimetype.startsWith('audio/');

  if (isImage || isVideo || isAudio) {
    return cb(null, true);
  } else {
    cb(new Error('Only image, video, and audio files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
  fileFilter: fileFilter,
});

// All routes are protected by authentication middleware
router.route('/')
  .post(protect, upload.single('media'), uploadMedia) // POST /api/media - Upload media
  .get(protect, getMedia); // GET /api/media - Get user's media

router.route('/:id')
  .delete(protect, deleteMedia); // DELETE /api/media/:id - Delete media

module.exports = router;
