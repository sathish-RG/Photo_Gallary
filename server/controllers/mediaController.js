const Media = require('../models/Media');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
    const { 
      mediaUrl, 
      fileType, 
      mimeType, 
      fileSize, 
      fileName,
      caption, 
      folderId 
    } = req.body;

    if (!mediaUrl || !fileType || !mimeType || !fileName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required media information',
      });
    }

    // Create media document in database
    const media = await Media.create({
      user: req.user.id,
      filePath: mediaUrl, // Storing the Firebase URL directly
      fileType: fileType,
      mimeType: mimeType,
      fileSize: fileSize,
      caption: caption || '',
      folder: folderId || null,
    });

    res.status(201).json({
      success: true,
      data: media,
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while saving media info',
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
    const { applyWatermarkToImages } = require('../utils/cloudinaryHelper');
    const Folder = require('../models/Folder');
    
    // Build query - filter by user and optionally by folder
    const query = { user: req.user.id };
    
    if (folderId) {
      query.folder = folderId;
    }
    
    // Fetch media
    let media = await Media.find(query).sort({
      createdAt: -1, // Sort by newest first
    }).lean();

    // If folderId is provided, apply watermark transformations
    if (folderId) {
      const folder = await Folder.findById(folderId);
      if (folder) {
        // Apply watermark transformations based on folder settings
        media = applyWatermarkToImages(media, {
          watermarkSettings: folder.watermarkSettings,
          allowDownload: folder.allowDownload
        });
      }
    }

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
    console.log('Delete request received for ID:', req.params.id);
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

    // Delete from Cloudinary
    if (media.filePath) {
      try {
        // Extract public_id from URL
        // Example: https://res.cloudinary.com/cloudname/image/upload/v1234567890/folder/filename.jpg
        const urlParts = media.filePath.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        
        if (uploadIndex !== -1 && urlParts.length > uploadIndex + 1) {
          // Get parts after 'upload'
          let publicIdParts = urlParts.slice(uploadIndex + 1);
          
          // Remove version if present (starts with v)
          if (publicIdParts[0].startsWith('v')) {
            publicIdParts.shift();
          }
          
          // Join back to get path
          let publicId = publicIdParts.join('/');
          
          // Remove extension
          publicId = publicId.replace(/\.[^/.]+$/, "");
          
          console.log('Attempting to delete from Cloudinary, public_id:', publicId);
          
          await cloudinary.uploader.destroy(publicId, {
            resource_type: media.fileType === 'video' ? 'video' : 'image'
          });
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue to delete from DB even if Cloudinary fails
      }
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
