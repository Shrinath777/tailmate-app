const mongoose = require('mongoose');

const matchPreferencesSchema = new mongoose.Schema({
  // Breed preferences
  preferredBreeds: [{
    type: String,
    trim: true
  }],
  // Age range preferences
  preferredAgeRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 20 }
  },
  // Energy level preferences
  preferredEnergyLevels: [{
    type: String,
    enum: ['Low', 'Medium', 'High']
  }],
  // Temperament preferences
  preferredTemperaments: [{
    type: String,
    trim: true
  }],
  // Location preferences
  locationEnabled: {
    type: Boolean,
    default: true
  },
  maxDistance: {
    type: Number,
    default: 50, // kilometers
    min: 1,
    max: 500
  },
  // Must-have requirements
  mustBeVaccinated: {
    type: Boolean,
    default: true
  },
  mustBeNeutered: {
    type: Boolean,
    default: false
  },
  // Gender preferences
  preferredGenders: [{
    type: String,
    enum: ['Male', 'Female']
  }],
  // Good with preferences
  mustBeGoodWith: [{
    type: String,
    enum: ['Dogs', 'Kids', 'Cats', 'Other Pets']
  }]
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // User's pets
  pets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  }],
  // Matches involving user's pets
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  // Match preferences
  preferences: matchPreferencesSchema,
  // Profile settings
  profile: {
    bio: String,
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    phone: String,
    avatar: String
  },
  // App settings
  settings: {
    notifications: {
      newMatches: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true }
    },
    privacy: {
      showLocation: { type: Boolean, default: true },
      showContact: { type: Boolean, default: false }
    }
  },
  // Statistics
  stats: {
    totalMatches: { type: Number, default: 0 },
    successfulMatches: { type: Number, default: 0 },
    activeConversations: { type: Number, default: 0 }
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for location-based queries
userSchema.index({ 'profile.location.coordinates': '2dsphere' });

// Index for matching preferences
userSchema.index({ 'preferences.preferredBreeds': 1 });
userSchema.index({ 'preferences.preferredEnergyLevels': 1 });

// Method to add a pet to user
userSchema.methods.addPet = function(petId) {
  if (!this.pets.includes(petId)) {
    this.pets.push(petId);
  }
  return this.save();
};

// Method to remove a pet from user
userSchema.methods.removePet = function(petId) {
  this.pets = this.pets.filter(pet => pet.toString() !== petId.toString());
  return this.save();
};

// Method to add a match to user
userSchema.methods.addMatch = function(matchId) {
  if (!this.matches.includes(matchId)) {
    this.matches.push(matchId);
  }
  return this.save();
};

// Method to check if user has active pets
userSchema.methods.hasActivePets = function() {
  return this.pets.length > 0;
};

// Static method to find users by location proximity
userSchema.statics.findNearby = function(coordinates, maxDistance = 50000) { // meters
  return this.find({
    'profile.location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Virtual for active pet count
userSchema.virtual('activePetCount').get(function() {
  return this.pets.length;
});

module.exports = mongoose.model('User', userSchema);