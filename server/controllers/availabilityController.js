const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

/**
 * @desc    Get availability for logged-in photographer
 * @route   GET /api/availability
 * @access  Private
 */
exports.getAvailability = async (req, res) => {
  try {
    let availability = await Availability.findOne({ user: req.user.id });

    // If no availability exists, create default
    if (!availability) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      availability = await Availability.create({
        user: req.user.id,
        days: days.map(day => ({
          day,
          isAvailable: false,
          slots: [],
        })),
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability',
    });
  }
};

/**
 * @desc    Update availability
 * @route   PUT /api/availability
 * @access  Private
 */
exports.updateAvailability = async (req, res) => {
  try {
    const { days, timezone } = req.body;

    let availability = await Availability.findOne({ user: req.user.id });

    if (!availability) {
      availability = await Availability.create({
        user: req.user.id,
        days,
        timezone: timezone || 'UTC',
      });
    } else {
      availability.days = days;
      if (timezone) availability.timezone = timezone;
      await availability.save();
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update availability',
    });
  }
};

/**
 * Helper function to parse time string to minutes
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Helper function to add minutes to time string
 */
const addMinutesToTime = (timeStr, minutesToAdd) => {
  const totalMinutes = timeToMinutes(timeStr) + minutesToAdd;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Helper function to check if two time ranges overlap
 */
const timesOverlap = (start1, end1, start2, end2) => {
  const start1Mins = timeToMinutes(start1);
  const end1Mins = timeToMinutes(end1);
  const start2Mins = timeToMinutes(start2);
  const end2Mins = timeToMinutes(end2);

  return start1Mins < end2Mins && end1Mins > start2Mins;
};

/**
 * @desc    Get available time slots for a specific date and service
 * @route   GET /api/availability/:photographerId/slots
 * @access  Public
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { photographerId } = req.params;
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Please provide serviceId and date',
      });
    }

    // Get service to know duration
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    // Get availability
    const availability = await Availability.findOne({ user: photographerId });
    if (!availability) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Get day of week
    const requestDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[requestDate.getDay()];

    // Get slots for that day
    const daySchedule = availability.days.find(d => d.day === dayOfWeek);
    if (!daySchedule || !daySchedule.isAvailable || daySchedule.slots.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Get existing bookings for that date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      photographer: photographerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    });

    // Filter available slots
    const availableSlots = daySchedule.slots.filter(slot => {
      const slotEnd = addMinutesToTime(slot, service.duration);

      // Check if this slot conflicts with any existing booking
      const hasConflict = bookings.some(booking => {
        return timesOverlap(slot, slotEnd, booking.timeSlot, booking.endTime);
      });

      return !hasConflict;
    });

    res.status(200).json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available slots',
    });
  }
};

// Export helper function for use in booking controller
exports.addMinutesToTime = addMinutesToTime;

