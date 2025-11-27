const mongoose = require('mongoose');

const AdminConfigSchema = new mongoose.Schema({
  sidebarColor: {
    type: String,
    default: '#1f2937' // gray-800
  },
  navbarColor: {
    type: String,
    default: '#ffffff'
  },
  fontFamily: {
    type: String,
    default: 'Inter, sans-serif'
  },
  showSidebar: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one config document exists
AdminConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('AdminConfig', AdminConfigSchema);
