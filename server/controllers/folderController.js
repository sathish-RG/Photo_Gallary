const Folder = require('../models/Folder');
const bcrypt = require('bcryptjs');

/**
 * @desc    Create a new folder
 * @route   POST /api/folders
 * @access  Private (requires authentication)
 */
exports.createFolder = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a folder name',
      });
    }

    // Check if folder with same name already exists for this user
    const existingFolder = await Folder.findOne({
      name: name.trim(),
      user: req.user.id,
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        error: 'A folder with this name already exists',
      });
    }

    // Prepare folder data
    const folderData = {
      name: name.trim(),
      user: req.user.id,
    };

    // If password is provided, hash it and set isProtected to true
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      folderData.password = await bcrypt.hash(password, salt);
      folderData.isProtected = true;
    }

    // Create folder
    const folder = await Folder.create(folderData);

    res.status(201).json({
      success: true,
      data: folder,
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating folder',
    });
  }
};

/**
 * @desc    Get all folders for the logged-in user
 * @route   GET /api/folders
 * @access  Private (requires authentication)
 */
exports.getFolders = async (req, res) => {
  try {
    // Fetch only folders belonging to the logged-in user
    const folders = await Folder.find({ user: req.user.id }).sort({
      createdAt: -1, // Sort by newest first
    });

    res.status(200).json({
      success: true,
      count: folders.length,
      data: folders,
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching folders',
    });
  }
};

/**
 * @desc    Delete a folder (with password verification for protected folders)
 * @route   DELETE /api/folders/:id
 * @access  Private (requires authentication)
 */
exports.deleteFolder = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Find folder and explicitly select password field if needed
    const folder = await Folder.findById(req.params.id).select('+password');

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }

    // Make sure user owns the folder
    if (folder.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this folder',
      });
    }

    // If folder is protected, verify password
    if (folder.isProtected) {
      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password required to delete this protected folder',
        });
      }

      const isMatch = await bcrypt.compare(password, folder.password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Incorrect password',
        });
      }
    }

    // Delete all media in this folder
    const Media = require('../models/Media');
    
    // Delete media from database
    await Media.deleteMany({ folder: req.params.id });
    
    // Note: We are not deleting from Firebase Storage here.
    // To do that, we would need to store the storage path or use Firebase Admin SDK.
    
    // Delete folder
    await Folder.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Folder and all associated photos deleted successfully',
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting folder',
    });
  }
};


/**
 * @desc    Verify folder password
 * @route   POST /api/folders/:id/verify
 * @access  Private (requires authentication)
 */
exports.verifyFolderPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a password',
      });
    }

    // Find folder and explicitly select password field
    const folder = await Folder.findById(req.params.id).select('+password');

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }

    // Make sure user owns the folder
    if (folder.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this folder',
      });
    }

    // Check if folder is protected
    if (!folder.isProtected) {
      return res.status(400).json({
        success: false,
        error: 'This folder is not password protected',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, folder.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password verified successfully',
    });
  } catch (error) {
    console.error('Verify folder password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while verifying password',
    });
  }
};

/**
 * @desc    Get folder settings (watermark and download settings)
 * @route   GET /api/folders/:id/settings
 * @access  Private (requires authentication and ownership)
 */
exports.getFolderSettings = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }

    // Make sure user owns the folder
    if (folder.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this folder',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        watermarkSettings: folder.watermarkSettings,
        allowDownload: folder.allowDownload,
        allowClientSelection: folder.allowClientSelection || false,
      },
    });
  } catch (error) {
    console.error('Get folder settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching folder settings',
    });
  }
};

/**
 * @desc    Update folder settings (watermark and download settings)
 * @route   PUT /api/folders/:id/settings
 * @access  Private (requires authentication and ownership)
 */
exports.updateFolderSettings = async (req, res) => {
  try {
    const { watermarkSettings, allowDownload, allowClientSelection } = req.body;

    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }

    // Make sure user owns the folder
    if (folder.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this folder',
      });
    }

    // Update watermark settings if provided
    if (watermarkSettings !== undefined) {
      folder.watermarkSettings = {
        enabled: watermarkSettings.enabled !== undefined ? watermarkSettings.enabled : folder.watermarkSettings.enabled,
        text: watermarkSettings.text || folder.watermarkSettings.text,
        opacity: watermarkSettings.opacity !== undefined ? watermarkSettings.opacity : folder.watermarkSettings.opacity,
        position: watermarkSettings.position || folder.watermarkSettings.position,
        fontSize: watermarkSettings.fontSize || folder.watermarkSettings.fontSize,
      };
    }

    // Update download permission if provided
    if (allowDownload !== undefined) {
      folder.allowDownload = allowDownload;
    }

    // Update client selection permission if provided
    if (allowClientSelection !== undefined) {
      folder.allowClientSelection = allowClientSelection;
    }

    await folder.save();

    res.status(200).json({
      success: true,
      data: {
        watermarkSettings: folder.watermarkSettings,
        allowDownload: folder.allowDownload,
        allowClientSelection: folder.allowClientSelection,
      },
      message: 'Folder settings updated successfully',
    });
  } catch (error) {
    console.error('Update folder settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating folder settings',
    });
  }
};

/**
 * @desc    Track download event for a folder
 * @route   POST /api/folders/:id/download
 * @access  Public
 */
exports.trackDownload = async (req, res) => {
  try {
    const folder = await Folder.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Download tracked',
    });
  } catch (error) {
    console.error('Track download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track download',
    });
  }
};

/**
 * @desc    Get analytics for a specific folder
 * @route   GET /api/folders/:id/analytics
 * @access  Private
 */
exports.getFolderAnalytics = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }

    // Verify ownership
    if (folder.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view analytics for this folder',
      });
    }

    // Get selection count for this folder
    const SelectionList = require('../models/SelectionList');
    const selectionCount = await SelectionList.countDocuments({ folderId: folder._id });

    res.status(200).json({
      success: true,
      data: {
        folderName: folder.name,
        views: folder.views || 0,
        downloads: folder.downloads || 0,
        selections: selectionCount,
        createdAt: folder.createdAt,
      },
    });
  } catch (error) {
    console.error('Get folder analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
    });
  }
};

/**
 * @desc    Get analytics summary for all user's folders
 * @route   GET /api/folders/analytics/summary
 * @access  Private
 */
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user.id });

    // Calculate totals
    const totalViews = folders.reduce((sum, folder) => sum + (folder.views || 0), 0);
    const totalDownloads = folders.reduce((sum, folder) => sum + (folder.downloads || 0), 0);

    // Get total selections
    const SelectionList = require('../models/SelectionList');
    const folderIds = folders.map(f => f._id);
    const totalSelections = await SelectionList.countDocuments({ folderId: { $in: folderIds } });

    // Find most viewed folder
    const mostViewed = folders.reduce((max, folder) => 
      (folder.views || 0) > (max?.views || 0) ? folder : max
    , null);

    // Get folder analytics
    const folderAnalytics = await Promise.all(folders.map(async (folder) => {
      const selectionCount = await SelectionList.countDocuments({ folderId: folder._id });
      return {
        id: folder._id,
        name: folder.name,
        views: folder.views || 0,
        downloads: folder.downloads || 0,
        selections: selectionCount,
        createdAt: folder.createdAt,
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalFolders: folders.length,
          totalViews,
          totalDownloads,
          totalSelections,
          mostViewedFolder: mostViewed ? {
            id: mostViewed._id,
            name: mostViewed.name,
            views: mostViewed.views || 0,
          } : null,
        },
        folders: folderAnalytics,
      },
    });
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics summary',
    });
  }
};
