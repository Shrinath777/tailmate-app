const Match = require('../models/Match');
const Pet = require('../models/Pet');
const User = require('../models/User');

// Get user's matches with last message info
exports.getUserMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'connected'
    })
    .populate('user1', 'name')
    .populate('user2', 'name')
    .populate('pet1', 'name breed images')
    .populate('pet2', 'name breed images')
    .sort({ lastMessageAt: -1, createdAt: -1 });

    // Get last message for each match
    const matchesWithLastMessage = await Promise.all(
      matches.map(async (match) => {
        const Message = require('../models/Message');
        const lastMessage = await Message.findOne({ matchId: match._id })
          .sort({ createdAt: -1 })
          .populate('sender', 'name')
          .lean();

        const otherUser = match.user1._id.toString() === userId ? match.user2 : match.user1;
        const otherPet = match.pet1.ownerId.toString() === userId ? match.pet2 : match.pet1;

        return {
          _id: match._id,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name
          },
          otherPet: {
            _id: otherPet._id,
            name: otherPet.name,
            breed: otherPet.breed,
            image: otherPet.images[0] || null
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            sender: lastMessage.sender,
            timestamp: lastMessage.createdAt
          } : null,
          unreadCount: match.user1._id.toString() === userId ? match.unreadCount.user1 : match.unreadCount.user2,
          lastActivity: match.lastMessageAt
        };
      })
    );

    res.json({
      success: true,
      message: 'Matches retrieved successfully',
      data: matchesWithLastMessage
    });

  } catch (error) {
    console.error('Get user matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving matches: ' + error.message
    });
  }
};