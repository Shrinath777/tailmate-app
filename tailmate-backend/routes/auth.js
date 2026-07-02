// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!', timestamp: new Date().toISOString() });
});

// Login - WITH EXTENSIVE DEBUGGING
router.post('/login', async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT STARTED ===');
    console.log('Request headers:', req.headers);
    console.log('Request body received:', req.body);
    
    // Check if req.body exists
    if (!req.body) {
      console.log('ERROR: req.body is undefined');
      return res.status(400).json({ message: 'Request body is missing' });
    }

    const { email, password } = req.body;
    console.log('Extracted email:', email, 'password length:', password ? password.length : 'undefined');

    // Validation
    if (!email || !password) {
      console.log('ERROR: Missing fields - email:', !!email, 'password:', !!password);
      return res.status(400).json({ 
        message: 'Email and password are required',
        field: !email ? 'email' : 'password'
      });
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('ERROR: Invalid email format');
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    console.log('Looking for user in database...');
    // Find user
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('ERROR: No user found with email:', email);
      return res.status(400).json({ 
        message: 'No account found with this email address',
        field: 'email'
      });
    }

    console.log('Comparing passwords...');
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('ERROR: Password does not match');
      return res.status(400).json({ 
        message: 'Incorrect password. Please try again.',
        field: 'password'
      });
    }

    console.log('Creating JWT token...');
    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret_key_for_development',
      { expiresIn: '7d' }
    );

    console.log('=== LOGIN SUCCESSFUL ===');
    console.log('User:', user.email, 'Token created successfully');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('=== REGISTRATION ATTEMPT ===');
    console.log('Request body:', req.body);

    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }

    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret_key_for_development',
      { expiresIn: '7d' }
    );

    console.log('=== REGISTRATION SUCCESSFUL ===');
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Get user profile (protected)
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('=== PROFILE REQUEST ===');
    console.log('User ID from token:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;