// backend/socket.js - ENHANCED VERSION
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

function setupSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:8081",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userName, socket.id);

    // Store user's socket rooms
    socket.userRooms = new Set();

    // Join match room
    socket.on('join_match', (matchId) => {
      socket.join(matchId);
      socket.userRooms.add(matchId);
      console.log(`User ${socket.userName} joined match: ${matchId}`);
    });

    // Leave match room
    socket.on('leave_match', (matchId) => {
      socket.leave(matchId);
      socket.userRooms.delete(matchId);
      console.log(`User ${socket.userName} left match: ${matchId}`);
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const Message = require('./models/Message');
        const Match = require('./models/Match');
        
        // Save message to database
        const message = new Message({
          matchId: data.matchId,
          sender: socket.userId,
          content: data.content,
          messageType: data.messageType || 'text'
        });

        await message.save();
        await message.populate('sender', 'name');

        // Update match's last message timestamp
        await Match.updateLastMessage(data.matchId);

        // Broadcast to all users in the match room
        io.to(data.matchId).emit('new_message', {
          _id: message._id,
          matchId: message.matchId,
          sender: {
            _id: message.sender._id,
            name: message.sender.name
          },
          content: message.content,
          messageType: message.messageType,
          status: message.status,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        });

        console.log(`Message sent in match ${data.matchId} by ${socket.userName}`);

      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(data.matchId).emit('user_typing', {
        matchId: data.matchId,
        userId: socket.userId,
        userName: socket.userName,
        isTyping: data.isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userName, socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

module.exports = setupSocket;