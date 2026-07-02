const express = require('express');
const Match = require('../models/Match');
const Pet = require('../models/Pet');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a match (swipe right on a pet)
router.post('/', auth, async (req, res) => {
  try {
    const { matchedPetId } = req.body;
    const userId = req.user.id;

    console.log('Creating match for user:', userId, 'with pet:', matchedPetId);

    // Get current user's pet (assuming user has one active pet for now)
    const userPets = await Pet.find({ ownerId: userId });
    if (userPets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You need to register a pet first'
      });
    }

    const userPet = userPets[0]; // Use first pet for now

    // Check if trying to match with own pet
    if (userPet._id.toString() === matchedPetId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot match with your own pet'
      });
    }

    // Get the matched pet and its owner
    const matchedPet = await Pet.findById(matchedPetId).populate('ownerId');
    if (!matchedPet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if match already exists
    const existingMatch = await Match.findOne({
      $or: [
        { pet1: userPet._id, pet2: matchedPetId },
        { pet1: matchedPetId, pet2: userPet._id }
      ]
    });

    if (existingMatch) {
      return res.status(400).json({
        success: false,
        message: 'Match already exists'
      });
    }

    // Calculate compatibility score
    const compatibilityScore = calculateCompatibility(userPet, matchedPet);

    // Create new match
    const match = new Match({
      pet1: userPet._id,
      pet2: matchedPetId,
      user1: userId,
      user2: matchedPet.ownerId._id,
      initiator: userId,
      compatibilityScore,
      status: 'pending'
    });

    await match.save();

    // Populate the response
    await match.populate('pet1', 'name breed images');
    await match.populate('pet2', 'name breed images');
    await match.populate('user1', 'name');
    await match.populate('user2', 'name');

    res.status(201).json({
      success: true,
      message: 'Match created successfully',
      match: match
    });

  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating match: ' + error.message
    });
  }
});

// Get user's matches
router.get('/my-matches', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: { $in: ['accepted', 'connected'] }
    })
    .populate('pet1', 'name breed images ownerId')
    .populate('pet2', 'name breed images ownerId')
    .populate('user1', 'name profile.avatar')
    .populate('user2', 'name profile.avatar')
    .sort({ lastMessageAt: -1, createdAt: -1 });

    // Get last message for each match and format response
    const Message = require('../models/Message');
    const matchesWithDetails = await Promise.all(
      matches.map(async (match) => {
        const lastMessage = await Message.findOne({ matchId: match._id })
          .sort({ createdAt: -1 })
          .populate('sender', 'name')
          .lean();

        // Determine which pet/user is the other one
        const isUser1 = match.user1._id.toString() === userId;
        const otherUser = isUser1 ? match.user2 : match.user1;
        const otherPet = isUser1 ? match.pet2 : match.pet1;
        const userPet = isUser1 ? match.pet1 : match.pet2;

        return {
          _id: match._id,
          matchId: match._id,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.profile?.avatar
          },
          otherPet: {
            _id: otherPet._id,
            name: otherPet.name,
            breed: otherPet.breed,
            images: otherPet.images,
            location: otherPet.location
          },
          userPet: {
            _id: userPet._id,
            name: userPet.name
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            sender: lastMessage.sender,
            timestamp: lastMessage.createdAt,
            isCurrentUser: lastMessage.sender._id.toString() === userId
          } : null,
          unreadCount: isUser1 ? match.unreadCount.user1 : match.unreadCount.user2,
          lastActivity: match.lastMessageAt || match.createdAt,
          compatibilityScore: match.compatibilityScore,
          status: match.status
        };
      })
    );

    res.json({
      success: true,
      message: 'Matches retrieved successfully',
      matches: matchesWithDetails
    });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving matches: ' + error.message
    });
  }
});

// Accept a match
router.put('/:matchId/accept', auth, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if user is part of this match
    if (!match.hasUser(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this match'
      });
    }

    // Check if user is the initiator
    if (match.initiator.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept your own match request'
      });
    }

    // Update match status
    if (match.status === 'pending') {
      match.status = 'accepted';
      match.connectedAt = new Date();
      await match.save();

      // Populate for response
      await match.populate('pet1', 'name breed images');
      await match.populate('pet2', 'name breed images');
      await match.populate('user1', 'name');
      await match.populate('user2', 'name');

      res.json({
        success: true,
        message: 'Match accepted successfully',
        match: match
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Match already processed'
      });
    }

  } catch (error) {
    console.error('Accept match error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting match: ' + error.message
    });
  }
});

// Reject a match
router.put('/:matchId/reject', auth, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if user is part of this match
    if (!match.hasUser(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this match'
      });
    }

    // Update match status
    if (match.status === 'pending') {
      match.status = 'rejected';
      await match.save();

      res.json({
        success: true,
        message: 'Match rejected successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Match already processed'
      });
    }

  } catch (error) {
    console.error('Reject match error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting match: ' + error.message
    });
  }
});

// Helper function to calculate compatibility between pets
function calculateCompatibility(pet1, pet2) {
  let score = 0;

  // Energy level compatibility (40 points)
  if (pet1.energyLevel === pet2.energyLevel) {
    score += 40;
  }

  // Temperament compatibility (30 points)
  const commonTemperaments = pet1.temperament.filter(t => 
    pet2.temperament.includes(t)
  );
  score += commonTemperaments.length * 10;

  // Location compatibility (20 points) - simplified
  if (pet1.location === pet2.location) {
    score += 20;
  }

  // Age compatibility (10 points) - simplified
  const age1 = parseInt(pet1.age) || 0;
  const age2 = parseInt(pet2.age) || 0;
  if (Math.abs(age1 - age2) <= 2) {
    score += 10;
  }

  return Math.min(score, 100);
}

module.exports = router;