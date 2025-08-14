import express from 'express';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Authenticate user (create or get existing user)
router.post('/auth', userController.authenticateUser);

// Get user profile
router.get('/:userId', optionalAuth, userController.getUserProfile);

// Update user profile
router.put('/profile', authenticateUser, uploadSingle, handleUploadError, userController.updateUserProfile);

// Follow/Unfollow a user
router.post('/:userId/follow', authenticateUser, userController.followUser);

// Get user's followers
router.get('/:userId/followers', optionalAuth, userController.getUserFollowers);

// Get user's following
router.get('/:userId/following', optionalAuth, userController.getUserFollowing);

// Get user's followers (only if mutually following)
router.get('/:userId/followers/mutual', authenticateUser, userController.getMutualFollowers);

// Get user's following (only if mutually following)
router.get('/:userId/following/mutual', authenticateUser, userController.getMutualFollowing);

// Check if users are mutually following each other
router.get('/:userId/mutual-status', authenticateUser, userController.getMutualStatus);

// Search users
router.get('/search/users', optionalAuth, userController.searchUsers);

// Get user's activity feed
router.get('/activity/feed', authenticateUser, userController.getActivityFeed);

// Get user's favorite blogs
router.get('/favorites/blogs', authenticateUser, userController.getFavoriteBlogs);

// Add/Remove blog from favorites
router.post('/favorites/blogs/:blogId', authenticateUser, userController.toggleFavoriteBlog);

export default router;