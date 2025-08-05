import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  MapPin,
  Calendar, 
  User,
  Edit,
  Trash2,
  Send,
  MoreVertical,
  UserPlus, 
  UserMinus,
  Crown,
  Shield,
  Heart,
  Reply
} from 'lucide-react';
import { toast } from 'sonner';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionContent, setDiscussionContent] = useState('');
  const [submittingDiscussion, setSubmittingDiscussion] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [newDiscussionsFound, setNewDiscussionsFound] = useState(false);
  const [newRepliesFound, setNewRepliesFound] = useState({});
  const pollingIntervalRef = useRef(null);
  const lastDiscussionCountRef = useRef(0);
  const lastReplyCountsRef = useRef({});

  useEffect(() => {
    fetchGroup();
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [groupId]);

  useEffect(() => {
    // Only start polling if we have group data
    if (group && !loading) {
      // Start polling for new discussions and replies
      pollingIntervalRef.current = setInterval(checkForNewContent, 3000); // Check every 3 seconds
      console.log('🚀 Started polling for new group content every 3 seconds');

      // Cleanup function to stop polling
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          console.log('🛑 Stopped polling for new group content');
        }
      };
    }
  }, [groupId, group, loading]);

  const checkForNewContent = async () => {
    try {
      console.log('🔍 Checking for new group content...'); // Debug log
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/groups/${groupId}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        const currentDiscussionCount = data.discussions?.length || 0;
        
        console.log(`📊 Current discussions: ${currentDiscussionCount}, Last: ${lastDiscussionCountRef.current}`); // Debug log
        
        // Check for new discussions
        if (currentDiscussionCount > lastDiscussionCountRef.current) {
          console.log(`🎉 Found ${currentDiscussionCount - lastDiscussionCountRef.current} new discussions!`);
          setGroup(data);
          lastDiscussionCountRef.current = currentDiscussionCount;
          setNewDiscussionsFound(true);
          
          // Show a subtle notification
          if (currentDiscussionCount - lastDiscussionCountRef.current === 1) {
            toast.success('New discussion added!');
          } else {
            toast.success(`${currentDiscussionCount - lastDiscussionCountRef.current} new discussions added!`);
          }
          
          // Clear the indicator after 3 seconds
          setTimeout(() => setNewDiscussionsFound(false), 3000);
        } else if (currentDiscussionCount === lastDiscussionCountRef.current) {
          // Check for new replies in each discussion
          if (data.discussions) {
            let hasNewReplies = false;
            const updatedReplyCounts = {};
            
            data.discussions.forEach(discussion => {
              const currentReplyCount = discussion.replies?.length || 0;
              const lastReplyCount = lastReplyCountsRef.current[discussion._id] || 0;
              updatedReplyCounts[discussion._id] = currentReplyCount;
              
              if (currentReplyCount > lastReplyCount) {
                console.log(`💬 Found ${currentReplyCount - lastReplyCount} new replies in discussion ${discussion._id}!`);
                hasNewReplies = true;
                setNewRepliesFound(prev => ({
                  ...prev,
                  [discussion._id]: true
                }));
                
                // Show notification for new replies
                if (currentReplyCount - lastReplyCount === 1) {
                  toast.success(`New reply in "${discussion.title}"!`);
                } else {
                  toast.success(`${currentReplyCount - lastReplyCount} new replies in "${discussion.title}"!`);
                }
                
                // Clear the indicator after 3 seconds
                setTimeout(() => {
                  setNewRepliesFound(prev => ({
                    ...prev,
                    [discussion._id]: false
                  }));
                }, 3000);
              }
            });
            
            // Update reply counts and group data if there are new replies
            if (hasNewReplies) {
              setGroup(data);
              lastReplyCountsRef.current = updatedReplyCounts;
            }
          }
        } else {
          console.log('✅ No new content found');
        }
      } else {
        console.log('❌ Failed to fetch group for polling');
      }
    } catch (error) {
      console.error('Error checking for new group content:', error);
    }
  };

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/groups/${groupId}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(data);
        
        // Initialize polling state
        lastDiscussionCountRef.current = data.discussions?.length || 0;
        const initialReplyCounts = {};
        if (data.discussions) {
          data.discussions.forEach(discussion => {
            initialReplyCounts[discussion._id] = discussion.replies?.length || 0;
          });
        }
        lastReplyCountsRef.current = initialReplyCounts;
      } else {
        toast.error('Group not found');
        navigate('/groups');
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to fetch group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      toast.error('Please login to join groups');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(prev => ({
          ...prev,
          isMember: true,
          memberCount: data.memberCount
        }));
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

  const handleLeaveGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(prev => ({
          ...prev,
          isMember: false,
          memberCount: data.memberCount
        }));
        toast.success('Successfully left the group');
      } else {
        toast.error('Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to create discussions');
      return;
    }

    if (!discussionTitle.trim() || !discussionContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmittingDiscussion(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/groups/${groupId}/discussions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: discussionTitle.trim(),
          content: discussionContent.trim()
        })
      });

      if (response.ok) {
        const newDiscussion = await response.json();
        setGroup(prev => ({
          ...prev,
          discussions: [...prev.discussions, newDiscussion]
        }));
        setDiscussionTitle('');
        setDiscussionContent('');
        lastDiscussionCountRef.current += 1; // Update discussion count immediately
        toast.success('Discussion created successfully!');
      } else {
        toast.error('Failed to create discussion');
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast.error('Failed to create discussion');
    } finally {
      setSubmittingDiscussion(false);
    }
  };

  const handleAddReply = async (discussionId) => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/groups/${groupId}/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: replyContent.trim() })
      });

      if (response.ok) {
        const newReply = await response.json();
        setGroup(prev => ({
          ...prev,
          discussions: prev.discussions.map(discussion => 
            discussion._id === discussionId
              ? { ...discussion, replies: [...discussion.replies, newReply] }
              : discussion
          )
        }));
        setReplyContent('');
        setReplyingTo(null);
        lastReplyCountsRef.current[discussionId] = (lastReplyCountsRef.current[discussionId] || 0) + 1; // Update reply count immediately
        toast.success('Reply added successfully!');
      } else {
        toast.error('Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleLikeDiscussion = async (discussionId) => {
    if (!user) {
      toast.error('Please login to like discussions');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/groups/${groupId}/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(prev => ({
          ...prev,
          discussions: prev.discussions.map(discussion => 
            discussion._id === discussionId
              ? { ...discussion, likes: data.likes, isLiked: data.isLiked }
              : discussion
          )
        }));
      } else {
        toast.error('Failed to like discussion');
      }
    } catch (error) {
      console.error('Error liking discussion:', error);
      toast.error('Failed to like discussion');
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Group deleted successfully!');
        navigate('/groups');
      } else {
        toast.error('Failed to delete group');
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

  const isOwner = user && group && user._id === group.owner._id;
  const isAdmin = user && group && (group.admins.includes(user._id) || isOwner);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/groups')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <Link to={`/profile/${group.owner._id}`} className="hover:text-orange-600">
                      {group.owner.displayName}
                    </Link>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(group.createdAt)}
                  </div>
                  {group.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {group.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2">
                <Link to={`/groups/${groupId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleDeleteGroup}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Group Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">
                    {group.category}
                  </Badge>
                  {group.tags && group.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="prose max-w-none">
                  {group.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {group.rules && group.rules.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Group Rules</h3>
                    <ul className="space-y-2">
                      {group.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-orange-600 mt-1">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Join/Leave Button */}
            {user && (
              <Card>
                <CardContent className="p-6">
                  {group.isMember ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-medium">You are a member</span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleLeaveGroup}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        Leave Group
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600">Join this group to participate</span>
                      </div>
                      <Button
                        onClick={handleJoinGroup}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Join Group
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Discussions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    Discussions ({group.discussions?.length || 0})
                    {newDiscussionsFound && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                  <button
                    onClick={fetchGroup}
                    className="text-sm text-gray-500 hover:text-orange-600 transition-colors"
                    title="Refresh discussions"
                  >
                    ↻ Refresh
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create Discussion */}
                {user && group.isMember && (
                  <form onSubmit={handleCreateDiscussion} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <Input
                      value={discussionTitle}
                      onChange={(e) => setDiscussionTitle(e.target.value)}
                      placeholder="Discussion title..."
                      disabled={submittingDiscussion}
                    />
                    <Textarea
                      value={discussionContent}
                      onChange={(e) => setDiscussionContent(e.target.value)}
                      placeholder="Start a discussion..."
                      rows={3}
                      disabled={submittingDiscussion}
                    />
                    <Button type="submit" disabled={submittingDiscussion || !discussionTitle.trim() || !discussionContent.trim()}>
                      <Send className="w-4 h-4 mr-1" />
                      Create Discussion
                    </Button>
                  </form>
                )}

                {/* Discussions List */}
                <div className="space-y-6">
                  {group.discussions && group.discussions.length > 0 ? (
                    group.discussions.map((discussion) => (
                      <div key={discussion._id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <img
                            src={discussion.author.displayPhotoURL && discussion.author.displayPhotoURL !== '' ? discussion.author.displayPhotoURL : '/avatar.png'}
                            alt={discussion.author.displayName}
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              e.target.src = '/placeholder.jpeg';
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <Link 
                                  to={`/profile/${discussion.author._id}`}
                                  className="font-semibold text-gray-900 hover:text-orange-600"
                                >
                                  {discussion.author.displayName}
                                </Link>
                                <p className="text-sm text-gray-500">
                                  {formatDate(discussion.createdAt)}
                                </p>
                              </div>
                              <button
                                onClick={() => handleLikeDiscussion(discussion._id)}
                                className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                                  discussion.isLiked ? 'text-red-500' : 'text-gray-500'
                                }`}
                              >
                                <Heart className="w-4 h-4" />
                                {discussion.likes?.length || 0}
                              </button>
                            </div>
                            <h3 className="font-semibold text-gray-900 mt-2">{discussion.title}</h3>
                            <p className="text-gray-700 mt-2">{discussion.content}</p>
                          </div>
                        </div>

                        {/* Replies */}
                        {discussion.replies && discussion.replies.length > 0 && (
                          <div className="ml-12 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-700">
                                Replies ({discussion.replies.length})
                              </h4>
                              {newRepliesFound[discussion._id] && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                                  New
                                </span>
                              )}
                            </div>
                            {discussion.replies.map((reply) => (
                              <div key={reply._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                <img
                                  src={reply.user.displayPhotoURL && reply.user.displayPhotoURL !== '' ? reply.user.displayPhotoURL : '/avatar.png'}
                                  alt={reply.user.displayName}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <Link 
                                      to={`/profile/${reply.user._id}`}
                                      className="font-semibold text-gray-900 hover:text-orange-600"
                                    >
                                      {reply.user.displayName}
                                    </Link>
                                    <p className="text-sm text-gray-500">
                                      {formatDate(reply.createdAt)}
                                    </p>
                                  </div>
                                  <p className="text-gray-700 mt-1">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Reply */}
                        {user && group.isMember && (
                          <div className="ml-12 mt-3">
                            {replyingTo === discussion._id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="Write a reply..."
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddReply(discussion._id)}
                                    disabled={!replyContent.trim()}
                                  >
                                    <Send className="w-4 h-4 mr-1" />
                                    Reply
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyContent('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReplyingTo(discussion._id)}
                                className="text-gray-500 hover:text-orange-600 text-sm flex items-center gap-1"
                              >
                                <Reply className="w-4 h-4" />
                                Reply
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No discussions yet. Start the first one!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Group Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Group Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Members</span>
                  <span className="font-semibold">{group.memberCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discussions</span>
                  <span className="font-semibold">{group.discussions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Privacy</span>
                  <span className="font-semibold">{group.isPublic ? 'Public' : 'Private'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle>Members ({group.members?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.members && group.members.slice(0, 10).map((member) => (
                    <div key={member.user._id} className="flex items-center gap-3">
                      <img
                        src={member.user.displayPhotoURL && member.user.displayPhotoURL !== '' ? member.user.displayPhotoURL : '/avatar.png'}
                        alt={member.user.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <Link 
                          to={`/profile/${member.user._id}`}
                          className="font-semibold text-gray-900 hover:text-orange-600 text-sm"
                        >
                          {member.user.displayName}
                        </Link>
                        <div className="flex items-center gap-1">
                          {member.role === 'admin' && <Shield className="w-3 h-3 text-orange-600" />}
                          {group.owner._id === member.user._id && <Crown className="w-3 h-3 text-yellow-600" />}
                          <span className="text-xs text-gray-500">{member.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {group.members && group.members.length > 10 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{group.members.length - 10} more members
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle>Group Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <img
                    src={group.owner.displayPhotoURL && group.owner.displayPhotoURL !== '' ? group.owner.displayPhotoURL : '/avatar.png'}
                    alt={group.owner.displayName}
                    className="w-12 h-12 rounded-full"
                    onError={(e) => {
                      e.target.src = '/placeholder.jpeg';
                    }}
                  />
                  <div>
                    <Link 
                      to={`/profile/${group.owner._id}`}
                      className="font-semibold text-gray-900 hover:text-orange-600"
                    >
                      {group.owner.displayName}
                    </Link>
                    <div className="flex items-center gap-1 mt-1">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-500">Owner</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail; 