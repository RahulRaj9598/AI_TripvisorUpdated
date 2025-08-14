import express from 'express';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import { uploadMultiple, handleUploadError } from '../middleware/upload.js';
import * as blogController from '../controllers/blogController.js';

const router = express.Router();

// Create a new blog post
router.post('/', authenticateUser, uploadMultiple, handleUploadError, blogController.createBlog);

// Get all blogs with pagination and filters
router.get('/', optionalAuth, blogController.getAllBlogs);

// Get blogs written by the authenticated user
router.get('/my-blogs', authenticateUser, blogController.getMyBlogs);

// Get a single blog by ID
router.get('/:id', authenticateUser, blogController.getBlogById);

// Update a blog post
router.put('/:id', authenticateUser, uploadMultiple, handleUploadError, blogController.updateBlog);

// Delete a blog post
router.delete('/:id', authenticateUser, blogController.deleteBlog);

// Like/Unlike a blog
router.post('/:id/like', authenticateUser, blogController.toggleLikeBlog);

// Add a comment to a blog
router.post('/:id/comments', authenticateUser, blogController.addComment);

// Delete a comment
router.delete('/:id/comments/:commentId', authenticateUser, blogController.deleteComment);

// Share a blog (increment share count)
router.post('/:id/share', optionalAuth, blogController.shareBlog);

// Create a poll for a blog
router.post('/:id/poll', authenticateUser, blogController.createPoll);

// Vote on a poll option
router.post('/:id/poll/vote', authenticateUser, blogController.voteOnPoll);

// Get poll results
router.get('/:id/poll', optionalAuth, blogController.getPollResults);

// End a poll (author only)
router.put('/:id/poll/end', authenticateUser, blogController.endPoll);

// Delete a poll (author only)
router.delete('/:id/poll', authenticateUser, blogController.deletePoll);

// Get user's blogs
router.get('/user/:userId', optionalAuth, blogController.getUserBlogs);

export default router;