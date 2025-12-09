const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
} = require('../controllers/scheduleEventController');

const router = express.Router();

// All routes are protected
router.route('/')
  .get(protect, getScheduleEvents)
  .post(protect, createScheduleEvent);

router.route('/:id')
  .put(protect, updateScheduleEvent)
  .delete(protect, deleteScheduleEvent);

module.exports = router;
