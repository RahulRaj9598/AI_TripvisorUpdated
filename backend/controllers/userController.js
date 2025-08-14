import User from '../models/User.js';
import Blog from '../models/Blog.js';
import TravelGroup from '../models/TravelGroup.js';
import { generateJWTToken } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Authenticate user (create or get existing user)
export const authenticateUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let userInfo;
    
    try {
      // Use Google OAuth for token verification
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      
      userInfo = {
        uid: response.data.id,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture
      };
      console.log('Google OAuth verification successful');
    } catch {
      console.log('Firebase verification failed, trying Google OAuth...');
      // If Firebase verification fails, try Google OAuth
      try {
        // For Google OAuth, we need to use the access token directly
        const response = await axios.get(
          'https://www.googleapis.com/oauth2/v1/userinfo',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        
        userInfo = {
          uid: response.data.id,
          email: response.data.email,
          name: response.data.name,
          picture: response.data.picture
        };
        console.log('Google OAuth verification successful');
      } catch (googleError) {
        console.error('Google OAuth verification failed:', googleError.response?.data || googleError.message);
        
        // Check if it's a token expiration error
        if (googleError.response?.status === 401) {
          return res.status(401).json({ 
            error: 'Token expired or invalid. Please login again.',
            code: 'TOKEN_EXPIRED'
          });
        }
        
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUid: userInfo.uid });
    
    if (!user) {
      // Create new user
      user = new User({
        firebaseUid: userInfo.uid,
        email: userInfo.email,
        displayName: userInfo.name || 'Anonymous User',
        photoURL: userInfo.picture || '',
      });
      await user.save();
      console.log('New user created:', user.email);
    } else {
      // Update last seen
      user.lastSeen = new Date();
      await user.save();
      console.log('User authenticated:', user.email);
    }

    // Generate our own JWT token with longer expiration
    const jwtToken = generateJWTToken(user);

    // Return user data with our JWT token
    res.json({
      ...user.toObject(),
      jwtToken, // Our own token with 7-day expiration
      displayPhotoURL: user.customPhotoURL || user.photoURL || ''
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    // Validate userId parameter
    if (!req.params.userId || req.params.userId === 'undefined') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await User.findById(req.params.userId)
      .populate('followers', 'displayName photoURL')
      .populate('following', 'displayName photoURL');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = user.followers.some(follower => 
        follower._id.toString() === req.user._id.toString()
      );
    }

    // Get user stats
    const blogCount = await Blog.countDocuments({ author: req.params.userId, isPublished: true });
    const groupCount = await TravelGroup.countDocuments({ 'members.user': req.params.userId, isActive: true });

    res.json({
      ...user.toObject(),
      isFollowing,
      // Use custom photo if available, otherwise use Google photo or default
      displayPhotoURL: user.customPhotoURL || user.photoURL || '',
      stats: {
        blogs: blogCount,
        groups: groupCount,
        followers: user.followers.length,
        following: user.following.length
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { bio, location, website, socialLinks, travelPreferences } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Upload new profile picture if provided
    if (req.file) {
      // Delete old custom profile picture from Cloudinary if exists
      if (user.customPhotoURL && user.customPhotoURL.includes('cloudinary')) {
        const publicId = user.customPhotoURL.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // Upload directly from memory buffer to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'tripvisor-profiles',
            transformation: [
              { width: 400, height: 400, crop: 'fill' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      
      user.customPhotoURL = result.secure_url;
    }

    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    
    if (socialLinks) {
      const social = JSON.parse(socialLinks);
      user.socialLinks = { ...user.socialLinks, ...social };
    }
    
    if (travelPreferences) {
      const preferences = JSON.parse(travelPreferences);
      user.travelPreferences = { ...user.travelPreferences, ...preferences };
    }

    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Follow/Unfollow a user
export const followUser = async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.userId);
    
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);
    
    // Check if already following
    const isFollowing = currentUser.following.includes(userToFollow._id);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => 
        id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(id => 
        id.toString() !== currentUser._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }

    await currentUser.save();
    await userToFollow.save();
    
    res.json({ 
      isFollowing: !isFollowing,
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

// Get user's followers
export const getUserFollowers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(req.params.userId)
      .populate({
        path: 'followers',
        select: 'displayName photoURL bio location',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const total = user.followers.length;

    res.json({
      followers: user.followers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
};

// Get user's following
export const getUserFollowing = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(req.params.userId)
      .populate({
        path: 'following',
        select: 'displayName photoURL bio location',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const total = user.following.length;

    res.json({
      following: user.following,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
};

// Get user's followers (only if mutually following)
export const getMutualFollowers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const targetUser = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);
    
    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if they are mutually following each other
    const isCurrentUserFollowingTarget = currentUser.following.includes(targetUser._id);
    const isTargetUserFollowingCurrent = targetUser.followers.includes(currentUser._id);
    
    if (!isCurrentUserFollowingTarget || !isTargetUserFollowingCurrent) {
      return res.status(403).json({ 
        error: 'You can only view followers if you are mutually following each other',
        isMutual: false
      });
    }

    // Get followers with pagination
    const followers = await User.findById(req.params.userId)
      .populate({
        path: 'followers',
        select: 'displayName photoURL bio location',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    const total = followers.followers.length;

    res.json({
      followers: followers.followers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      isMutual: true
    });
  } catch (error) {
    console.error('Error fetching mutual followers:', error);
    res.status(500).json({ error: 'Failed to fetch mutual followers' });
  }
};

// Get user's following (only if mutually following)
export const getMutualFollowing = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const targetUser = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);
    
    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if they are mutually following each other
    const isCurrentUserFollowingTarget = currentUser.following.includes(targetUser._id);
    const isTargetUserFollowingCurrent = targetUser.followers.includes(currentUser._id);
    
    if (!isCurrentUserFollowingTarget || !isTargetUserFollowingCurrent) {
      return res.status(403).json({ 
        error: 'You can only view following if you are mutually following each other',
        isMutual: false
      });
    }

    // Get following with pagination
    const following = await User.findById(req.params.userId)
      .populate({
        path: 'following',
        select: 'displayName photoURL bio location',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    const total = following.following.length;

    res.json({
      following: following.following,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      isMutual: true
    });
  } catch (error) {
    console.error('Error fetching mutual following:', error);
    res.status(500).json({ error: 'Failed to fetch mutual following' });
  }
};

// Check if users are mutually following each other
export const getMutualStatus = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);
    
    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if they are mutually following each other
    const isCurrentUserFollowingTarget = currentUser.following.includes(targetUser._id);
    const isTargetUserFollowingCurrent = targetUser.followers.includes(currentUser._id);
    const isMutual = isCurrentUserFollowingTarget && isTargetUserFollowingCurrent;

    res.json({
      isMutual,
      isCurrentUserFollowingTarget,
      isTargetUserFollowingCurrent
    });
  } catch (error) {
    console.error('Error checking mutual status:', error);
    res.status(500).json({ error: 'Failed to check mutual status' });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const query = {
      displayName: { $regex: q, $options: 'i' },
      isActive: true
    };

    const users = await User.find(query)
      .select('displayName photoURL bio location')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

// Get user's activity feed
export const getActivityFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Get users that the current user follows
    const currentUser = await User.findById(req.user._id).populate('following');
    const followingIds = currentUser.following.map(user => user._id);
    
    // Add current user's ID to include their own posts
    followingIds.push(req.user._id);

    // Get recent blogs from followed users
    const blogs = await Blog.find({
      author: { $in: followingIds },
      isPublished: true
    })
      .populate('author', 'displayName photoURL customPhotoURL')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get recent group activities
    const groups = await TravelGroup.find({
      'members.user': { $in: followingIds },
      isActive: true
    })
      .populate('owner', 'displayName photoURL customPhotoURL')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Add displayPhotoURL to all user objects
    const blogsWithPhotos = blogs.map(blog => {
      const blogData = blog.toObject();
      if (blogData.author) {
        blogData.author.displayPhotoURL = blogData.author.customPhotoURL || blogData.author.photoURL || '';
      }
      return blogData;
    });
    
    const groupsWithPhotos = groups.map(group => {
      const groupData = group.toObject();
      if (groupData.owner) {
        groupData.owner.displayPhotoURL = groupData.owner.customPhotoURL || groupData.owner.photoURL || '';
      }
      return groupData;
    });

    // Combine and sort activities
    const activities = [
      ...blogsWithPhotos.map(blog => ({ type: 'blog', data: blog, date: blog.createdAt })),
      ...groupsWithPhotos.map(group => ({ type: 'group', data: group, date: group.updatedAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      activities: activities.slice(0, limit),
      totalPages: Math.ceil(activities.length / limit),
      currentPage: page,
      total: activities.length
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
};

// Get user's favorite blogs
export const getFavoriteBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findById(req.user._id).populate('favoriteBlogs');
    
    const blogs = await Blog.find({
      _id: { $in: user.favoriteBlogs },
      isPublished: true
    })
      .populate('author', 'displayName photoURL')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = user.favoriteBlogs.length;

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching favorite blogs:', error);
    res.status(500).json({ error: 'Failed to fetch favorite blogs' });
  }
};

// Add/Remove blog from favorites
export const toggleFavoriteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const user = await User.findById(req.user._id);
    const isFavorite = user.favoriteBlogs.includes(blog._id);
    
    if (isFavorite) {
      // Remove from favorites
      user.favoriteBlogs = user.favoriteBlogs.filter(id => 
        id.toString() !== blog._id.toString()
      );
    } else {
      // Add to favorites
      user.favoriteBlogs.push(blog._id);
    }

    await user.save();
    
    res.json({ 
      isFavorite: !isFavorite,
      favoritesCount: user.favoriteBlogs.length
    });
  } catch (error) {
    console.error('Error updating favorites:', error);
    res.status(500).json({ error: 'Failed to update favorites' });
  }
};
