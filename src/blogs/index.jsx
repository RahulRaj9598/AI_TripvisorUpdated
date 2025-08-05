import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  Filter,
  MapPin,
  Calendar,
  User,
  Lock,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState(null);

  const categories = [
    'wild', 'mountain', 'international', 'beaches', 'religious', 
    'cultural', 'adventure', 'luxury', 'budget', 'family', 'solo'
  ];

  useEffect(() => {
    fetchBlogs();
    // Get user from localStorage if available
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [search, category, sortBy, currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder: 'desc'
      });

      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBlogs(data.blogs);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
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
        setBlogs(blogs.map(blog => 
          blog._id === blogId 
            ? { ...blog, likes: data.blog.likes, isLiked: data.isLiked }
            : blog
        ));
      } else {
        toast.error('Failed to like blog');
      }
    } catch (error) {
      console.error('Error liking blog:', error);
      toast.error('Failed to like blog');
    }
  };

  const handleShare = async (blogId) => {
    try {
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}/share`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setBlogs(blogs.map(blog => 
          blog._id === blogId 
            ? { ...blog, shares: data.shares }
            : blog
        ));
        
        // Try to use the Web Share API
        if (navigator.share) {
          try {
            const blog = blogs.find(b => b._id === blogId);
            await navigator.share({
              title: blog.title,
              text: `Check out this amazing travel blog about ${blog.destination} by ${blog.author.displayName}`,
              url: `${window.location.origin}/blogs/${blogId}`
            });
            toast.success('Blog shared successfully!');
          } catch (shareError) {
            console.log('Share cancelled or failed:', shareError);
            await copyToClipboard(blogId);
          }
        } else {
          await copyToClipboard(blogId);
        }
      } else {
        toast.error('Failed to share blog');
      }
    } catch (error) {
      console.error('Error sharing blog:', error);
      toast.error('Failed to share blog');
    }
  };

  const copyToClipboard = async (blogId) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/blogs/${blogId}`);
      toast.success('Blog URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      const textArea = document.createElement('textarea');
      textArea.value = `${window.location.origin}/blogs/${blogId}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Blog URL copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleBlogClick = (blogId) => {
    if (!user) {
      toast.error('Please login to view individual blogs');
      return;
    }
    // If user is logged in, the Link component will handle navigation
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Travel Blogs</h1>
              <p className="text-gray-600 mt-2">Discover amazing travel experiences and stories from fellow travelers</p>
            </div>
            {user && (
              <Link to="/blogs/create">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Write Blog
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Login Notice for Non-authenticated Users */}
        {!user && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Login Required</h3>
                <p className="text-orange-700 text-sm">
                  You need to login to view individual blog posts. You can still browse and search blogs here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search blogs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="createdAt">Latest</option>
              <option value="likes">Most Liked</option>
              <option value="views">Most Viewed</option>
              <option value="shares">Most Shared</option>
            </select>
          </div>
        </div>

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Card key={blog._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {blog.images && blog.images.length > 0 && (
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={blog.images[0].url}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                    {!user && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {blog.category}
                    </Badge>
                    {blog.poll && (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Poll
                      </Badge>
                    )}
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      {blog.destination}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {user ? (
                      <Link to={`/blogs/${blog._id}`} className="hover:text-orange-600">
                        {blog.title}
                      </Link>
                    ) : (
                      <button 
                        onClick={() => handleBlogClick(blog._id)}
                        className="hover:text-orange-600 text-left"
                      >
                        {blog.title}
                      </button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {truncateText(blog.content)}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <img
                          src={blog.author?.displayPhotoURL && blog.author.displayPhotoURL !== '' ? blog.author.displayPhotoURL : '/avatar.png'}
                          alt={blog.author?.displayName}
                          className="w-5 h-5 rounded-full mr-2"
                          onError={(e) => {
                            e.target.src = '/placeholder.jpeg';
                          }}
                        />
                        <User className="w-4 h-4 mr-1" />
                        {blog.author?.displayName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(blog.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleLike(blog._id)}
                        className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                          blog.isLiked ? 'text-red-500' : ''
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                        {blog.likes?.length || 0}
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {blog.comments?.length || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {blog.views || 0}
                      </div>
                    </div>
                    <button
                      onClick={() => handleShare(blog._id)}
                      className="text-gray-500 hover:text-orange-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs; 