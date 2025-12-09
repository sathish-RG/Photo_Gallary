const cron = require('node-cron');
const Transfer = require('../models/Transfer');
const cloudinary = require('cloudinary').v2;

/**
 * Clean up expired transfers
 * Deletes files from Cloudinary and updates transfer status
 */
async function cleanExpiredTransfers() {
  try {
    console.log('Running expired transfers cleanup job...');

    // Find expired transfers that are still active
    const expiredTransfers = await Transfer.find({
      expiryDate: { $lt: new Date() },
      status: 'active',
    });

    let cleanedCount = 0;
    let errorCount = 0;

    for (const transfer of expiredTransfers) {
      try {
        // Delete files from Cloudinary
        for (const file of transfer.files) {
          try {
            await cloudinary.uploader.destroy(file.publicId, {
              resource_type: 'raw',
            });
          } catch (deleteError) {
            console.error(`Error deleting file ${file.publicId}:`, deleteError.message);
          }
        }

        // Update transfer status to expired
        transfer.status = 'expired';
        await transfer.save();
        
        cleanedCount++;
      } catch (error) {
        console.error(`Error cleaning transfer ${transfer._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(` Cleanup complete: ${cleanedCount} transfers cleaned, ${errorCount} errors`);
    
    return {
      success: true,
      cleaned: cleanedCount,
      errors: errorCount,
    };
  } catch (error) {
    console.error('Cleanup job error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Schedule cleanup job to run daily at midnight
 * Cron expression: '0 0 * * *' = every day at 00:00
 */
function startCleanupJob() {
  // Run every day at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('Starting scheduled cleanup job at:', new Date().toISOString());
    cleanExpiredTransfers();
  });

  console.log('Transfer cleanup cron job scheduled (runs daily at midnight)');
}

// Export functions
module.exports = {
  cleanExpiredTransfers,
  startCleanupJob,
};
