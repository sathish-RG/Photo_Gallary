const mongoose = require('mongoose');

/**
 * GiftCard Schema
 * Represents a digital gift card with selected media items, customization, and public sharing
 */
const giftCardSchema = new mongoose.Schema({
  // Reference to the User who created the gift card
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Reference to the Album/Folder this gift card was created from
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true,
    index: true, // For efficient querying of gifts by album
  },
  // Title of the gift card (e.g., "Happy Birthday!")
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  // Personal message/note
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  // Theme color for background (hex code)
  themeColor: {
    type: String,
    default: '#ec4899', // Default pink color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code'],
  },
  // Unique slug for public URL (generated with nanoid)
  uniqueSlug: {
    type: String,
    required: true,
    unique: true,
    index: true, // For fast lookups
  },
  // Password protection (optional)
  password: {
    type: String,
    select: false, // Do not return by default
  },
  isProtected: {
    type: Boolean,
    default: false,
  },
  // Array of media items with layout information
  mediaContent: [{
    // Reference to Media model
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
      required: true,
    },
    // Type of media
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true,
    },
    // Layout type for display
    layoutType: {
      type: String,
      enum: ['full-width', 'half-width', 'carousel-item'],
      default: 'full-width',
    },
    // Order position (for custom ordering)
    order: {
      type: Number,
      default: 0,
    },
  }],
  // Timestamp when gift card was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Timestamp when gift card was last updated
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient slug lookups
giftCardSchema.index({ uniqueSlug: 1 });

// Compound index for querying gift cards by album and sender
giftCardSchema.index({ albumId: 1, sender: 1 });

// Middleware to update updatedAt on save
// Middleware to update updatedAt on save
giftCardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('GiftCard', giftCardSchema);
