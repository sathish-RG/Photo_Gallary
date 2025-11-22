const Media = require('../models/Media');
const path = require('path');
const fs = require('fs');

/**
 * Helper function to determine file type from MIME type
 */
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return null;
};

/**
 * @desc    Upload a new media file
 * @route   POST /api/media
 * @access  Private (requires authentication)
 */
exports.uploadMedia = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a media file',
      });
    }

    // Get caption and folderId from request body (optional)
    const { caption, folderId } = req.body;

    // Determine file type from MIME type
    const fileType = getFileType(req.file.mimetype);
    
    if (!fileType) {
      // Delete the uploaded file if type is not supported
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        error: 'Unsupported file type',
      });
    }

    // Create media document in database
    const media = await Media.create({
      user: req.user.id, // From auth middleware
      filePath: `/uploads/${req.file.filename}`,
      fileType: fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      caption: caption || '',
      folder: folderId || null, // Link to folder if provided
    });

    res.status(201).json({
      success: true,
      data: media,
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while uploading media',
    });
  }
};

/**
 * @desc    Get all media for the logged-in user (optionally filtered by folder)
 * @route   GET /api/media?folderId=xxx
 * @access  Private (requires authentication)
 */
exports.getMedia = async (req, res) => {
  try {
    const { folderId } = req.query;
    
    // Build query - filter by user and optionally by folder
    const query = { user: req.user.id };
    
    if (folderId) {
      query.folder = folderId;
    }
    
    // Fetch media
    const media = await Media.find(query).sort({
      createdAt: -1, // Sort by newest first
    });

    res.status(200).json({
      success: true,
      count: media.length,
      data: media,
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching media',
    });
  }
};

/**
 * @desc    Delete a media file
 * @route   DELETE /api/media/:id
 * @access  Private (requires authentication)
 */
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found',
      });
    }

    // Make sure user owns the media
    if (media.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this media',
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', media.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete media from database
    await Media.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting media',
    });
  }
};
