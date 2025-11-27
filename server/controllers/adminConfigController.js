const AdminConfig = require('../models/AdminConfig');

// @desc    Get admin configuration
// @route   GET /api/admin/config
// @access  Private/Admin
exports.getAdminConfig = async (req, res) => {
  try {
    const config = await AdminConfig.getConfig();
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update admin configuration
// @route   PUT /api/admin/config
// @access  Private/Admin
exports.updateAdminConfig = async (req, res) => {
  try {
    let config = await AdminConfig.findOne();
    
    if (!config) {
      config = await AdminConfig.create(req.body);
    } else {
      config = await AdminConfig.findByIdAndUpdate(config._id, req.body, {
        new: true,
        runValidators: true
      });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
