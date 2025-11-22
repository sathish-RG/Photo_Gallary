const mongoose = require('mongoose');

/**
 * Folder Schema
 * Represents a photo album/folder that belongs to a user
 */
const folderSchema = new mongoose.Schema({
  // Folder name
  name: {
    type: String,
    required: [true, 'Please provide a folder name'],
    trim: true,
  },
  // Reference to the User model - links folder to specific user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Optional password protection
  password: {
    type: String,
    select: false, // Don't include password in queries by default
  },
  // Flag to indicate if folder is password protected
  isProtected: {
    type: Boolean,
    default: false,
  },
  // Timestamp when folder was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to ensure folder names are unique per user
folderSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);
