const User = require('../models/User');
const Folder = require('../models/Folder');
const Media = require('../models/Media');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // Optional: Add stats like total storage used or file count for each user
    // This might be expensive for many users, so we'll keep it simple for now
    // or do a separate aggregation if needed.

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
};

/**
 * @desc    Update user status (Ban/Unban)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    console.log('Update user status request:', { id, isActive, adminUser: req.user?._id });

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Prevent banning yourself
    if (req.user && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot ban yourself',
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: `User ${isActive ? 'activated' : 'banned'} successfully`,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status',
      details: error.message,
    });
  }
};

/**
 * @desc    Get specific user's content (folders and media)
 * @route   GET /api/admin/users/:id/content
 * @access  Private/Admin
 */
exports.getUserContent = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const folders = await Folder.find({ user: id }).sort({ createdAt: -1 });
    const media = await Media.find({ user: id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        folders,
        media,
      },
    });
  } catch (error) {
    console.error('Error fetching user content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user content',
    });
  }
};
