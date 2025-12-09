const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getServices,
  getPublicServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');

const router = express.Router();

// Private routes (photographer)
router.route('/')
  .get(protect, getServices)
  .post(protect, createService);

router.route('/:id')
  .put(protect, updateService)
  .delete(protect, deleteService);

// Public routes
router.get('/public/:photographerId', getPublicServices);

module.exports = router;
