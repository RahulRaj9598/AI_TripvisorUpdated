import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['wild', 'mountain', 'international', 'beaches', 'religious', 'cultural', 'adventure', 'luxury', 'budget', 'family', 'solo', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    publicId: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  poll: {
    question: {
      type: String,
      trim: true,
      maxlength: 200
    },
    options: [{
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
      voteCount: {
        type: Number,
        default: 0
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    endsAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Index for better search performance
blogSchema.index({ title: 'text', content: 'text', destination: 'text', tags: 'text' });
blogSchema.index({ category: 1, createdAt: -1 });
blogSchema.index({ author: 1, createdAt: -1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog; 