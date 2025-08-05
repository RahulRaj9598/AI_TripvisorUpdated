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
  BarChart3,
  Plus,
  Vote
} from 'lucide-react';
import { toast } from 'sonner';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    destination: '',
    category: 'other',
    tags: ''
  });
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [includePoll, setIncludePoll] = useState(false);
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', ''],
    endsAt: ''
  });

  const categories = [
    'wild', 'mountain', 'international', 'beaches', 'religious', 
    'cultural', 'adventure', 'luxury', 'budget', 'family', 'solo', 'other'
  ];

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      toast.error('Please login to create a blog');
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
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.destination) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate poll if included
    if (includePoll) {
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
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('destination', formData.destination);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);

      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('http://localhost:3001/api/blogs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create poll if included
        if (includePoll) {
          const pollResponse = await fetch(`http://localhost:3001/api/blogs/${data._id}/poll`, {
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
            console.error('Failed to create poll, but blog was created');
          }
        }

        toast.success('Blog created successfully!');
        navigate(`/blogs/${data._id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create blog');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create blog');
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
              onClick={() => navigate('/blogs')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
              <p className="text-gray-600 mt-1">Share your travel experience with the community</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle>Blog Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter your blog title..."
                    className="text-lg"
                    maxLength={200}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.title.length}/200 characters
                  </p>
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Blog Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your travel story here..."
                    className="min-h-[400px] text-base"
                    rows={20}
                  />
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload images</p>
                        <p className="text-sm text-gray-500">Maximum 10 images, 5MB each</p>
                      </label>
                    </div>

                    {previewImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {previewImages.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Destination */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Destination
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g., Paris, France"
                    required
                  />
                </CardContent>
              </Card>

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
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
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

              {/* Poll */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Poll (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="include-poll"
                      checked={includePoll}
                      onChange={(e) => setIncludePoll(e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="include-poll" className="text-sm font-medium">
                      Include a poll with this blog
                    </label>
                  </div>

                  {includePoll && (
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

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Title</h3>
                    <p className="text-gray-600 text-sm">
                      {formData.title || 'Your title will appear here'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Destination</h3>
                    <p className="text-gray-600 text-sm">
                      {formData.destination || 'Destination will appear here'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Category</h3>
                    <Badge variant="secondary">
                      {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Images</h3>
                    <p className="text-gray-600 text-sm">
                      {images.length} image(s) selected
                    </p>
                  </div>
                  {includePoll && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Poll</h3>
                      <div className="space-y-2">
                        <p className="text-gray-600 text-sm">
                          <strong>Q:</strong> {pollData.question || 'Your question will appear here'}
                        </p>
                        <div className="text-xs text-gray-500">
                          <strong>Options:</strong> {pollData.options.filter(opt => opt.trim()).length} option(s)
                        </div>
                        {pollData.endsAt && (
                          <div className="text-xs text-gray-500">
                            <strong>Ends:</strong> {new Date(pollData.endsAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
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
                    Publish Blog
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

export default CreateBlog; 