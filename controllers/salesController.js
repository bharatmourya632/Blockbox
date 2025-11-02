const Invoice = require('../models/Invoice');

// @desc    Get sales analytics
// @route   GET /api/sales/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = { user: req.user.id };

    // Filter by date range
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get all invoices for the period
    const invoices = await Invoice.find(dateFilter);

    // Calculate total revenue (only paid invoices)
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Calculate pending amount
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent');
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Calculate total invoices by status
    const invoicesByStatus = {
      draft: invoices.filter(inv => inv.status === 'draft').length,
      sent: invoices.filter(inv => inv.status === 'sent').length,
      paid: invoices.filter(inv => inv.status === 'paid').length,
      cancelled: invoices.filter(inv => inv.status === 'cancelled').length
    };

    // Calculate monthly revenue (last 12 months)
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthInvoices = paidInvoices.filter(inv => {
        const invDate = new Date(inv.paidDate || inv.createdAt);
        return invDate >= monthStart && invDate <= monthEnd;
      });

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: revenue,
        count: monthInvoices.length
      });
    }

    // Top customers by revenue
    const customerRevenue = {};
    paidInvoices.forEach(inv => {
      if (!customerRevenue[inv.customerName]) {
        customerRevenue[inv.customerName] = {
          name: inv.customerName,
          email: inv.customerEmail,
          totalRevenue: 0,
          invoiceCount: 0
        };
      }
      customerRevenue[inv.customerName].totalRevenue += inv.total;
      customerRevenue[inv.customerName].invoiceCount += 1;
    });

    const topCustomers = Object.values(customerRevenue)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Average invoice value
    const avgInvoiceValue = paidInvoices.length > 0
      ? totalRevenue / paidInvoices.length
      : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        pendingAmount,
        totalInvoices: invoices.length,
        paidInvoices: paidInvoices.length,
        avgInvoiceValue,
        invoicesByStatus,
        monthlyRevenue,
        topCustomers
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales history
// @route   GET /api/sales/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = { user: req.user.id, status: 'paid' };

    if (status) {
      query.status = status;
    }

    const invoices = await Invoice.find(query)
      .sort({ paidDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('invoiceNumber customerName total status paidDate createdAt');

    const count = await Invoice.countDocuments(query);

    res.status(200).json({
      success: true,
      count: invoices.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      history: invoices
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard summary
// @route   GET /api/sales/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // This month's data
    const thisMonthInvoices = await Invoice.find({
      user: req.user.id,
      createdAt: { $gte: thisMonthStart }
    });

    const thisMonthRevenue = thisMonthInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    // Last month's data
    const lastMonthInvoices = await Invoice.find({
      user: req.user.id,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });

    const lastMonthRevenue = lastMonthInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    // Calculate growth
    const revenueGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    // Recent invoices
    const recentInvoices = await Invoice.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('invoiceNumber customerName total status createdAt');

    // Pending invoices
    const pendingInvoices = await Invoice.find({
      user: req.user.id,
      status: 'sent'
    }).countDocuments();

    res.status(200).json({
      success: true,
      dashboard: {
        thisMonthRevenue,
        lastMonthRevenue,
        revenueGrowth: revenueGrowth.toFixed(2),
        totalInvoices: thisMonthInvoices.length,
        pendingInvoices,
        recentInvoices
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
