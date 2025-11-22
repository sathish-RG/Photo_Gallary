const mongoose = require('mongoose');

/**
 * Photo Schema
 * Stores photo information with reference to the user who uploaded it
 */
const photoSchema = new mongoose.Schema({
  // Reference to the User model - links photo to specific user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Path/URL where the image file is stored
  imagePath: {
    type: String,
    required: [true, 'Please provide an image path'],
  },
  // Optional caption for the photo
  caption: {
    type: String,
    default: '',
  },
  // Reference to the Folder model - links photo to specific folder
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null, // null means photo is not in any folder
  },
  // Timestamp when photo was uploaded
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Photo', photoSchema);
