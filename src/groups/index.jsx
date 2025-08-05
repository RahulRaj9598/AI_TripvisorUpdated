import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Users, 
  MapPin, 
  Calendar,
  Filter,
  MessageCircle,
  Eye,
  UserPlus,
  UserMinus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [user, setUser] = useState(null);

  const categories = [
    'wild', 'mountain', 'international', 'beaches', 'religious', 
    'cultural', 'adventure', 'luxury', 'budget', 'family', 'solo', 'mixed'
  ];

  useEffect(() => {
    fetchGroups();
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [search, category, location, sortBy, currentPage]);

  const fetchGroups = async () => {
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
      if (location) params.append('location', location);

      const response = await fetch(`http://localhost:3001/api/groups?${params}`);
      const data = await response.json();

      if (response.ok) {
        setGroups(data.groups);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Failed to fetch groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) {
      toast.error('Please login to join groups');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(groups.map(group => 
          group._id === groupId 
            ? { ...group, isMember: true, memberCount: data.memberCount }
            : group
        ));
        toast.success('Successfully joined the group!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(groups.map(group => 
          group._id === groupId 
            ? { ...group, isMember: false, memberCount: data.memberCount }
            : group
        ));
        toast.success('Successfully left the group');
      } else {
        toast.error('Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!user) {
      toast.error('Please login to delete groups');
      return;
    }

    // Add confirmation dialog
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setGroups(groups.filter(group => group._id !== groupId));
        toast.success('Group deleted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Travel Groups</h1>
              <p className="text-gray-600 mt-2">Connect with fellow travelers and join communities based on your interests</p>
            </div>
            {user && (
              <Link to="/groups/create">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
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
            <Input
              placeholder="Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="createdAt">Latest</option>
              <option value="memberCount">Most Members</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
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
                <CardHeader className="pb-3">
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
                  <CardTitle className="text-lg line-clamp-2">
                    <Link to={`/groups/${group._id}`} className="hover:text-orange-600">
                      {group.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {truncateText(group.description)}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <img
                          src={group.owner?.displayPhotoURL && group.owner.displayPhotoURL !== '' ? group.owner.displayPhotoURL : '/avatar.png'}
                          alt="Owner"
                          className="w-5 h-5 rounded-full mr-2"
                          onError={(e) => {
                            e.target.src = '/placeholder.jpeg';
                          }}
                        />
                        <Users className="w-4 h-4 mr-1" />
                        {group.memberCount} members
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(group.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {group.discussions?.length || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {group.isPublic ? 'Public' : 'Private'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {user && user._id === group.owner._id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGroup(group._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      )}
                      {user ? (
                        group.isMember ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeaveGroup(group._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserMinus className="w-4 h-4 mr-1" />
                            Leave
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleJoinGroup(group._id)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        )
                      ) : (
                        <Link to="/">
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            <UserPlus className="w-4 h-4 mr-1" />
                            Login to Join
                          </Button>
                        </Link>
                      )}
                    </div>
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

export default Groups; 