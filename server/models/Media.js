const mongoose = require('mongoose');

/**
 * Media Schema
 * Stores media files (images, videos, audio) with reference to the user who uploaded them
 */
const mediaSchema = new mongoose.Schema({
  // Reference to the User model - links media to specific user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Path/URL where the media file is stored
  filePath: {
    type: String,
    required: [true, 'Please provide a file path'],
  },
  // Type of media file
  fileType: {
    type: String,
    enum: ['image', 'video', 'audio'],
    required: [true, 'Please provide a file type'],
  },
  // MIME type of the uploaded file
  mimeType: {
    type: String,
    required: true,
  },
  // File size in bytes
  fileSize: {
    type: Number,
    required: true,
  },
  // Optional caption for the media
  caption: {
    type: String,
    default: '',
  },
  // Reference to the Folder model - links media to specific folder
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null, // null means media is not in any folder
  },
  // Timestamp when media was uploaded
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Media', mediaSchema);
