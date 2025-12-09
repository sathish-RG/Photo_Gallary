// In-memory store for tracking views by IP
const viewTracker = new Map();
const VIEW_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Cleanup old view tracking entries periodically
 */
const cleanupOldEntries = () => {
  const now = Date.now();
  for (const [key, timestamp] of viewTracker.entries()) {
    if (now - timestamp > VIEW_TIMEOUT) {
      viewTracker.delete(key);
    }
  }
};

// Run cleanup every 10 minutes
setInterval(cleanupOldEntries, 10 * 60 * 1000);

/**
 * Extract client IP address from request
 */
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown';
};

/**
 * Check if this IP has viewed this folder recently
 */
const hasRecentView = (folderId, ip) => {
  const key = `${folderId}-${ip}`;
  const lastView = viewTracker.get(key);
  
  if (!lastView) {
    return false;
  }
  
  const timeSinceLastView = Date.now() - lastView;
  return timeSinceLastView < VIEW_TIMEOUT;
};

/**
 * Record a view for this folder and IP
 */
const recordView = (folderId, ip) => {
  const key = `${folderId}-${ip}`;
  viewTracker.set(key, Date.now());
};

/**
 * Middleware to track folder views
 * Prevents duplicate counts from same IP within timeout window
 */
const trackView = async (req, res, next) => {
  try {
    const folderId = req.params.id;
    const clientIP = getClientIP(req);
    
    // Check if this IP has viewed this folder recently
    if (!hasRecentView(folderId, clientIP)) {
      // Increment view count in database
      const Folder = require('../models/Folder');
      await Folder.findByIdAndUpdate(
        folderId,
        { $inc: { views: 1 } },
        { new: false }
      );
      
      // Record this view
      recordView(folderId, clientIP);
    }
    
    next();
  } catch (error) {
    // Don't fail the request if view tracking fails
    console.error('View tracking error:', error);
    next();
  }
};

module.exports = {
  trackView,
  getClientIP,
  hasRecentView,
  recordView,
};
