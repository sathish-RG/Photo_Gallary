const express = require('express');
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware');
const {
  createTransfer,
  createTransferFromMedia,
  getTransferBySlug,
  downloadTransferZip,
  getUserTransfers,
  deleteTransfer,
} = require('../controllers/transferController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/transfers/'); // Temporary storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
    files: 10, // Max 10 files per upload
  },
});

// Protected routes (require authentication)
router.post('/', protect, upload.array('files', 10), createTransfer);
router.post('/from-media', protect, createTransferFromMedia);
router.get('/user', protect, getUserTransfers);
router.delete('/:id', protect, deleteTransfer);

// Public routes (no authentication required)
router.get('/:slug', getTransferBySlug);
router.get('/:slug/download', downloadTransferZip);

module.exports = router;
