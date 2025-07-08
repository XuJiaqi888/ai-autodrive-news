import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  careerStage: {
    type: String,
    required: [true, 'Please select your career stage'],
    enum: ['nextgen', 'shining']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // New fields for profile
  school: {
    type: String,
    maxlength: [100, 'School name cannot be more than 100 characters'],
    default: ''
  },
  major: {
    type: String,
    maxlength: [100, 'Major cannot be more than 100 characters'],
    default: ''
  },
  graduationYear: {
    type: String,
    match: [/^\d{4}$/, 'Please provide a valid year'],
    default: ''
  },
  birthday: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['female', 'male', 'non-binary', 'prefer-not-to-say', ''],
    default: ''
  },
  avatar: {
    type: String, // Base64 encoded image or URL
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
UserSchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  
  if (!this.isModified('password')) {
    next();
  }

  // Check if password is already hashed (from PendingUser)
  // Hashed passwords typically start with $2a$, $2b$, or $2y$ (bcrypt format)
  if (this.password && this.password.match(/^\$2[abyxy]?\$/)) {
    next();
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema); 