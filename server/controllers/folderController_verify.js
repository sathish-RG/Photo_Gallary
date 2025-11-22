
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
