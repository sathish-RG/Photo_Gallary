const Client = require('../models/Client');

// @desc    Get all clients for authenticated user
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients',
    });
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client',
    });
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, address, notes } = req.body;

    // Check if client with same email already exists for this user
    const existingClient = await Client.findOne({
      email,
      createdBy: req.user._id,
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        error: 'Client with this email already exists',
      });
    }

    const client = await Client.create({
      name,
      email,
      phone,
      address,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create client',
    });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = async (req, res) => {
  try {
    const { name, email, phone, address, notes } = req.body;

    let client = await Client.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Check if email is being changed to an existing one
    if (email && email !== client.email) {
      const existingClient = await Client.findOne({
        email,
        createdBy: req.user._id,
        _id: { $ne: req.params.id },
      });

      if (existingClient) {
        return res.status(400).json({
          success: false,
          error: 'Client with this email already exists',
        });
      }
    }

    client = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, notes },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update client',
    });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    await client.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete client',
    });
  }
};
