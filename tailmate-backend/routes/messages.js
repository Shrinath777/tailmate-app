// backend/routes/messages.js - CREATE THIS FILE
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendMessage,
  getMessages,
  markAsRead
} = require('../controllers/messages');

// All routes are protected
router.use(auth);

// @route   POST /api/messages/:matchId
// @desc    Send a message in a match
// @access  Private
router.post('/:matchId', sendMessage);

// @route   GET /api/messages/:matchId
// @desc    Get messages for a match
// @access  Private
router.get('/:matchId', getMessages);

// @route   PUT /api/messages/:matchId/read
// @desc    Mark all messages as read in a match
// @access  Private
router.put('/:matchId/read', markAsRead);

module.exports = router;