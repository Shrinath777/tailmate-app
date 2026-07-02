const Message = require('../models/Message');
const Match = require('../models/Match');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const senderId = req.user.id;

    // Check if match exists and user is part of it
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Verify user is part of this match
    if (match.user1.toString() !== senderId && match.user2.toString() !== senderId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this match'
      });
    }

    // Verify match is connected (both users accepted)
    if (match.status !== 'connected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send messages until match is connected'
      });
    }

    // Create message
    const message = new Message({
      matchId,
      sender: senderId,
      content,
      messageType
    });

    await message.save();

    // Update match's last message timestamp
    await Match.updateLastMessage(matchId);

    // Update unread count for the other user
    const otherUser = match.getOtherUser(senderId);
    if (match.user1.toString() === senderId) {
      match.unreadCount.user2 += 1;
    } else {
      match.unreadCount.user1 += 1;
    }
    await match.save();

    // Populate sender info for response
    await message.populate('sender', 'name');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message: ' + error.message
    });
  }
};

// Get messages for a match
exports.getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    // Check if match exists and user is part of it
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Verify user is part of this match
    if (match.user1.toString() !== userId && match.user2.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages in this match'
      });
    }

    // Get messages with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ matchId })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Reverse to get chronological order
    const chronologicalMessages = messages.reverse();

    // Mark messages as read for this user
    await Message.updateMany(
      {
        matchId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: { readBy: { user: userId } },
        $set: { status: 'read' }
      }
    );

    // Reset unread count for this user
    if (match.user1.toString() === userId) {
      match.unreadCount.user1 = 0;
    } else {
      match.unreadCount.user2 = 0;
    }
    await match.save();

    res.json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages: chronologicalMessages,
        pagination: {
          page,
          limit,
          total: await Message.countDocuments({ matchId })
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving messages: ' + error.message
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      {
        matchId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: { readBy: { user: userId } },
        $set: { status: 'read' }
      }
    );

    // Reset unread count
    const match = await Match.findById(matchId);
    if (match.user1.toString() === userId) {
      match.unreadCount.user1 = 0;
    } else {
      match.unreadCount.user2 = 0;
    }
    await match.save();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read: ' + error.message
    });
  }
};