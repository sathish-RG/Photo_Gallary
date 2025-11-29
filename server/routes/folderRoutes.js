const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createFolder,
  getFolders,
  deleteFolder,
  verifyFolderPassword,
  getFolderSettings,
  updateFolderSettings,
} = require('../controllers/folderController');

const router = express.Router();

// All routes are protected by authentication middleware
router.route('/')
  .post(protect, createFolder) // POST /api/folders - Create folder
  .get(protect, getFolders); // GET /api/folders - Get user's folders

router.route('/:id')
  .delete(protect, deleteFolder); // DELETE /api/folders/:id - Delete folder

router.route('/:id/verify')
  .post(protect, verifyFolderPassword); // POST /api/folders/:id/verify - Verify folder password

router.route('/:id/settings')
  .get(protect, getFolderSettings) // GET /api/folders/:id/settings - Get folder settings
  .put(protect, updateFolderSettings); // PUT /api/folders/:id/settings - Update folder settings

module.exports = router;
