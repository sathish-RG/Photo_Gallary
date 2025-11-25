const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const {
  getAllUsers,
  updateUserStatus,
  getUserContent,
} = require('../controllers/adminController');

// All routes are protected and require admin privileges
router.use(protect);
router.use(adminMiddleware);

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/reported', (req, res) => {
  // Placeholder for reported content management
  res.status(200).json({ success: true, data: [] });
});

router.get('/users/:id/content', getUserContent);

module.exports = router;
