const mongoose = require('mongoose');

const selectionSchema = new mongoose.Schema({
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: [true, 'Please provide folder reference'],
  },
  clientName: {
    type: String,
    required: [true, 'Please provide client name'],
    trim: true,
  },
  clientEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  selectedMedia: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
  }],
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['submitted'],
    default: 'submitted',
  },
}, {
  timestamps: true,
});

// Index for faster queries
selectionSchema.index({ folder: 1, createdAt: -1 });

module.exports = mongoose.model('Selection', selectionSchema);
