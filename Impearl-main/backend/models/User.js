import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['client', 'freelancer'],
    required: true
  },
  // Client-specific fields
  businessName: String,
  businessType: String,
  companySize: String,
  address: String,
  // Freelancer-specific fields
  profilePicture: String,  // URL or path to profile picture
  resume: String,          // URL or path to resume
  skills: String,          // Skills/expertise
  experience: String,      // Years of experience
  // Common optional fields
  bio: String,             // User bio/description
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at timestamp before saving
userSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model("User", userSchema);
