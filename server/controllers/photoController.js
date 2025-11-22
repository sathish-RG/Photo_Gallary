const Photo = require('../models/Photo');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Upload a new photo
 * @route   POST /api/photos
 * @access  Private (requires authentication)
 */
exports.uploadPhoto = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file',
      });
    }

    // Get caption and folderId from request body (optional)
    const { caption, folderId } = req.body;

    // Create photo document in database
    const photo = await Photo.create({
      user: req.user.id, // From auth middleware
      imagePath: `/uploads/${req.file.filename}`,
      caption: caption || '',
      folder: folderId || null, // Link to folder if provided
    });

    res.status(201).json({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while uploading photo',
    });
  }
};

/**
 * @desc    Get all photos for the logged-in user (optionally filtered by folder)
 * @route   GET /api/photos?folderId=xxx
 * @access  Private (requires authentication)
 */
exports.getPhotos = async (req, res) => {
  try {
    const { folderId } = req.query;
    
    // Build query - filter by user and optionally by folder
    const query = { user: req.user.id };
    
    if (folderId) {
      query.folder = folderId;
    }
    
    // Fetch photos
    const photos = await Photo.find(query).sort({
      createdAt: -1, // Sort by newest first
    });

    res.status(200).json({
      success: true,
      count: photos.length,
      data: photos,
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching photos',
    });
  }
};

/**
 * @desc    Delete a photo
 * @route   DELETE /api/photos/:id
 * @access  Private (requires authentication)
 */
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found',
      });
    }

    // Make sure user owns the photo
    if (photo.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this photo',
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', photo.imagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete photo from database
    await Photo.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting photo',
    });
  }
};
