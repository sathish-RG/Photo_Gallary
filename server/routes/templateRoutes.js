const express = require('express');
const {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate
} = require('../controllers/templateController');

const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router
  .route('/')
  .get(getAllTemplates)
  .post(protect, adminMiddleware, createTemplate);

router
  .route('/:id')
  .get(getTemplateById)
  .put(protect, adminMiddleware, updateTemplate)
  .delete(protect, adminMiddleware, deleteTemplate);

module.exports = router;
