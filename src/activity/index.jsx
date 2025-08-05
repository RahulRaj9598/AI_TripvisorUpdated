import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, MessageSquare } from 'lucide-react';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to view activities');
        setLoading(false);
        return;
      }

      const response = await fetch('https://ai-tripvisorupdated-1.onrender.com/api/users/activity/feed', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Activity data received:', data);
        setActivities(data.activities || []);
      } else {
        setError('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activities yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start creating blogs and joining groups to see activities here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Activity Feed</h1>
      
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <img
                src={activity.data.author?.displayPhotoURL || activity.data.owner?.displayPhotoURL || '/placeholder.jpeg'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder.jpeg';
                }}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activity.type === 'blog' ? 'New Blog Post' : 'New Group Activity'}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(activity.date)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {activity.data.author?.displayName || activity.data.owner?.displayName} 
                  {activity.type === 'blog' ? ' published a new blog post' : ' created a new group'}
                </p>
                
                <div className="mt-3">
                  <h4 className="font-medium text-gray-900">
                    {activity.data.title}
                  </h4>
                  {activity.data.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {activity.data.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                  {activity.type === 'blog' ? (
                    <>
                      <span className="flex items-center">
                        <MessageSquare size={16} className="mr-1" />
                        {activity.data.comments?.length || 0} comments
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center">
                        <Users size={16} className="mr-1" />
                        {activity.data.members?.length || 0} members
                      </span>
                      <span className="flex items-center">
                        <MapPin size={16} className="mr-1" />
                        {activity.data.destination || 'No destination'}
                      </span>
                    </>
                  )}
                </div>
                
                <div className="mt-4">
                  <Link
                    to={activity.type === 'blog' ? `/blogs/${activity.data._id}` : `/groups/${activity.data._id}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    View {activity.type === 'blog' ? 'Post' : 'Group'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed; 