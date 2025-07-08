import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const PendingUserSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Document expires after 1 hour (in seconds)
  }
});

// Hash password before saving
PendingUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.models.PendingUser || mongoose.model('PendingUser', PendingUserSchema); 