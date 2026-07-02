// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
const subDirs = ['pets', 'posts', 'profiles', 'vaccinations'];
subDirs.forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'general';
    
    // Determine folder based on file field name
    if (file.fieldname === 'images' && req.baseUrl.includes('/pets')) {
      folder = 'pets';
    } else if (file.fieldname === 'vaccinationProof') {
      folder = 'vaccinations';
    } else if (file.fieldname === 'profileImage') {
      folder = 'profiles';
    } else if (file.fieldname === 'postImages') {
      folder = 'posts';
    }
    
    const uploadPath = path.join(uploadsDir, folder);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    
    // Create safe filename
    const safeName = baseName.replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, safeName + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs for vaccination proof
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for larger files
  }
});

module.exports = upload;