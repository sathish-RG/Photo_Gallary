const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoicePDF,
} = require('../controllers/invoiceController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice);

// PDF generation route
router.route('/generate/:id')
  .get(generateInvoicePDF);

module.exports = router;
