const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createGiftCard,
  getGiftCardBySlug,
  getAlbumGiftCards,
  updateGiftCard,
  deleteGiftCard,
  unlockGiftCard,
} = require('../controllers/giftCardController');

// Protected routes - require authentication
router.post('/', protect, createGiftCard);
router.get('/album/:albumId', protect, getAlbumGiftCards);
router.put('/:id', protect, updateGiftCard);
router.delete('/:id', protect, deleteGiftCard);

// Public route - no authentication required
router.get('/view/:slug', getGiftCardBySlug);
router.post('/unlock/:slug', unlockGiftCard);

module.exports = router;
