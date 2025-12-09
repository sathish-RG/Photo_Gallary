const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user reference'],
  },
  name: {
    type: String,
    required: [true, 'Please provide service name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'Please provide service duration in minutes'],
    min: [15, 'Duration must be at least 15 minutes'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide service price'],
    min: [0, 'Price cannot be negative'],
  },
  depositAmount: {
    type: Number,
    required: [true, 'Please provide deposit amount'],
    min: [0, 'Deposit amount cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
serviceSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
