import mongoose from 'mongoose';

const PasswordResetTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true
  },
  expires: {
    type: Date,
    required: [true, 'Expiration date is required'],
    default: () => new Date(Date.now() + 3600000) // 1 hour from now
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for automatic deletion of expired tokens
PasswordResetTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PasswordResetToken || mongoose.model('PasswordResetToken', PasswordResetTokenSchema); 