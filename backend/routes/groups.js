import express from 'express';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import * as groupController from '../controllers/groupController.js';

const router = express.Router();

// Create a new travel group
router.post('/', authenticateUser, uploadSingle, handleUploadError, groupController.createGroup);

// Get all groups with filters
router.get('/', optionalAuth, groupController.getAllGroups);

// Get groups where the authenticated user is a member
router.get('/my-groups', authenticateUser, groupController.getMyGroups);

// Get a single group by ID
router.get('/:id', optionalAuth, groupController.getGroupById);

// Join a group
router.post('/:id/join', authenticateUser, groupController.joinGroup);

// Leave a group
router.post('/:id/leave', authenticateUser, groupController.leaveGroup);

// Add a discussion to a group
router.post('/:id/discussions', authenticateUser, groupController.addDiscussion);

// Add a reply to a discussion
router.post('/:id/discussions/:discussionId/replies', authenticateUser, groupController.addReply);

// Like/Unlike a discussion
router.post('/:id/discussions/:discussionId/like', authenticateUser, groupController.toggleDiscussionLike);

// Update group (admin only)
router.put('/:id', authenticateUser, groupController.updateGroup);

// Delete group (owner only)
router.delete('/:id', authenticateUser, groupController.deleteGroup);

// Get user's groups
router.get('/user/:userId', optionalAuth, groupController.getUserGroups);

export default router;