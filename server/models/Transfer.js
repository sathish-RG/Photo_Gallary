const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const transferSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user reference'],
  },
  files: [{
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
    },
  }],
  message: {
    type: String,
    trim: true,
  },
  recipientEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please provide expiry date'],
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  maxDownloads: {
    type: Number,
    default: null, // null means unlimited
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'deleted'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Generate unique slug before saving
transferSchema.pre('save', async function() {
  if (!this.slug) {
    this.slug = nanoid(10); // 10 character unique ID
  }
});

// Index for faster queries
transferSchema.index({ slug: 1 });
transferSchema.index({ user: 1, createdAt: -1 });
transferSchema.index({ expiryDate: 1, status: 1 });

// Virtual for total file size
transferSchema.virtual('totalSize').get(function() {
  return this.files.reduce((total, file) => total + file.fileSize, 0);
});

// Virtual for files count
transferSchema.virtual('filesCount').get(function() {
  return this.files.length;
});

// Check if transfer is expired
transferSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate || this.status === 'expired';
};

// Check if download limit reached
transferSchema.methods.hasReachedDownloadLimit = function() {
  if (this.maxDownloads === null) return false;
  return this.downloadCount >= this.maxDownloads;
};

module.exports = mongoose.model('Transfer', transferSchema);
