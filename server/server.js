const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

// Start cleanup cron job for expired transfers
// TODO: Uncomment after node-cron installation completes
// const cleanupJob = require('./jobs/cleanupJob');
// cleanupJob.startCleanupJob();

// Start booking reminder cron job
const bookingReminderJob = require('./jobs/bookingReminderJob');
bookingReminderJob.startBookingReminderJob();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
