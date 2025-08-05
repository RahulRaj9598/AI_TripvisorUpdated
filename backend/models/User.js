import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String,
    default: ''
  },
  customPhotoURL: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  travelPreferences: {
    favoriteCategories: [{
      type: String,
      enum: ['wild', 'mountain', 'international', 'beaches', 'religious', 'cultural', 'adventure', 'luxury', 'budget', 'family', 'solo']
    }],
    preferredDestinations: [String],
    travelStyle: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury', 'backpacker', 'family', 'solo', 'group'],
      default: 'mid-range'
    }
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TravelGroup'
  }],
  ownedGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TravelGroup'
  }],
  favoriteBlogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ firebaseUid: 1 });
userSchema.index({ email: 1 });
userSchema.index({ displayName: 'text' });

const User = mongoose.model('User', userSchema);

export default User; 