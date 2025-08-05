import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  MapPin,
  Calendar,
  User,
  Edit,
  Trash2,
  Send,
  MoreVertical,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import Poll from './components/Poll';

const BlogDetail = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lastCommentCount, setLastCommentCount] = useState(0);
  const [newCommentsFound, setNewCommentsFound] = useState(false);
  const hasFetchedRef = useRef(false);
  const pollingIntervalRef = useRef(null);
  const lastCommentCountRef = useRef(0);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      toast.error('Please login to view individual blogs');
      navigate('/blogs');
      return;
    }

    if (!hasFetchedRef.current) {
      fetchBlog();
      hasFetchedRef.current = true;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Start polling for new comments
    pollingIntervalRef.current = setInterval(checkForNewComments, 2000); // Check every 2 seconds
    console.log('🚀 Started polling for new comments every 2 seconds');

    // Cleanup function to stop polling
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        console.log('🛑 Stopped polling for new comments');
      }
    };
  }, [blogId, navigate]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
          const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}`, {
      headers
    });
      
      if (response.ok) {
        const data = await response.json();
        setBlog(data);
        setLastCommentCount(data.comments?.length || 0);
        lastCommentCountRef.current = data.comments?.length || 0;
      } else {
        toast.error('Blog not found');
        navigate('/blogs');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  };

  const checkForNewComments = async () => {
    try {
      console.log('🔍 Checking for new comments...'); // Debug log
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        const currentCommentCount = data.comments?.length || 0;
        
        console.log(`📊 Current: ${currentCommentCount}, Last: ${lastCommentCountRef.current}`); // Debug log
        
        // Only update if there are new comments
        if (currentCommentCount > lastCommentCountRef.current) {
          console.log(`🎉 Found ${currentCommentCount - lastCommentCountRef.current} new comments!`);
          setBlog(data);
          setLastCommentCount(currentCommentCount);
          lastCommentCountRef.current = currentCommentCount;
          setNewCommentsFound(true);
          
          // Show a subtle notification
          if (currentCommentCount - lastCommentCountRef.current === 1) {
            toast.success('New comment added!');
          } else {
            toast.success(`${currentCommentCount - lastCommentCountRef.current} new comments added!`);
          }
          
          // Clear the indicator after 3 seconds
          setTimeout(() => setNewCommentsFound(false), 3000);
        } else {
          console.log('✅ No new comments found');
        }
      } else {
        console.log('❌ Failed to fetch blog for polling');
      }
    } catch (error) {
      console.error('Error checking for new comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like blogs');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlog(prev => ({
          ...prev,
          likes: data.blog.likes,
          isLiked: data.isLiked
        }));
      } else {
        toast.error('Failed to like blog');
      }
    } catch (error) {
      console.error('Error liking blog:', error);
      toast.error('Failed to like blog');
    }
  };

  const handleShare = async () => {
    try {
      // First, increment the share count on the backend
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}/share`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setBlog(prev => ({
          ...prev,
          shares: data.shares
        }));
        
        // Try to use the Web Share API
        if (navigator.share) {
          try {
            await navigator.share({
              title: blog.title,
              text: `Check out this amazing travel blog about ${blog.destination} by ${blog.author.displayName}`,
              url: window.location.href
            });
            toast.success('Blog shared successfully!');
          } catch (shareError) {
            console.log('Share cancelled or failed:', shareError);
            // Fallback to copying URL
            await copyToClipboard();
          }
        } else {
          // Fallback for browsers that don't support Web Share API
          await copyToClipboard();
        }
      } else {
        toast.error('Failed to share blog');
      }
    } catch (error) {
      console.error('Error sharing blog:', error);
      toast.error('Failed to share blog');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Blog URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Blog URL copied to clipboard!');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: comment })
      });

      if (response.ok) {
        const newComment = await response.json();
        console.log('New comment received:', newComment); // Debug log
        
        // Ensure the comment has all required fields
        const commentWithUser = {
          ...newComment,
          user: {
            _id: newComment.user._id || user._id,
            displayName: newComment.user.displayName || user.displayName,
            displayPhotoURL: newComment.user.displayPhotoURL || user.displayPhotoURL || user.photoURL || ''
          },
          createdAt: newComment.createdAt || new Date().toISOString()
        };
        
        setBlog(prev => {
          const updatedBlog = {
            ...prev,
            comments: [...prev.comments, commentWithUser]
          };
          console.log('Updated blog state:', updatedBlog); // Debug log
          return updatedBlog;
        });
        setComment('');
        setLastCommentCount(prev => prev + 1); // Update comment count immediately
        lastCommentCountRef.current += 1; // Update ref immediately
        toast.success('Comment added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Comment submission failed:', errorData);
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBlog(prev => ({
          ...prev,
          comments: prev.comments.filter(c => c._id !== commentId)
        }));
        toast.success('Comment deleted successfully!');
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleDeleteBlog = async () => {
    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Blog deleted successfully!');
        navigate('/blogs');
      } else {
        toast.error('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isAuthor = user && blog && user._id === blog.author._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/blogs')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <Link to={`/profile/${blog.author._id}`} className="hover:text-orange-600">
                      {blog.author.displayName}
                    </Link>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(blog.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {blog.destination}
                  </div>
                </div>
              </div>
            </div>
            {isAuthor && (
              <div className="flex items-center gap-2">
                <Link to={`/blogs/${blogId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleDeleteBlog}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Blog Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {blog.images && blog.images.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={blog.images[currentImageIndex].url}
                      alt={blog.title}
                      className="w-full h-96 object-cover"
                    />
                    {blog.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {blog.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blog Content */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">
                    {blog.category}
                  </Badge>
                  {blog.tags && blog.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="prose max-w-none">
                  {blog.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 hover:text-red-500 transition-colors ${
                        blog.isLiked ? 'text-red-500' : 'text-gray-500'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                      <span>{blog.likes?.length || 0}</span>
                    </button>
                    <div className="flex items-center gap-2 text-gray-500">
                      <MessageCircle className="w-5 h-5" />
                      <span>{blog.comments?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Eye className="w-5 h-5" />
                      <span>{blog.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Share2 className="w-5 h-5" />
                      <span>{blog.shares || 0}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    className="text-gray-500 hover:text-orange-600 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Poll */}
            <Poll 
              blogId={blogId} 
              blog={blog} 
              user={user} 
              onPollUpdate={(updatedPoll) => {
                setBlog(prev => ({
                  ...prev,
                  poll: updatedPoll
                }));
              }}
            />

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    Comments ({blog.comments?.length || 0})
                    {newCommentsFound && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                  <button
                    onClick={fetchBlog}
                    className="text-sm text-gray-500 hover:text-orange-600 transition-colors"
                    title="Refresh comments"
                  >
                    ↻ Refresh
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment */}
                {user && (
                  <form onSubmit={handleComment} className="flex gap-2">
                    <Input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      disabled={submittingComment}
                    />
                    <Button type="submit" disabled={submittingComment || !comment.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {blog.comments && blog.comments.length > 0 ? (
                    blog.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={comment.user?.displayPhotoURL && comment.user.displayPhotoURL !== '' ? comment.user.displayPhotoURL : '/avatar.png'}
                          alt={comment.user?.displayName || 'User'}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            e.target.src = '/placeholder.jpeg';
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Link 
                                to={`/profile/${comment.user?._id || ''}`}
                                className="font-semibold text-gray-900 hover:text-orange-600"
                              >
                                {comment.user?.displayName || 'Anonymous User'}
                              </Link>
                              <p className="text-sm text-gray-500">
                                {formatDate(comment.createdAt)}
                              </p>
                            </div>
                            {(user && user._id === comment.user?._id) && (
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 mt-2">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={blog.author.displayPhotoURL && blog.author.displayPhotoURL !== '' ? blog.author.displayPhotoURL : '/avatar.png'}
                    alt={blog.author.displayName}
                    className="w-16 h-16 rounded-full"
                    onError={(e) => {
                      e.target.src = '/placeholder.jpeg';
                    }}
                  />
                  <div>
                    <Link 
                      to={`/profile/${blog.author._id}`}
                      className="font-semibold text-gray-900 hover:text-orange-600"
                    >
                      {blog.author.displayName}
                    </Link>
                    {blog.author.bio && (
                      <p className="text-sm text-gray-600 mt-1">{blog.author.bio}</p>
                    )}
                  </div>
                </div>
                <Link to={`/profile/${blog.author._id}`}>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Blog Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Blog Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">{blog.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-semibold">{blog.likes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-semibold">{blog.comments?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shares</span>
                  <span className="font-semibold">{blog.shares || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Blogs */}
            <Card>
              <CardHeader>
                <CardTitle>More from {blog.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Discover more {blog.category} travel stories
                </p>
                <Link to={`/blogs?category=${blog.category}`}>
                  <Button variant="outline" className="w-full mt-3">
                    Explore More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 