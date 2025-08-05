import express from 'express';
import TravelGroup from '../models/TravelGroup.js';
import User from '../models/User.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create a new travel group
router.post('/', authenticateUser, uploadSingle, handleUploadError, async (req, res) => {
  try {
    const { name, description, category, tags, location, isPublic, rules } = req.body;
    
    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Name, description, and category are required' });
    }

    // Upload cover image to Cloudinary if provided
    let coverImage = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'tripvisor-groups',
        transformation: [
          { width: 800, height: 400, crop: 'fill' },
          { quality: 'auto' }
        ]
      });
      coverImage = {
        url: result.secure_url,
        publicId: result.public_id
      };
    }

    const group = new TravelGroup({
      name,
      description,
      category,
      owner: req.user._id,
      admins: [req.user._id],
      members: [{
        user: req.user._id,
        role: 'admin'
      }],
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      location: location || '',
      isPublic: isPublic !== 'false',
      rules: rules ? rules.split('\n').filter(rule => rule.trim()) : [],
      memberCount: 1
    });

    if (Object.keys(coverImage).length > 0) {
      group.coverImage = coverImage;
    }

    await group.save();
    
    // Add group to user's owned groups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { ownedGroups: group._id }
    });
    
    // Populate owner details
    await group.populate('owner', 'displayName photoURL customPhotoURL');
    if (group.owner) {
      group.owner.displayPhotoURL = group.owner.customPhotoURL || group.owner.photoURL || '';
    }
    
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create travel group' });
  }
});

// Get all groups with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const groups = await TravelGroup.find(query)
      .populate('owner', 'displayName photoURL customPhotoURL')
      .populate('members.user', 'displayName photoURL customPhotoURL')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Add displayPhotoURL to each group's owner and members
    groups.forEach(group => {
      if (group.owner) {
        group.owner.displayPhotoURL = group.owner.customPhotoURL || group.owner.photoURL || '';
      }
      group.members.forEach(member => {
        if (member.user) {
          member.user.displayPhotoURL = member.user.customPhotoURL || member.user.photoURL || '';
        }
      });
      if (req.user) {
        group.isMember = group.members.some(member => member.user._id.toString() === req.user._id.toString());
        group.isOwner = group.owner._id.toString() === req.user._id.toString();
      }
    });

    const total = await TravelGroup.countDocuments(query);

    res.json({
      groups,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get groups where the authenticated user is a member
router.get('/my-groups', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const groups = await TravelGroup.find({
      'members.user': req.user._id,
      isActive: true
    })
      .populate('owner', 'displayName photoURL customPhotoURL')
      .populate('members.user', 'displayName photoURL customPhotoURL')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Add displayPhotoURL to each group's owner and members
    groups.forEach(group => {
      if (group.owner) {
        group.owner.displayPhotoURL = group.owner.customPhotoURL || group.owner.photoURL || '';
      }
      group.members.forEach(member => {
        if (member.user) {
          member.user.displayPhotoURL = member.user.customPhotoURL || member.user.photoURL || '';
        }
      });
      group.isMember = true;
      group.isOwner = group.owner._id.toString() === req.user._id.toString();
    });

    const total = await TravelGroup.countDocuments({
      'members.user': req.user._id,
      isActive: true
    });

    res.json({
      groups,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching my groups:', error);
    res.status(500).json({ error: 'Failed to fetch my groups' });
  }
});

// Get a single group by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const group = await TravelGroup.findById(req.params.id)
      .populate('owner', 'displayName photoURL customPhotoURL bio')
      .populate('members.user', 'displayName photoURL customPhotoURL')
      .populate('discussions.author', 'displayName photoURL customPhotoURL')
      .populate('discussions.replies.user', 'displayName photoURL customPhotoURL');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    let isMember = false;
    let userRole = null;
    if (req.user) {
      const member = group.members.find(m => m.user._id.toString() === req.user._id.toString());
      if (member) {
        isMember = true;
        userRole = member.role;
      }
    }

    // Convert to object and add displayPhotoURL for all users in the group
    const groupData = group.toObject();
    
    if (groupData.owner) {
      groupData.owner.displayPhotoURL = groupData.owner.customPhotoURL || groupData.owner.photoURL || '';
    }
    
    if (groupData.members) {
      groupData.members.forEach(member => {
        if (member.user) {
          member.user.displayPhotoURL = member.user.customPhotoURL || member.user.photoURL || '';
        }
      });
    }
    
    if (groupData.discussions) {
      groupData.discussions.forEach(discussion => {
        if (discussion.author) {
          discussion.author.displayPhotoURL = discussion.author.customPhotoURL || discussion.author.photoURL || '';
        }
        if (discussion.replies) {
          discussion.replies.forEach(reply => {
            if (reply.user) {
              reply.user.displayPhotoURL = reply.user.customPhotoURL || reply.user.photoURL || '';
            }
          });
        }
      });
    }

    res.json({
      ...groupData,
      isMember,
      userRole
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Join a group
router.post('/:id/join', authenticateUser, async (req, res) => {
  try {
    const group = await TravelGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.isPublic) {
      return res.status(403).json({ error: 'This group is private' });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    // Check if group is full
    if (group.memberCount >= group.maxMembers) {
      return res.status(400).json({ error: 'Group is full' });
    }

    group.members.push({
      user: req.user._id,
      role: 'member'
    });
    group.memberCount += 1;

    await group.save();
    
    // Add group to user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { groups: group._id }
    });

    res.json({ message: 'Successfully joined the group', memberCount: group.memberCount });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave a group
router.post('/:id/leave', authenticateUser, async (req, res) => {
  try {
    const group = await TravelGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const memberIndex = group.members.findIndex(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({ error: 'You are not a member of this group' });
    }

    // Remove user from members
    group.members.splice(memberIndex, 1);
    group.memberCount -= 1;

    // Remove from admins if they were an admin
    const adminIndex = group.admins.indexOf(req.user._id);
    if (adminIndex > -1) {
      group.admins.splice(adminIndex, 1);
    }

    await group.save();
    
    // Remove group from user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { groups: group._id, ownedGroups: group._id }
    });

    res.json({ message: 'Successfully left the group', memberCount: group.memberCount });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Add a discussion to a group
router.post('/:id/discussions', authenticateUser, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Discussion title is required' });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Discussion content is required' });
    }

    const group = await TravelGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member to post discussions' });
    }

    group.discussions.push({
      author: req.user._id,
      title: title.trim(),
      content: content.trim()
    });

    await group.save();
    
    // Populate the new discussion's author details
    await group.populate('discussions.author', 'displayName photoURL customPhotoURL');
    if (group.discussions[group.discussions.length - 1].author) {
      group.discussions[group.discussions.length - 1].author.displayPhotoURL = group.discussions[group.discussions.length - 1].author.customPhotoURL || group.discussions[group.discussions.length - 1].author.photoURL || '';
    }
    
    const newDiscussion = group.discussions[group.discussions.length - 1];
    res.status(201).json(newDiscussion);
  } catch (error) {
    console.error('Error adding discussion:', error);
    res.status(500).json({ error: 'Failed to add discussion' });
  }
});

// Add a reply to a discussion
router.post('/:id/discussions/:discussionId/replies', authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    const group = await TravelGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const discussion = group.discussions.id(req.params.discussionId);
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member to reply' });
    }

    discussion.replies.push({
      user: req.user._id,
      content: content.trim()
    });

    await group.save();
    
    // Populate the new reply's user details
    await group.populate('discussions.replies.user', 'displayName photoURL customPhotoURL');
    if (discussion.replies[discussion.replies.length - 1].user) {
      discussion.replies[discussion.replies.length - 1].user.displayPhotoURL = discussion.replies[discussion.replies.length - 1].user.customPhotoURL || discussion.replies[discussion.replies.length - 1].user.photoURL || '';
    }
    
    const newReply = discussion.replies[discussion.replies.length - 1];
    res.status(201).json(newReply);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Like/Unlike a discussion
router.post('/:id/discussions/:discussionId/like', authenticateUser, async (req, res) => {
  try {
    const group = await TravelGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const discussion = group.discussions.id(req.params.discussionId);
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const likeIndex = discussion.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      // Unlike
      discussion.likes.splice(likeIndex, 1);
    } else {
      // Like
      discussion.likes.push(req.user._id);
    }

    await group.save();
    res.json({ likes: discussion.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    console.error('Error liking discussion:', error);
    res.status(500).json({ error: 'Failed to like discussion' });
  }
});

// Update group (admin only)
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const group = await TravelGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin or owner
    const isAdmin = group.admins.includes(req.user._id) || group.owner.toString() === req.user._id.toString();
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this group' });
    }

    const { name, description, category, tags, location, isPublic, rules } = req.body;
    
    if (name) group.name = name;
    if (description) group.description = description;
    if (category) group.category = category;
    if (tags) group.tags = tags.split(',').map(tag => tag.trim());
    if (location !== undefined) group.location = location;
    if (isPublic !== undefined) group.isPublic = isPublic;
    if (rules) group.rules = rules.split('\n').filter(rule => rule.trim());

    await group.save();
    
    await group.populate('owner', 'displayName photoURL customPhotoURL');
    if (group.owner) {
      group.owner.displayPhotoURL = group.owner.customPhotoURL || group.owner.photoURL || '';
    }
    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group (owner only)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const group = await TravelGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the owner can delete this group' });
    }

    // Delete cover image from Cloudinary
    if (group.coverImage && group.coverImage.publicId) {
      await cloudinary.uploader.destroy(group.coverImage.publicId);
    }

    await TravelGroup.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Get user's groups
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const groups = await TravelGroup.find({
      'members.user': req.params.userId,
      isActive: true
    })
      .populate('owner', 'displayName photoURL customPhotoURL')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Add displayPhotoURL to each group's owner
    groups.forEach(group => {
      if (group.owner) {
        group.owner.displayPhotoURL = group.owner.customPhotoURL || group.owner.photoURL || '';
      }
    });

    const total = await TravelGroup.countDocuments({
      'members.user': req.params.userId,
      isActive: true
    });

    res.json({
      groups,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

export default router; 