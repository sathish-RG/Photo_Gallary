const ScheduleEvent = require('../models/ScheduleEvent');

/**
 * @desc    Get all schedule events for user
 * @route   GET /api/schedule-events
 * @access  Private
 */
exports.getScheduleEvents = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = { user: req.user.id };
    
    // Optional date range filtering
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const events = await ScheduleEvent.find(filter).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Get schedule events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedule events',
    });
  }
};

/**
 * @desc    Create schedule event
 * @route   POST /api/schedule-events
 * @access  Private
 */
exports.createScheduleEvent = async (req, res) => {
  try {
    const { eventName, date, startTime, endTime, description, isAvailable, color } = req.body;

    const event = await ScheduleEvent.create({
      user: req.user.id,
      eventName,
      date,
      startTime,
      endTime,
      description,
      isAvailable,
      color,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Create schedule event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create schedule event',
    });
  }
};

/**
 * @desc    Update schedule event
 * @route   PUT /api/schedule-events/:id
 * @access  Private
 */
exports.updateScheduleEvent = async (req, res) => {
  try {
    let event = await ScheduleEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // Check ownership
    if (event.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this event',
      });
    }

    event = await ScheduleEvent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Update schedule event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update schedule event',
    });
  }
};

/**
 * @desc    Delete schedule event
 * @route   DELETE /api/schedule-events/:id
 * @access  Private
 */
exports.deleteScheduleEvent = async (req, res) => {
  try {
    const event = await ScheduleEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // Check ownership
    if (event.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this event',
      });
    }

    await ScheduleEvent.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete schedule event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete schedule event',
    });
  }
};
