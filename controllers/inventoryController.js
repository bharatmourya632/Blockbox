const Inventory = require('../models/Inventory');

// @desc    Get all inventory items for logged in user
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
  try {
    const { category, isActive, lowStock, search, page = 1, limit = 20 } = req.query;

    let query = { user: req.user.id };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Filter for low stock items
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$lowStockAlert'] };
    }

    // Search by name or SKU
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Inventory.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Inventory.countDocuments(query);

    // Calculate total inventory value
    const allItems = await Inventory.find({ user: req.user.id, isActive: true });
    const totalValue = allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCost = allItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

    res.status(200).json({
      success: true,
      count: items.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalValue,
      totalCost,
      items
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Make sure user owns item
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this item'
      });
    }

    res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
exports.createInventoryItem = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;

    const item = await Inventory.create(req.body);

    res.status(201).json({
      success: true,
      item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventoryItem = async (req, res) => {
  try {
    let item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Make sure user owns item
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Make sure user owns item
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get inventory categories
// @route   GET /api/inventory/stats/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const categories = await Inventory.distinct('category', { user: req.user.id });

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
