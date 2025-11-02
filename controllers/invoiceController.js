const Invoice = require('../models/Invoice');

// @desc    Get all invoices for logged in user
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    let query = { user: req.user.id };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Invoice.countDocuments(query);

    res.status(200).json({
      success: true,
      count: invoices.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      invoices
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Make sure user owns invoice
    if (invoice.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this invoice'
      });
    }

    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    // Generate invoice number
    const lastInvoice = await Invoice.findOne({ user: req.user.id })
      .sort({ createdAt: -1 });

    let invoiceNumber;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
      invoiceNumber = `INV-${String(lastNumber + 1).padStart(5, '0')}`;
    } else {
      invoiceNumber = 'INV-00001';
    }

    // Add user to request body
    req.body.user = req.user.id;
    req.body.invoiceNumber = invoiceNumber;

    // Calculate totals
    let subtotal = 0;
    if (req.body.items && req.body.items.length > 0) {
      req.body.items.forEach(item => {
        item.total = item.quantity * item.price;
        subtotal += item.total;
      });
    }

    req.body.subtotal = subtotal;

    const taxAmount = (subtotal * (req.body.taxRate || 0)) / 100;
    req.body.tax = taxAmount;

    req.body.total = subtotal + taxAmount - (req.body.discount || 0);

    const invoice = await Invoice.create(req.body);

    res.status(201).json({
      success: true,
      invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
  try {
    let invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Make sure user owns invoice
    if (invoice.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this invoice'
      });
    }

    // Recalculate totals if items are updated
    if (req.body.items) {
      let subtotal = 0;
      req.body.items.forEach(item => {
        item.total = item.quantity * item.price;
        subtotal += item.total;
      });
      req.body.subtotal = subtotal;

      const taxAmount = (subtotal * (req.body.taxRate || invoice.taxRate || 0)) / 100;
      req.body.tax = taxAmount;

      req.body.total = subtotal + taxAmount - (req.body.discount || invoice.discount || 0);
    }

    invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Make sure user owns invoice
    if (invoice.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this invoice'
      });
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
