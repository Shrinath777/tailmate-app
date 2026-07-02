// backend/models/Pet.js
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  energyLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  temperament: [{
    type: String,
    trim: true
  }],
  goodWith: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: true,  // Added required: true
    trim: true
  },
  images: [{
    type: String
  }],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  vaccinated: {
    type: Boolean,
    default: false
  },
  neutered: {
    type: Boolean,
    default: false
  },
  vaccinationProof: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pet', petSchema);