const cron = require('node-cron');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

/**
 * Check for upcoming bookings and create reminders
 * Runs daily to check bookings happening tomorrow
 */
async function checkUpcomingBookings() {
  try {
    console.log('Checking for upcoming bookings...');

    // Get tomorrow's date range
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Find bookings for tomorrow
    const upcomingBookings = await Booking.find({
      date: { $gte: tomorrow, $lte: endOfTomorrow },
      status: 'confirmed',
    }).populate('service photographer');

    console.log(`Found ${upcomingBookings.length} bookings for tomorrow`);

    // Create notifications for each booking
    for (const booking of upcomingBookings) {
      // Check if reminder already exists
      const existingReminder = await Notification.findOne({
        user: booking.photographer._id,
        relatedBooking: booking._id,
        type: 'booking_reminder',
      });

      if (!existingReminder) {
        await Notification.create({
          user: booking.photographer._id,
          type: 'booking_reminder',
          title: 'Upcoming Booking Tomorrow',
          message: `You have a ${booking.service.name} session with ${booking.clientName} tomorrow at ${booking.timeSlot}`,
          relatedBooking: booking._id,
          reminderDate: tomorrow,
        });
        console.log(`Created reminder for booking ${booking._id}`);
      }
    }

    console.log('✓ Booking reminder check complete');
  } catch (error) {
    console.error('Error checking upcoming bookings:', error);
  }
}

/**
 * Start the booking reminder cron job
 * Runs daily at 9:00 AM to check tomorrow's bookings
 */
function startBookingReminderJob() {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    console.log('Running booking reminder job at:', new Date().toISOString());
    checkUpcomingBookings();
  });

  console.log('✓ Booking reminder cron job scheduled (runs daily at 9:00 AM)');
  
  // Run immediately on startup for testing
  checkUpcomingBookings();
}

module.exports = {
  checkUpcomingBookings,
  startBookingReminderJob,
};
