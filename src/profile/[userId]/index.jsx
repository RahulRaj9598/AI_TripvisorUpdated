import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Eye,
  Users,
  Plus,
  UserPlus,
  UserMinus,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Linkedin
} from 'lucide-react';
import { toast } from 'sonner';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('blogs');
  const [mutualStatus, setMutualStatus] = useState(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [myBlogs, setMyBlogs] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/users/${userId}`, {
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          
          // Fetch user's blogs and groups
          fetchUserBlogs();
          fetchUserGroups();
          
          // If it's the user's own profile, fetch their own blogs and groups
          if (currentUser && data._id === currentUser._id) {
            fetchMyBlogs();
            fetchMyGroups();
          }
        } else {
          toast.error('User not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
    
    // Fetch current user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, [userId, navigate]);

  // Check if current user is viewing their own profile
  const isOwnProfile = currentUser && user && currentUser._id === user._id;

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/users/${userId}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        toast.error('User not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && user) {
      checkMutualStatus();
    }
  }, [currentUser, user]);

  const fetchUserBlogs = async () => {
    try {
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/user/${userId}?page=1&limit=6`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs);
      }
    } catch (error) {
      console.error('Error fetching user blogs:', error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/groups/user/${userId}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const fetchMyBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/my-blogs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error('Error fetching my blogs:', error);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/groups/my-groups`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching my groups:', error);
    }
  };

  const checkMutualStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/users/${userId}/mutual-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMutualStatus(data);
      }
    } catch (error) {
      console.error('Error checking mutual status:', error);
    }
  };

  const fetchMutualFollowers = async () => {
    try {
      setLoadingFollowers(true);
      const token = localStorage.getItem('token');
      
      // If user is viewing their own profile, use regular followers endpoint
      const endpoint = isOwnProfile 
        ? `https://ai-tripvisorupdated-1.onrender.com/api/users/${userId}/followers`
        : `https://ai-tripvisorupdated-1.onrender.com/api/users/${userId}/followers/mutual`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFollowers(data.followers || data);
        setShowFollowersModal(true);
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          toast.error('You can only view followers if you are mutually following each other');
        } else {
          toast.error('Failed to fetch followers');
        }
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error('Failed to fetch followers');
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchMutualFollowing = async () => {
    try {
      setLoadingFollowing(true);
      const token = localStorage.getItem('token');
      
      // If user is viewing their own profile, use regular following endpoint
      const endpoint = isOwnProfile 
        ? `https://ai-tripvisorupdated-1.onrender.com/api/users/${userId}/following`
        : `https://ai-tripvisorupdated-1.onrender.com/api/users/${userId}/following/mutual`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following || data);
        setShowFollowingModal(true);
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          toast.error('You can only view following if you are mutually following each other');
        } else {
          toast.error('Failed to fetch following');
        }
      }
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error('Failed to fetch following');
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please login to follow users');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => ({
          ...prev,
          isFollowing: data.isFollowing,
          stats: {
            ...prev.stats,
            followers: data.followersCount
          }
        }));
        toast.success(data.isFollowing ? 'Successfully followed!' : 'Unfollowed');
        // Recheck mutual status after follow/unfollow
        checkMutualStatus();
      } else {
        toast.error('Failed to follow user');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <img
                src={user.displayPhotoURL && user.displayPhotoURL !== '' ? user.displayPhotoURL : '/avatar.png'}
                alt={user.displayName}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = '/placeholder.jpeg';
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.displayName}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  {user.location && (
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {user.location}
                    </div>
                  )}
                  {user.bio && (
                    <p className="text-gray-700 mt-2 max-w-2xl">{user.bio}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollow}
                      variant={user.isFollowing ? "outline" : "default"}
                      className={user.isFollowing ? "text-red-600 hover:text-red-700" : "bg-orange-600 hover:bg-orange-700"}
                    >
                      {user.isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Link to="/profile">
                      <Button variant="outline">
                        <User className="w-4 h-4 mr-1" />
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats?.blogs || 0}</div>
              <div className="text-sm text-gray-600">Blogs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats?.groups || 0}</div>
              <div className="text-sm text-gray-600">Groups</div>
            </div>
            <div className="text-center">
              {(mutualStatus?.isMutual || isOwnProfile) ? (
                <button
                  onClick={fetchMutualFollowers}
                  disabled={loadingFollowers}
                  className="text-2xl font-bold text-gray-900 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  {user.stats?.followers || 0}
                </button>
              ) : (
                <div className="text-2xl font-bold text-gray-900">{user.stats?.followers || 0}</div>
              )}
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              {(mutualStatus?.isMutual || isOwnProfile) ? (
                <button
                  onClick={fetchMutualFollowing}
                  disabled={loadingFollowing}
                  className="text-2xl font-bold text-gray-900 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  {user.stats?.following || 0}
                </button>
              ) : (
                <div className="text-2xl font-bold text-gray-900">{user.stats?.following || 0}</div>
              )}
              <div className="text-sm text-gray-600">Following</div>
            </div>
          </div>

          {/* Social Links */}
          {user.socialLinks && Object.values(user.socialLinks).some(link => link) && (
            <div className="flex gap-4 mt-4 pt-4 border-t">
              {user.socialLinks.instagram && (
                <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {user.socialLinks.twitter && (
                <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {user.socialLinks.facebook && (
                <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:text-blue-900">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {user.socialLinks.linkedin && (
                <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('blogs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'blogs'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Blogs ({blogs.length})
              </button>
              
              <button
                onClick={() => setActiveTab('groups')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'groups'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Groups ({groups.length})
              </button>
              
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'blogs' ? (
              <div>
                {blogs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📝</div>
                    <p className="text-gray-600">No blogs yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                      <Card key={blog._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {blog.images && blog.images.length > 0 && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={blog.images[0].url}
                              alt={blog.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {blog.category}
                            </Badge>
                            <div className="flex items-center text-gray-500 text-sm">
                              <MapPin className="w-3 h-3 mr-1" />
                              {blog.destination}
                            </div>
                          </div>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            <Link to={`/blogs/${blog._id}`} className="hover:text-orange-600">
                              {blog.title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {truncateText(blog.content)}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {blog.likes?.length || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {blog.comments?.length || 0}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(blog.createdAt)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'my-blogs' ? (
              <div>
                {myBlogs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📝</div>
                    <p className="text-gray-600">No blogs yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myBlogs.map((blog) => (
                      <Card key={blog._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {blog.images && blog.images.length > 0 && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={blog.images[0].url}
                              alt={blog.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {blog.category}
                            </Badge>
                            <div className="flex items-center text-gray-500 text-sm">
                              <MapPin className="w-3 h-3 mr-1" />
                              {blog.destination}
                            </div>
                          </div>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            <Link to={`/blogs/${blog._id}`} className="hover:text-orange-600">
                              {blog.title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {truncateText(blog.content)}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {blog.likes?.length || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {blog.comments?.length || 0}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(blog.createdAt)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'groups' ? (
              <div>
                {groups.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">👥</div>
                    <p className="text-gray-600">No groups yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                      <Card key={group._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {group.coverImage && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={group.coverImage.url}
                              alt={group.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {group.category}
                            </Badge>
                            {group.location && (
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPin className="w-3 h-3 mr-1" />
                                {group.location}
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            <Link to={`/groups/${group._id}`} className="hover:text-orange-600">
                              {group.name}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {truncateText(group.description)}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {group.members?.length || 0} members
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(group.createdAt)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'my-groups' ? (
              <div>
                {myGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">👥</div>
                    <p className="text-gray-600">You haven't joined any groups yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myGroups.map((group) => (
                      <Card key={group._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {group.coverImage && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={group.coverImage.url}
                              alt={group.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {group.category}
                            </Badge>
                            {group.location && (
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPin className="w-3 h-3 mr-1" />
                                {group.location}
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            <Link to={`/groups/${group._id}`} className="hover:text-orange-600">
                              {group.name}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {truncateText(group.description)}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {group.members?.length || 0} members
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(group.createdAt)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {isOwnProfile ? 'Your Followers' : 'Mutual Followers'}
              </h3>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {followers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {isOwnProfile ? 'No followers yet' : 'No mutual followers'}
              </p>
            ) : (
              <div className="space-y-3">
                {followers.map((follower) => (
                  <div key={follower._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <img
                      src={follower.displayPhotoURL && follower.displayPhotoURL !== '' ? follower.displayPhotoURL : '/avatar.png'}
                      alt={follower.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpeg';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{follower.displayName}</p>
                      {follower.bio && (
                        <p className="text-sm text-gray-600 truncate">{follower.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {isOwnProfile ? 'People You Follow' : 'Mutual Following'}
              </h3>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {following.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {isOwnProfile ? 'Not following anyone yet' : 'No mutual following'}
              </p>
            ) : (
              <div className="space-y-3">
                {following.map((followed) => (
                  <div key={followed._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <img
                      src={followed.displayPhotoURL && followed.displayPhotoURL !== '' ? followed.displayPhotoURL : '/avatar.png'}
                      alt={followed.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpeg';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{followed.displayName}</p>
                      {followed.bio && (
                        <p className="text-sm text-gray-600 truncate">{followed.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 