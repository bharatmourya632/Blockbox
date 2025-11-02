const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getCategories
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.get('/stats/categories', getCategories);

router.route('/')
  .get(getInventory)
  .post(createInventoryItem);

router.route('/:id')
  .get(getInventoryItem)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

module.exports = router;
