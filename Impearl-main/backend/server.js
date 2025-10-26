import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// JWT Secret (add this to your .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Helper function to generate JWT token
const generateToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user; // Add user info to request
    next();
  });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in 'uploads' folder
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profilePicture') {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile picture!'), false);
    }
  } else if (file.fieldname === 'resume') {
    // Accept only PDF and DOC files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume!'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// CORS configuration - allow your frontend domain
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'http://localhost:5173', // Vite local development
  process.env.FRONTEND_URL // Your production frontend URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => res.send("Backend running!"));

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Client Registration Endpoint
app.post("/api/register/client", async (req, res) => {
  try {
    const { name, email, password, businessName, businessType, companySize, address, userType } = req.body;

    // Validate required fields
    if (!name || !email || !password || !businessName || !businessType || !companySize || !address) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: userType || 'client',
      businessName,
      businessType,
      companySize,
      address
    });

    // Save to database
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.userType);

    // Return success response (don't send password back)
    res.status(201).json({
      success: true,
      message: "Client registered successfully",
      token: token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        businessName: newUser.businessName
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
});

// Freelancer Registration Endpoint
app.post("/api/register/freelancer", upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, password, skills, experience, userType } = req.body;

    // Validate required fields
    if (!name || !email || !password || !skills || !experience) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if files were uploaded
    if (!req.files || !req.files.profilePicture || !req.files.resume) {
      return res.status(400).json({
        success: false,
        message: "Profile picture and resume are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get file paths
    const profilePicturePath = req.files.profilePicture[0].path;
    const resumePath = req.files.resume[0].path;

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: userType || 'freelancer',
      profilePicture: profilePicturePath,
      resume: resumePath,
      skills,
      experience
    });

    // Save to database
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.userType);

    // Return success response (don't send password back)
    res.status(201).json({
      success: true,
      message: "Freelancer registered successfully",
      token: token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        profilePicture: profilePicturePath,
        resume: resumePath,
        skills: newUser.skills,
        experience: newUser.experience
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration"
    });
  }
});

// Login Endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if userType matches (optional - for better UX)
    if (userType && user.userType !== userType) {
      return res.status(401).json({
        success: false,
        message: `This account is not registered as a ${userType}`
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Login successful - return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType
    };

    // Add user-type specific fields
    if (user.userType === 'client') {
      userData.businessName = user.businessName;
      userData.businessType = user.businessType;
      userData.companySize = user.companySize;
      userData.address = user.address;
    } else if (user.userType === 'freelancer') {
      userData.profilePicture = user.profilePicture;
      userData.resume = user.resume;
      userData.skills = user.skills;
      userData.experience = user.experience;
    }

    // Generate JWT token
    const token = generateToken(user._id, user.userType);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});

// Client Profile Endpoint
app.get("/api/client/profile", authenticateToken, async (req, res) => {
  try {
    // Verify user is a client
    if (req.user.userType !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Client account required.'
      });
    }

    // Fetch user data
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        businessType: user.businessType,
        companySize: user.companySize,
        address: user.address,
        bio: user.bio,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Error fetching client profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Freelancer Profile Endpoint
app.get("/api/freelancer/profile", authenticateToken, async (req, res) => {
  try {
    // Verify user is a freelancer
    if (req.user.userType !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Freelancer account required.'
      });
    }

    // Fetch user data
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        skills: user.skills,
        experience: user.experience,
        bio: user.bio,
        profilePicture: user.profilePicture,
        resume: user.resume
      }
    });
  } catch (error) {
    console.error('Error fetching freelancer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update Client Bio
app.post("/api/client/update-bio", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { bio: bio },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Bio updated successfully',
      bio: user.bio
    });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update Freelancer Bio
app.post("/api/freelancer/update-bio", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { bio: bio },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Bio updated successfully',
      bio: user.bio
    });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update Client Profile Picture
app.post("/api/client/update-picture", authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (req.user.userType !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const profilePicturePath = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: profilePicturePath },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update Freelancer Profile Picture
app.post("/api/freelancer/update-picture", authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (req.user.userType !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const profilePicturePath = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: profilePicturePath },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
