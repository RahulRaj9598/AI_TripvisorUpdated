import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create a new blog post
export const createBlog = async (req, res) => {
  try {
    const { title, content, destination, category, tags } = req.body;
    
    if (!title || !content || !destination) {
      return res.status(400).json({ error: 'Title, content, and destination are required' });
    }

    // Upload images to Cloudinary if any
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'tripvisor-blogs',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        images.push({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    }

    const blog = new Blog({
      author: req.user._id,
      title,
      content,
      destination,
      category: category || 'other',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      images
    });

    await blog.save();
    
    // Populate author details
    await blog.populate('author', 'displayName photoURL customPhotoURL');
    if (blog.author) {
      blog.author.displayPhotoURL = blog.author.customPhotoURL || blog.author.photoURL || '';
    }
    
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
};

// Get all blogs with pagination and filters
export const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      destination,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blogs = await Blog.find(query)
      .populate('author', 'displayName photoURL customPhotoURL')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Add displayPhotoURL to each blog's author and isLiked property
    blogs.forEach(blog => {
      if (blog.author) {
        blog.author.displayPhotoURL = blog.author.customPhotoURL || blog.author.photoURL || '';
      }
      if (req.user) {
        blog.isLiked = blog.likes.includes(req.user._id);
      }
    });

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// Get blogs written by the authenticated user
export const getMyBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const blogs = await Blog.find({ author: req.user._id })
      .populate('author', 'displayName photoURL customPhotoURL')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Add displayPhotoURL to each blog's author
    blogs.forEach(blog => {
      if (blog.author) {
        blog.author.displayPhotoURL = blog.author.customPhotoURL || blog.author.photoURL || '';
      }
      blog.isLiked = blog.likes.includes(req.user._id);
    });

    const total = await Blog.countDocuments({ author: req.user._id });

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching my blogs:', error);
    res.status(500).json({ error: 'Failed to fetch my blogs' });
  }
};

// Get a single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'displayName photoURL customPhotoURL')
      .populate('comments.user', 'displayName photoURL customPhotoURL');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Convert to object and add displayPhotoURL to author
    const blogData = blog.toObject();
    if (blogData.author) {
      blogData.author.displayPhotoURL = blogData.author.customPhotoURL || blogData.author.photoURL || '';
    }

    // Add displayPhotoURL to comment users
    blogData.comments.forEach(comment => {
      if (comment.user) {
        comment.user.displayPhotoURL = comment.user.customPhotoURL || comment.user.photoURL || '';
      }
    });

    // Check if current user has liked the blog
    blogData.isLiked = blog.likes.includes(req.user._id);

    // Increment view count if user hasn't viewed it before
    if (!blog.viewedBy.includes(req.user._id)) {
      blog.views += 1;
      blog.viewedBy.push(req.user._id);
      await blog.save();
      blogData.views = blog.views;
    }

    res.json(blogData);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

// Update a blog post
export const updateBlog = async (req, res) => {
  try {
    const { title, content, destination, category, tags } = req.body;
    
    if (!title || !content || !destination) {
      return res.status(400).json({ error: 'Title, content, and destination are required' });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this blog' });
    }

    // Upload new images to Cloudinary if any
    const newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'tripvisor-blogs',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        newImages.push({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    }

    // Update blog fields
    blog.title = title;
    blog.content = content;
    blog.destination = destination;
    blog.category = category || blog.category;
    blog.tags = tags ? tags.split(',').map(tag => tag.trim()) : blog.tags;
    
    // If new images were uploaded, replace the existing ones
    if (newImages.length > 0) {
      // Delete old images from Cloudinary
      if (blog.images && blog.images.length > 0) {
        for (const image of blog.images) {
          if (image.publicId) {
            try {
              await cloudinary.uploader.destroy(image.publicId);
            } catch (error) {
              console.error('Error deleting old image:', error);
            }
          }
        }
      }
      blog.images = newImages;
    }

    await blog.save();
    
    // Populate author details
    await blog.populate('author', 'displayName photoURL customPhotoURL');
    if (blog.author) {
      blog.author.displayPhotoURL = blog.author.customPhotoURL || blog.author.photoURL || '';
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
};

// Delete a blog post
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this blog' });
    }

    // Delete images from Cloudinary
    if (blog.images && blog.images.length > 0) {
      for (const image of blog.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};

// Like/Unlike a blog
export const toggleLikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const likeIndex = blog.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      // Unlike
      blog.likes.splice(likeIndex, 1);
    } else {
      // Like
      blog.likes.push(req.user._id);
    }

    await blog.save();
    
    // Populate author details for frontend
    await blog.populate('author', 'displayName photoURL customPhotoURL');
    if (blog.author) {
      blog.author.displayPhotoURL = blog.author.customPhotoURL || blog.author.photoURL || '';
    }
    
    res.json({ 
      likes: blog.likes.length, 
      isLiked: likeIndex === -1,
      blog: blog
    });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({ error: 'Failed to like blog' });
  }
};

// Add a comment to a blog
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    blog.comments.push({
      user: req.user._id,
      content: content.trim()
    });

    await blog.save();
    
    // Populate the entire blog with all comments and their user details
    await blog.populate('comments.user', 'displayName photoURL customPhotoURL');
    
    // Get the newly added comment (last one in the array)
    const newComment = blog.comments[blog.comments.length - 1];
    
    // Add displayPhotoURL to the new comment's user
    if (newComment.user) {
      newComment.user.displayPhotoURL = newComment.user.customPhotoURL || newComment.user.photoURL || '';
    }
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const comment = blog.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await blog.save();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Share a blog (increment share count)
export const shareBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    blog.shares += 1;
    await blog.save();
    
    res.json({ shares: blog.shares });
  } catch (error) {
    console.error('Error sharing blog:', error);
    res.status(500).json({ error: 'Failed to share blog' });
  }
};

// Create a poll for a blog
export const createPoll = async (req, res) => {
  try {
    const { question, options, endsAt } = req.body;
    
    if (!question || !options || options.length < 2 || options.length > 5) {
      return res.status(400).json({ 
        error: 'Question and 2-5 options are required' 
      });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Only the author can create a poll
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the author can create a poll' });
    }

    // Check if poll already exists
    if (blog.poll && blog.poll.question) {
      return res.status(400).json({ error: 'Poll already exists for this blog' });
    }

    const pollOptions = options.map(option => ({
      text: option,
      votes: [],
      voteCount: 0
    }));

    blog.poll = {
      question,
      options: pollOptions,
      isActive: true,
      endsAt: endsAt ? new Date(endsAt) : null
    };

    await blog.save();
    
    res.status(201).json(blog.poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

// Vote on a poll option
export const voteOnPoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    
    if (optionIndex === undefined || optionIndex < 0) {
      return res.status(400).json({ error: 'Valid option index is required' });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (!blog.poll || !blog.poll.isActive) {
      return res.status(400).json({ error: 'No active poll found' });
    }

    // Check if poll has ended
    if (blog.poll.endsAt && new Date() > blog.poll.endsAt) {
      blog.poll.isActive = false;
      await blog.save();
      return res.status(400).json({ error: 'Poll has ended' });
    }

    if (optionIndex >= blog.poll.options.length) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    // Check if user has already voted
    const hasVoted = blog.poll.options.some(option => 
      option.votes.some(vote => vote.user.toString() === req.user._id.toString())
    );

    if (hasVoted) {
      return res.status(400).json({ error: 'You have already voted on this poll' });
    }

    // Add vote to the selected option
    blog.poll.options[optionIndex].votes.push({
      user: req.user._id,
      createdAt: new Date()
    });

    // Update vote count
    blog.poll.options[optionIndex].voteCount = blog.poll.options[optionIndex].votes.length;

    await blog.save();
    
    res.json({
      message: 'Vote recorded successfully',
      poll: blog.poll
    });
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
};

// Get poll results
export const getPollResults = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (!blog.poll) {
      return res.status(404).json({ error: 'No poll found for this blog' });
    }

    // Calculate total votes
    const totalVotes = blog.poll.options.reduce((sum, option) => sum + option.voteCount, 0);

    // Add percentage to each option
    const pollWithPercentages = {
      ...blog.poll.toObject(),
      totalVotes,
      options: blog.poll.options.map(option => ({
        ...option.toObject(),
        percentage: totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0
      }))
    };

    // If user is authenticated, show if they've voted
    if (req.user) {
      const userVote = blog.poll.options.find(option => 
        option.votes.some(vote => vote.user.toString() === req.user._id.toString())
      );
      pollWithPercentages.userVoted = userVote ? blog.poll.options.indexOf(userVote) : null;
    }

    res.json(pollWithPercentages);
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({ error: 'Failed to fetch poll results' });
  }
};

// End a poll (author only)
export const endPoll = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (!blog.poll) {
      return res.status(404).json({ error: 'No poll found for this blog' });
    }

    // Only the author can end the poll
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the author can end the poll' });
    }

    blog.poll.isActive = false;
    await blog.save();
    
    res.json({ message: 'Poll ended successfully', poll: blog.poll });
  } catch (error) {
    console.error('Error ending poll:', error);
    res.status(500).json({ error: 'Failed to end poll' });
  }
};

// Delete a poll (author only)
export const deletePoll = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (!blog.poll) {
      return res.status(404).json({ error: 'No poll found for this blog' });
    }

    // Only the author can delete the poll
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the author can delete the poll' });
    }

    blog.poll = undefined;
    await blog.save();
    
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
};

// Get user's blogs
export const getUserBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const blogs = await Blog.find({ author: req.params.userId, isPublished: true })
      .populate('author', 'displayName photoURL customPhotoURL')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Add displayPhotoURL to each blog's author
    blogs.forEach(blog => {
      if (blog.author) {
        blog.author.displayPhotoURL = blog.author.customPhotoURL || blog.author.photoURL || '';
      }
    });

    const total = await Blog.countDocuments({ author: req.params.userId, isPublished: true });

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ error: 'Failed to fetch user blogs' });
  }
};
