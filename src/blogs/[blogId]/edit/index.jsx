import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Upload, 
  X,
  Save,
  Trash2,
  BarChart3,
  Plus,
  Vote
} from 'lucide-react';
import { toast } from 'sonner';

const EditBlog = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    destination: '',
    category: 'other',
    tags: ''
  });
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', ''],
    endsAt: ''
  });
  const [hasPoll, setHasPoll] = useState(false);

  const categories = [
    'wild', 'mountain', 'international', 'beaches', 'religious', 
    'cultural', 'adventure', 'luxury', 'budget', 'family', 'solo', 'other'
  ];

  useEffect(() => {
    fetchBlog();
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`http://localhost:3001/api/blogs/${blogId}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlog(data);
        setFormData({
          title: data.title,
          content: data.content,
          destination: data.destination,
          category: data.category,
          tags: data.tags ? data.tags.join(', ') : ''
        });
        setImages(data.images || []);
        
        // Load poll data if it exists
        if (data.poll && data.poll.question) {
          setHasPoll(true);
          setPollData({
            question: data.poll.question,
            options: data.poll.options.map(opt => opt.text),
            endsAt: data.poll.endsAt ? new Date(data.poll.endsAt).toISOString().slice(0, 16) : ''
          });
        }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addPollOption = () => {
    if (pollData.options.length < 5) {
      setPollData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removePollOption = (index) => {
    if (pollData.options.length > 2) {
      setPollData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updatePollOption = (index, value) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handlePollChange = (field, value) => {
    setPollData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const deletePoll = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/blogs/${blogId}/poll`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setHasPoll(false);
        setPollData({
          question: '',
          options: ['', ''],
          endsAt: ''
        });
        toast.success('Poll deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete poll');
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast.error('Failed to delete poll');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to edit blogs');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim() || !formData.destination.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate poll if it has data
    if (hasPoll) {
      if (!pollData.question.trim() || pollData.options.some(opt => !opt.trim())) {
        toast.error('Please fill in all poll fields');
        return;
      }

      if (pollData.options.filter(opt => opt.trim()).length < 2) {
        toast.error('Poll must have at least 2 options');
        return;
      }
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('destination', formData.destination.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags.trim());

      // Add new images
      newImages.forEach((file, index) => {
        formDataToSend.append('images', file);
      });

      const response = await fetch(`http://localhost:3001/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        // Update poll if it has data
        if (hasPoll) {
          const pollResponse = await fetch(`http://localhost:3001/api/blogs/${blogId}/poll`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              question: pollData.question,
              options: pollData.options.filter(opt => opt.trim()),
              endsAt: pollData.endsAt || null
            })
          });

          if (!pollResponse.ok) {
            console.error('Failed to update poll, but blog was updated');
          }
        }

        toast.success('Blog updated successfully!');
        navigate(`/blogs/${blogId}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update blog');
    } finally {
      setSaving(false);
    }
  };

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

  // Check if user is the author
  if (user && blog.author._id !== user._id) {
    toast.error('You are not authorized to edit this blog');
    navigate('/blogs');
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
                onClick={() => navigate(`/blogs/${blogId}`)}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
                <p className="text-gray-600 mt-2">Update your travel story</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter blog title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <Input
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Where did you travel?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags separated by commas..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Share your travel experience..."
                  rows={12}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Images */}
              {images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Current Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Blog image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {newImages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">New Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Images
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Images
                  </label>
                  <span className="text-sm text-gray-500">
                    {newImages.length} new image(s) selected
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Poll */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Poll {hasPoll ? '(Current)' : '(Optional)'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="has-poll"
                  checked={hasPoll}
                  onChange={(e) => setHasPoll(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="has-poll" className="text-sm font-medium">
                  Include a poll with this blog
                </label>
                {hasPoll && blog?.poll && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deletePoll}
                    className="ml-auto border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Poll
                  </Button>
                )}
              </div>

              {hasPoll && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium mb-2">Question</label>
                    <Input
                      placeholder="What would you like to ask your readers?"
                      value={pollData.question}
                      onChange={(e) => handlePollChange('question', e.target.value)}
                      maxLength={200}
                      className="border-orange-200 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Options (2-5)</label>
                    {pollData.options.map((option, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updatePollOption(index, e.target.value)}
                          maxLength={100}
                          className="border-orange-200 focus:border-orange-500"
                        />
                        {pollData.options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePollOption(index)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {pollData.options.length < 5 && (
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        onClick={addPollOption} 
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                    <Input
                      type="datetime-local"
                      value={pollData.endsAt}
                      onChange={(e) => handlePollChange('endsAt', e.target.value)}
                      className="border-orange-200 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for no end date
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/blogs/${blogId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog; 