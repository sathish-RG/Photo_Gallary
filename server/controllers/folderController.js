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

    // Delete all photos in this folder
    const Photo = require('../models/Photo');
    const fs = require('fs');
    const path = require('path');
    
    const photos = await Photo.find({ folder: req.params.id });
    
    // Delete photo files from filesystem
    for (const photo of photos) {
      const filePath = path.join(__dirname, '..', photo.imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete photos from database
    await Photo.deleteMany({ folder: req.params.id });
    
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
