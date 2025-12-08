const express = require('express');
const router = express.Router();
const {
  upsertPortfolio,
  getPortfolioBySlug,
  getMyPortfolio,
} = require('../controllers/portfolioController');
const { protect } = require('../middlewares/authMiddleware');

// Private routes (require authentication)
router.post('/', protect, upsertPortfolio);
router.get('/my/portfolio', protect, getMyPortfolio);

// Public routes (must come AFTER specific routes to avoid conflicts)
router.get('/:slug', getPortfolioBySlug);

module.exports = router;
