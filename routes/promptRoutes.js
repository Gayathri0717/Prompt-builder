const express = require('express');
const router = express.Router();
const { getPrompts, createPrompt, updatePrompt, deletePrompt } = require('../controllers/promptController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPrompts)
  .post(protect, createPrompt);

router.route('/:id')
  .put(protect, updatePrompt)
  .delete(protect, deletePrompt);

module.exports = router;
