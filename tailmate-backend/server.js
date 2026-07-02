// backend/server.js - FIXED VERSION
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http'); // ADD THIS
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:19006',
  'http://localhost:8081',
  'exp://localhost:19000',
  /\.exp\.host$/,
  /\.exp\.direct$/,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') return origin === allowedOrigin;
      if (allowedOrigin instanceof RegExp) return allowedOrigin.test(origin);
      return false;
    })) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware - MUST come first
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - ONLY ONCE
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/upload', require('./routes/uploads'));
app.use('/api/messages', require('./routes/messages')); // ADD THIS

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is connected!', 
    timestamp: new Date().toISOString()
  });
});

app.post('/api/test-body', (req, res) => {
  res.json({ 
    message: 'Body parsing test successful',
    receivedBody: req.body 
  });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tailmate';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

// Socket.io Setup - FIXED
const setupSocket = require('./socket');
const server = http.createServer(app); // CREATE HTTP SERVER
const io = setupSocket(server); // SETUP SOCKET.IO

// Start Server - USE SERVER NOT APP
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io enabled for real-time messaging`);
});