import mongoose from 'mongoose';

const travelGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['wild', 'mountain', 'international', 'beaches', 'religious', 'cultural', 'adventure', 'luxury', 'budget', 'family', 'solo', 'mixed']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    }
  }],
  coverImage: {
    url: String,
    publicId: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  memberCount: {
    type: Number,
    default: 0
  },
  maxMembers: {
    type: Number,
    default: 1000
  },
  rules: [{
    type: String,
    maxlength: 200
  }],
  upcomingTrips: [{
    title: String,
    destination: String,
    startDate: Date,
    endDate: Date,
    description: String,
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  discussions: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better search performance
travelGroupSchema.index({ name: 'text', description: 'text', tags: 'text' });
travelGroupSchema.index({ category: 1, isActive: 1 });
travelGroupSchema.index({ owner: 1 });

const TravelGroup = mongoose.model('TravelGroup', travelGroupSchema);

export default TravelGroup; 