// backend/controllers/pets.js
const Pet = require('../models/Pet');
const path = require('path');

// Create a new pet
// In backend/controllers/pets.js - Update createPet function
exports.createPet = async (req, res) => {
  try {
    console.log('Creating pet with data:', req.body);
    console.log('Uploaded files:', req.files);
    
    let petData = req.body;
    
    // If data comes as FormData, parse it
    if (typeof petData === 'string') {
      try {
        petData = JSON.parse(petData);
      } catch (error) {
        console.log('Data is not JSON, using as is');
      }
    }

    const {
      name,
      breed,
      age,
      gender,
      energyLevel,
      temperament,
      goodWith,
      location,
      bio,
      vaccinated,
      neutered,
      ownerId
    } = petData;

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.images) {
      images = req.files.images.map(file => `/uploads/pets/${file.filename}`);
    }

    // Handle vaccination proof
    let vaccinationProof = '';
    if (req.files && req.files.vaccinationProof) {
      vaccinationProof = `/uploads/vaccinations/${req.files.vaccinationProof[0].filename}`;
    }

    // Parse array fields if they come as strings
    const temperamentArray = Array.isArray(temperament) ? temperament : 
                            (temperament ? JSON.parse(temperament) : []);
    const goodWithArray = Array.isArray(goodWith) ? goodWith : 
                         (goodWith ? JSON.parse(goodWith) : []);

    // Create new pet
    const pet = new Pet({
      name,
      breed,
      age,
      gender,
      energyLevel,
      temperament: temperamentArray,
      goodWith: goodWithArray,
      location,
      bio: bio || '',
      vaccinated: vaccinated === 'true' || vaccinated === true,
      neutered: neutered === 'true' || neutered === true,
      images,
      vaccinationProof,
      ownerId: ownerId || req.user.id
    });

    await pet.save();
    console.log('Pet created successfully:', pet._id);

    // Also add pet to user's pets array
    await User.findByIdAndUpdate(ownerId || req.user.id, {
      $push: { pets: pet._id }
    });

    res.status(201).json({
      success: true,
      message: 'Pet created successfully',
      pet: {
        _id: pet._id,
        id: pet._id,
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        energyLevel: pet.energyLevel,
        temperament: pet.temperament,
        goodWith: pet.goodWith,
        location: pet.location,
        images: pet.images,
        ownerId: pet.ownerId,
        bio: pet.bio,
        vaccinated: pet.vaccinated,
        neutered: pet.neutered,
        vaccinationProof: pet.vaccinationProof,
        createdAt: pet.createdAt
      }
    });
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating pet: ' + error.message 
    });
  }
};
// Get user's pets
exports.getUserPets = async (req, res) => {
  try {
    console.log('Getting pets for user:', req.user.id);
    
    const pets = await Pet.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    
    console.log(`Found ${pets.length} pets for user`);
    
    res.json({
      success: true,
      message: 'Pets retrieved successfully',
      pets: pets.map(pet => ({
        _id: pet._id,
        id: pet._id,
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        energyLevel: pet.energyLevel,
        temperament: pet.temperament,
        goodWith: pet.goodWith,
        location: pet.location,
        images: pet.images,
        ownerId: pet.ownerId,
        bio: pet.bio,
        vaccinated: pet.vaccinated,
        neutered: pet.neutered,
        vaccinationProof: pet.vaccinationProof,
        createdAt: pet.createdAt
      }))
    });
  } catch (error) {
    console.error('Get user pets error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving pets' 
    });
  }
};

// Get pet by ID
exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ 
        success: false,
        message: 'Pet not found' 
      });
    }

    res.json({
      success: true,
      message: 'Pet retrieved successfully',
      pet: {
        _id: pet._id,
        id: pet._id,
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        energyLevel: pet.energyLevel,
        temperament: pet.temperament,
        goodWith: pet.goodWith,
        location: pet.location,
        images: pet.images,
        ownerId: pet.ownerId,
        bio: pet.bio,
        vaccinated: pet.vaccinated,
        neutered: pet.neutered,
        vaccinationProof: pet.vaccinationProof,
        createdAt: pet.createdAt
      }
    });
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving pet' 
    });
  }
};

// Update pet
exports.updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ 
        success: false,
        message: 'Pet not found' 
      });
    }

    // Check if user owns the pet
    if (pet.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this pet' 
      });
    }

    // Handle file updates
    const updateData = { ...req.body };
    
    if (req.files && req.files.images) {
      updateData.images = req.files.images.map(file => `/uploads/pets/${file.filename}`);
    }
    
    if (req.files && req.files.vaccinationProof) {
      updateData.vaccinationProof = `/uploads/vaccinations/${req.files.vaccinationProof[0].filename}`;
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Pet updated successfully',
      pet: updatedPet
    });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating pet' 
    });
  }
};

// Delete pet
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ 
        success: false,
        message: 'Pet not found' 
      });
    }

    // Check if user owns the pet
    if (pet.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this pet' 
      });
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting pet' 
    });
  }
};