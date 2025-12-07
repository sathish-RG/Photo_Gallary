const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createGiftCard,
  getGiftCardBySlug,
  getAlbumGiftCards,
  getUserGiftCards,
  updateGiftCard,
  deleteGiftCard,
  unlockGiftCard,

  downloadGiftCardPhotos,
  checkClaimStatus,
} = require('../controllers/giftCardController');

// Protected routes - require authentication
router.post('/', protect, createGiftCard);
router.get('/', protect, getUserGiftCards);
router.get('/album/:albumId', protect, getAlbumGiftCards);
router.put('/:id', protect, updateGiftCard);
router.delete('/:id', protect, deleteGiftCard);

// Public route - no authentication required
router.get('/view/:slug', getGiftCardBySlug);
router.post('/unlock/:slug', unlockGiftCard);
router.post('/download-zip/:slug', downloadGiftCardPhotos);
router.get('/claim-status/:qrCodeId', checkClaimStatus);

module.exports = router;
