const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  // The two pets being matched
  pet1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  pet2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  // The users who own the pets
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'connected'],
    default: 'pending'
  },
  // Who initiated the match
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Compatibility score for better matching
  compatibilityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Track interactions
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // When both users accepted (became connected)
  connectedAt: {
    type: Date
  },
  // For real-time messaging
  lastMessageAt: {
    type: Date
  },
  unreadCount: {
    user1: { type: Number, default: 0 },
    user2: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Ensure unique matches between same pets
matchSchema.index({ pet1: 1, pet2: 1 }, { unique: true });

// Compound index for efficient querying
matchSchema.index({ user1: 1, status: 1 });
matchSchema.index({ user2: 1, status: 1 });
matchSchema.index({ initiator: 1, status: 1 });

// Virtual for getting the other user in the match
matchSchema.virtual('otherUser').get(function() {
  return this.user1.toString() === this.initiator.toString() ? this.user2 : this.user1;
});

// Virtual for getting the other pet in the match
matchSchema.virtual('otherPet').get(function() {
  return this.pet1.toString() === this.initiator.toString() ? this.pet2 : this.pet1;
});

// Method to check if user is in this match
matchSchema.methods.hasUser = function(userId) {
  return this.user1.toString() === userId || this.user2.toString() === userId;
};

// Method to get the other user in the match
matchSchema.methods.getOtherUser = function(userId) {
  return this.user1.toString() === userId ? this.user2 : this.user1;
};

// Method to get the other pet in the match
matchSchema.methods.getOtherPet = function(userId) {
  return this.pet1.ownerId.toString() === userId ? this.pet2 : this.pet1;
};

// Static method to update last message timestamp
matchSchema.statics.updateLastMessage = async function(matchId) {
  await this.findByIdAndUpdate(matchId, { 
    lastMessageAt: new Date(),
    lastActivity: new Date()
  });
};

module.exports = mongoose.model('Match', matchSchema);