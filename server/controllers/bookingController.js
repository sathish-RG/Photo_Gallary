const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { addMinutesToTime } = require('./availabilityController');

/**
 * @desc    Get all bookings for photographer
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = { photographer: req.user.id };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('service', 'name duration price')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
    });
  }
};

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Public
 */
exports.createBooking = async (req, res) => {
  try {
    const { photographerId, serviceId, clientName, clientEmail, clientPhone, date, timeSlot, notes } = req.body;

    // Validate required fields
    if (!photographerId || !serviceId || !clientName || !clientEmail || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields',
      });
    }

    // Get service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    // Calculate end time
    const endTime = addMinutesToTime(timeSlot, service.duration);

    // Check if slot is still available (race condition check)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingBooking = await Booking.findOne({
      photographer: photographerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          $and: [
            { timeSlot: { $lte: timeSlot } },
            { endTime: { $gt: timeSlot } }
          ]
        },
        {
          $and: [
            { timeSlot: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        error: 'This time slot is no longer available',
      });
    }

    // Create booking
    const booking = await Booking.create({
      photographer: photographerId,
      service: serviceId,
      clientName,
      clientEmail,
      clientPhone,
      date,
      timeSlot,
      endTime,
      notes,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    await booking.populate('service', 'name duration price depositAmount');

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
    });
  }
};

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id/status
 * @access  Private
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    // Check ownership
    if (booking.photographer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this booking',
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status',
    });
  }
};

/**
 * @desc    Cancel booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    // Check ownership
    if (booking.photographer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking',
    });
  }
};
