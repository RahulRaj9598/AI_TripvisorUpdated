import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Save, 
  X, 
  User,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Heart,
  MessageCircle,
  Eye,
  Users,
  Calendar,
  Camera,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    location: '',
    website: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: ''
    },
    travelPreferences: {
      favoriteCategories: [],
      preferredDestinations: [],
      travelStyle: 'mid-range'
    }
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const travelStyles = [
    'budget', 'mid-range', 'luxury', 'backpacker', 'family', 'solo', 'group'
  ];

  const categories = [
    'wild', 'mountain', 'international', 'beaches', 'religious', 
    'cultural', 'adventure', 'luxury', 'budget', 'family', 'solo'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

    const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userData || !token) {
        toast.error('Please login to view your profile');
        navigate('/');
        return;
      }

      const user = JSON.parse(userData);
      setUser(user);

      // Fetch detailed profile data
      if (user._id && user._id !== 'undefined') {
        const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/users/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data); // Update user state with latest data from backend
          setProfileData({
            bio: data.bio || '',
            location: data.location || '',
            website: data.website || '',
            socialLinks: data.socialLinks || {
              instagram: '',
              twitter: '',
              facebook: '',
              linkedin: ''
            },
            travelPreferences: data.travelPreferences || {
              favoriteCategories: [],
              preferredDestinations: [],
              travelStyle: 'mid-range'
            }
          });
        } else {
          console.error('Invalid user ID:', user._id);
          toast.error('Invalid user data. Please login again.');
          navigate('/');
        }
      } else {
        console.error('Invalid user ID:', user._id);
        toast.error('Invalid user data. Please login again.');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Maximum size is 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);

    setProfileImage(file);
  };

  const removeImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('bio', profileData.bio);
      formDataToSend.append('location', profileData.location);
      formDataToSend.append('website', profileData.website);
      formDataToSend.append('socialLinks', JSON.stringify(profileData.socialLinks));
      formDataToSend.append('travelPreferences', JSON.stringify(profileData.travelPreferences));

      if (profileImage) {
        formDataToSend.append('image', profileImage);
      }

      const response = await fetch('https://ai-tripvisorupdated-1.onrender.com/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setProfileImage(null); // ✅ Clear file state
        setPreviewImage(null); // ✅ Clear preview state
        setEditing(false);
        
        // Update localStorage with the latest user data
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('profileUpdated'));
        
        // Force a page reload to update all components with new user data
        window.location.reload();
        
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setProfileData(prev => ({
      ...prev,
      travelPreferences: {
        ...prev.travelPreferences,
        favoriteCategories: prev.travelPreferences.favoriteCategories.includes(category)
          ? prev.travelPreferences.favoriteCategories.filter(c => c !== category)
          : [...prev.travelPreferences.favoriteCategories, category]
      }
    }));
  };

  const handleDestinationAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const destination = e.target.value.trim();
      setProfileData(prev => ({
        ...prev,
        travelPreferences: {
          ...prev.travelPreferences,
          preferredDestinations: [...prev.travelPreferences.preferredDestinations, destination]
        }
      }));
      e.target.value = '';
    }
  };

  const handleDestinationRemove = (destination) => {
    setProfileData(prev => ({
      ...prev,
      travelPreferences: {
        ...prev.travelPreferences,
        preferredDestinations: prev.travelPreferences.preferredDestinations.filter(d => d !== destination)
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your profile and preferences</p>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  className="bg-orange-600 hover:bg-orange-700 cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={previewImage || user.displayPhotoURL || user.photoURL || '/avatar.png'}
                      alt={user.displayName}
                      className="w-20 h-20 rounded-full object-cover hover:scale-300 transition-transform duration-300 cursor-pointer"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpeg';
                      }}
                    />
                    {editing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <label htmlFor="profile-image" className="cursor-pointer">
                          <Camera className="w-6 h-6 text-white" />
                        </label>
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link to={`/profile/${user._id}`}><h2 className="text-xl font-semibold text-gray-900 hover:text-orange-600 transition-colors duration-200">{user.displayName}</h2></Link>
                    <p className="text-gray-600">{user.email}</p>
                    {user.location && (
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.location}
                      </div>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <Textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        maxLength={500}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {profileData.bio.length}/500 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <Input
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        placeholder="Where are you based?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <Input
                        name="website"
                        value={profileData.website}
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                )}

                {!editing && profileData.bio && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Bio</h3>
                    <p className="text-gray-700">{profileData.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Travel Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Travel Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Style
                  </label>
                  {editing ? (
                    <select
                      name="travelPreferences.travelStyle"
                      value={profileData.travelPreferences.travelStyle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {travelStyles.map(style => (
                        <option key={style} value={style}>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge variant="secondary">
                      {profileData.travelPreferences.travelStyle.charAt(0).toUpperCase() + 
                       profileData.travelPreferences.travelStyle.slice(1)}
                    </Badge>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favorite Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => editing && handleCategoryToggle(category)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          profileData.travelPreferences.favoriteCategories.includes(category)
                            ? 'bg-orange-100 text-orange-800 border-orange-300'
                            : 'bg-gray-100 text-gray-600 border-gray-300'
                        } ${editing ? 'cursor-pointer hover:bg-orange-50' : ''}`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Destinations
                  </label>
                  {editing ? (
                    <Input
                      placeholder="Type destination and press Enter"
                      onKeyPress={handleDestinationAdd}
                    />
                  ) : null}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData.travelPreferences.preferredDestinations.map((destination, index) => (
                      <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        <span>{destination}</span>
                        {editing && (
                          <button
                            onClick={() => handleDestinationRemove(destination)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram
                      </label>
                      <Input
                        name="socialLinks.instagram"
                        value={profileData.socialLinks.instagram}
                        onChange={handleInputChange}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter
                      </label>
                      <Input
                        name="socialLinks.twitter"
                        value={profileData.socialLinks.twitter}
                        onChange={handleInputChange}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook
                      </label>
                      <Input
                        name="socialLinks.facebook"
                        value={profileData.socialLinks.facebook}
                        onChange={handleInputChange}
                        placeholder="Profile URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <Input
                        name="socialLinks.linkedin"
                        value={profileData.socialLinks.linkedin}
                        onChange={handleInputChange}
                        placeholder="Profile URL"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    {profileData.socialLinks.instagram && (
                      <a href={profileData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {profileData.socialLinks.twitter && (
                      <a href={profileData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {profileData.socialLinks.facebook && (
                      <a href={profileData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:text-blue-900">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {profileData.socialLinks.linkedin && (
                      <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Blogs</span>
                  <span className="font-semibold">{user.stats?.blogs || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Groups</span>
                  <span className="font-semibold">{user.stats?.groups || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Followers</span>
                  <span className="font-semibold">{user.stats?.followers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Following</span>
                  <span className="font-semibold">{user.stats?.following || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Link to="/blogs/create">
                  <Button variant="outline" className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer ">
                    <Plus className="w-4 h-4 mr-2" />
                    Write Blog
                  </Button>
                </Link>
                <Link to="/groups/create">
                  <Button variant="outline" className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </Link>
                <Link to="/activity">
                  <Button variant="outline" className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
                    <Eye className="w-4 h-4 mr-2" />
                    View Activity
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

export default Profile; 