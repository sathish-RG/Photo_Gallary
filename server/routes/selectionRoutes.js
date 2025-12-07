const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createSelection,
  getSelectionsByFolder,
  updateSelectionStatus
} = require('../controllers/selectionController');

const router = express.Router();

// Public route for clients to submit selections
router.post('/', createSelection);

// Protected routes for photographers
router.get('/folder/:folderId', protect, getSelectionsByFolder);
router.put('/:id/status', protect, updateSelectionStatus);

module.exports = router;
