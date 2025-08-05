import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  MapPin, 
  Tag, 
  Save,
  Image as ImageIcon,
  Users,
  Lock,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'mixed',
    location: '',
    tags: '',
    isPublic: true,
    rules: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const categories = [
    'wild', 'mountain', 'international', 'beaches', 'religious', 
    'cultural', 'adventure', 'luxury', 'budget', 'family', 'solo', 'mixed'
  ];

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      toast.error('Please login to create a group');
      navigate('/');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    setCoverImage(file);
  };

  const removeImage = () => {
    setCoverImage(null);
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('isPublic', formData.isPublic);
      formDataToSend.append('rules', formData.rules);

      if (coverImage) {
        formDataToSend.append('image', coverImage);
      }

      const response = await fetch('https://ai-tripvisorupdated-1.onrender.com/api/groups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Group created successfully!');
        navigate(`/groups/${data._id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/groups')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Group</h1>
              <p className="text-gray-600 mt-1">Start a community for travelers with similar interests</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Group Name */}
              <Card>
                <CardHeader>
                  <CardTitle>Group Name</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your group name..."
                    className="text-lg"
                    maxLength={100}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.name.length}/100 characters
                  </p>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your group and what it's about..."
                    className="min-h-[200px] text-base"
                    rows={8}
                    maxLength={1000}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length}/1000 characters
                  </p>
                </CardContent>
              </Card>

              {/* Cover Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload cover image</p>
                        <p className="text-sm text-gray-500">Maximum 5MB</p>
                      </label>
                    </div>

                    {previewImage && (
                      <div className="relative">
                        <img
                          src={previewImage}
                          alt="Cover preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Group Rules (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleInputChange}
                    placeholder="Set rules for your group members..."
                    className="min-h-[150px] text-base"
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Each line will be treated as a separate rule
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., New York, USA"
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., adventure, budget, solo"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate tags with commas
                  </p>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="isPublic"
                        value="true"
                        checked={formData.isPublic === true}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.value === 'true' }))}
                        className="text-orange-600"
                      />
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium">Public</div>
                          <div className="text-sm text-gray-500">Anyone can find and join</div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="isPublic"
                        value="false"
                        checked={formData.isPublic === false}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.value === 'true' }))}
                        className="text-orange-600"
                      />
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-600" />
                        <div>
                          <div className="font-medium">Private</div>
                          <div className="text-sm text-gray-500">Only invited members can join</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Name</h3>
                    <p className="text-gray-600 text-sm">
                      {formData.name || 'Your group name will appear here'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Category</h3>
                    <Badge variant="secondary">
                      {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Privacy</h3>
                    <div className="flex items-center gap-2">
                      {formData.isPublic ? (
                        <>
                          <Globe className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">Private</span>
                        </>
                      )}
                    </div>
                  </div>
                  {formData.location && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Location</h3>
                      <p className="text-gray-600 text-sm">{formData.location}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Group
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup; 