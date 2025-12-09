const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getAvailability,
  updateAvailability,
  getAvailableSlots,
} = require('../controllers/availabilityController');

const router = express.Router();

// Private routes (photographer)
router.route('/')
  .get(protect, getAvailability)
  .put(protect, updateAvailability);

// Public routes
router.get('/:photographerId/slots', getAvailableSlots);

module.exports = router;
