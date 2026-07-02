// backend/routes/pets.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // Add this import
const {
  createPet,
  getUserPets,
  getPetById,
  updatePet,
  deletePet
} = require('../controllers/pets');

// All routes are protected
router.use(auth);

// @route   POST /api/pets
// @desc    Create a new pet with image uploads
// @access  Private
router.post('/', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'vaccinationProof', maxCount: 1 }
]), createPet);

// @route   GET /api/pets/my-pets
// @desc    Get user's pets
// @access  Private
router.get('/my-pets', getUserPets);

// @route   GET /api/pets/:id
// @desc    Get pet by ID
// @access  Private
router.get('/:id', getPetById);

// @route   PUT /api/pets/:id
// @desc    Update pet with optional image uploads
// @access  Private
router.put('/:id', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'vaccinationProof', maxCount: 1 }
]), updatePet);

// @route   DELETE /api/pets/:id
// @desc    Delete pet
// @access  Private
router.delete('/:id', deletePet);

module.exports = router;