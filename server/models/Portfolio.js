const mongoose = require('mongoose');

/**
 * Portfolio Schema
 * Represents a photographer's public portfolio page
 * One-to-one relationship with User model
 */
const portfolioSchema = new mongoose.Schema({
  // Reference to User - one portfolio per user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Ensures one portfolio per user
  },
  // Unique slug for public URL (e.g., 'john-doe')
  slug: {
    type: String,
    required: [true, 'Please provide a slug'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens',
    ],
  },
  // Hero section at top of portfolio
  heroSection: {
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    backgroundImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media', // Reference to Media instead of URL
      default: null,
    },
  },
  // About section with bio and profile image
  aboutSection: {
    bio: {
      type: String,
      default: '',
    },
    profileImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media', // Reference to Media instead of URL
      default: null,
    },
    layoutVariant: {
      type: String,
      default: 'split-left',
      enum: ['split-left', 'split-right', 'centered-card', 'minimal-hero'],
    },
  },
  // Gallery items - individual photos with category tags
  galleryItems: [{
    media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  // Services section - for pricing/offerings
  services: [{
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: '📸', // Emoji or icon name
    },
  }],
  // Testimonials section
  testimonials: [{
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    quote: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  // Contact email for form submissions
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  // Section visibility toggles
  showSections: {
    showGallery: {
      type: Boolean,
      default: true,
    },
    showServices: {
      type: Boolean,
      default: false,
    },
    showTestimonials: {
      type: Boolean,
      default: false,
    },
    showAbout: {
      type: Boolean,
      default: true,
    },
    showContact: {
      type: Boolean,
      default: false,
    },
  },
  // Social media links - dynamic array
  socialLinks: [{
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'FiLink',
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  // Design configuration - comprehensive theming
  designConfig: {
    colors: {
      primary: {
        type: String,
        default: '#4f46e5',
      },
      background: {
        type: String,
        default: '#ffffff',
      },
      text: {
        type: String,
        default: '#1f2937',
      },
      accent: {
        type: String,
        default: '#8b5cf6',
      },
    },
    typography: {
      headingFont: {
        type: String,
        default: 'Playfair Display',
      },
      bodyFont: {
        type: String,
        default: 'Lato',
      },
    },
    borderRadius: {
      type: String,
      default: '12px',
    },
    profileImageStyle: {
      type: String,
      default: 'circle',
      enum: ['circle', 'square', 'rounded'],
    },
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Create index for faster slug lookups
portfolioSchema.index({ slug: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
