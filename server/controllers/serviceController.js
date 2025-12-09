const Service = require('../models/Service');

/**
 * @desc    Get all services for logged-in photographer
 * @route   GET /api/services
 * @access  Private
 */
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
    });
  }
};

/**
 * @desc    Get active services for a photographer (public)
 * @route   GET /api/services/public/:photographerId
 * @access  Public
 */
exports.getPublicServices = async (req, res) => {
  try {
    const services = await Service.find({
      user: req.params.photographerId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error('Get public services error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
    });
  }
};

/**
 * @desc    Create new service
 * @route   POST /api/services
 * @access  Private
 */
exports.createService = async (req, res) => {
  try {
    const { name, description, duration, price, depositAmount } = req.body;

    const service = await Service.create({
      user: req.user.id,
      name,
      description,
      duration,
      price,
      depositAmount,
    });

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service',
    });
  }
};

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 * @access  Private
 */
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    // Check ownership
    if (service.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this service',
      });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service',
    });
  }
};

/**
 * @desc    Delete service
 * @route   DELETE /api/services/:id
 * @access  Private
 */
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    // Check ownership
    if (service.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this service',
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service',
    });
  }
};
