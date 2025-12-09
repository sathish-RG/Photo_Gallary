const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getBookings,
  createBooking,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');

const router = express.Router();

// Private routes (photographer)
router.get('/', protect, getBookings);
router.put('/:id/status', protect, updateBookingStatus);
router.delete('/:id', protect, cancelBooking);

// Public routes (clients)
router.post('/', createBooking);

module.exports = router;
