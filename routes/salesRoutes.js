const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getHistory,
  getDashboard
} = require('../controllers/salesController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.get('/analytics', getAnalytics);
router.get('/history', getHistory);
router.get('/dashboard', getDashboard);

module.exports = router;
