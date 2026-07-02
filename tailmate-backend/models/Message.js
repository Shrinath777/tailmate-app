const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text'
  },
  // For media messages
  mediaUrl: String,
  // Read receipts
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Delivery status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, {
  timestamps: true
});

// Index for efficient message retrieval
messageSchema.index({ matchId: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

// Method to mark message as read by user
messageSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(read => read.user.toString() === userId.toString());
  if (!alreadyRead) {
    this.readBy.push({ user: userId });
    this.status = 'read';
  }
  return this.save();
};

// Static method to get unread count for a user
messageSchema.statics.getUnreadCount = async function(matchId, userId) {
  return this.countDocuments({
    matchId,
    sender: { $ne: userId },
    'readBy.user': { $ne: userId }
  });
};

module.exports = mongoose.model('Message', messageSchema);