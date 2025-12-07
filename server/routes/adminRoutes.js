const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { generateBatch, getConfig, updateConfig, getUsers, getUserContent } = require('../controllers/adminController');

// All routes are protected and require admin privileges
router.use(protect);
router.use(admin);

router.post('/generate-batch', generateBatch);
router.get('/config', getConfig);
router.put('/config', updateConfig);
router.get('/users', getUsers);
router.get('/users/:id/content', getUserContent);

module.exports = router;
