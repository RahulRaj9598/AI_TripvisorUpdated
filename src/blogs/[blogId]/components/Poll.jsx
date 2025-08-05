import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3, 
  Vote, 
  Plus, 
  X, 
  Clock, 
  CheckCircle,
  Users,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const Poll = ({ blogId, blog, user, onPollUpdate }) => {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    question: '',
    options: ['', ''],
    endsAt: ''
  });

  useEffect(() => {
    if (blog?.poll) {
      setPoll(blog.poll);
    }
  }, [blog]);

  const fetchPollResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}/poll`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const pollData = await response.json();
        setPoll(pollData);
        if (onPollUpdate) onPollUpdate(pollData);
      }
    } catch (error) {
      console.error('Error fetching poll results:', error);
    }
  };

  const createPoll = async () => {
    if (!createForm.question.trim() || createForm.options.some(opt => !opt.trim())) {
      toast.error('Please fill in all fields');
      return;
    }

    if (createForm.options.filter(opt => opt.trim()).length < 2) {
      toast.error('At least 2 options are required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}/poll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: createForm.question,
          options: createForm.options.filter(opt => opt.trim()),
          endsAt: createForm.endsAt || null
        })
      });

      if (response.ok) {
        const newPoll = await response.json();
        setPoll(newPoll);
        setShowCreateDialog(false);
        setCreateForm({ question: '', options: ['', ''], endsAt: '' });
        toast.success('Poll created successfully!');
        if (onPollUpdate) onPollUpdate(newPoll);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create poll');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const voteOnPoll = async (optionIndex) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}/poll/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ optionIndex })
      });

      if (response.ok) {
        const result = await response.json();
        setPoll(result.poll);
        toast.success('Vote recorded!');
        if (onPollUpdate) onPollUpdate(result.poll);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to record vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    } finally {
      setLoading(false);
    }
  };

  const endPoll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-tripvisorupdated-1.onrender.com/api/blogs/${blogId}/poll/end`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPoll(result.poll);
        toast.success('Poll ended successfully');
        if (onPollUpdate) onPollUpdate(result.poll);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to end poll');
      }
    } catch (error) {
      console.error('Error ending poll:', error);
      toast.error('Failed to end poll');
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    if (createForm.options.length < 5) {
      setCreateForm(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (createForm.options.length > 2) {
      setCreateForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index, value) => {
    setCreateForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const isAuthor = user && blog?.author?._id === user._id;
  const hasVoted = poll?.userVoted !== null && poll?.userVoted !== undefined;
  const isPollActive = poll?.isActive;
  const isPollEnded = poll?.endsAt && new Date() > new Date(poll.endsAt);

  // Don't show anything if no poll exists
  if (!poll) {
    return null;
  }

  // If poll has ended, only show results to the author
  if (!isPollActive || isPollEnded) {
    if (!isAuthor) {
      return null; // Hide completely for non-authors after poll ends
    }
    
    // Show results to author
    return (
      <div className="mt-6">
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <BarChart3 className="w-5 h-5" />
              Poll Results: {poll?.question}
              <Badge variant="secondary">Ended</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {poll?.options?.map((option, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.text}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {option.voteCount} votes
                      </span>
                      <span className="text-sm font-semibold text-orange-600">
                        {option.percentage}%
                      </span>
                    </div>
                  </div>
                  <div 
                    className="absolute top-0 left-0 h-full bg-orange-200 rounded-lg transition-all duration-300"
                    style={{ 
                      width: `${option.percentage}%`,
                      zIndex: -1
                    }}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
                <span>Total votes: {poll?.totalVotes}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowResultsDialog(true)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Poll Results Dialog */}
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Poll Results</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{poll?.question}</h3>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {poll?.totalVotes} votes
                  </div>
                  {poll?.endsAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Ended: {new Date(poll.endsAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {poll?.options?.map((option, index) => (
                  <div key={index} className="relative p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{option.text}</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {option.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <span>{option.voteCount} votes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // If poll is active and user has not voted, show voting options
  if (isPollActive && !hasVoted && user) {
    return (
      <div className="mt-6">
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <BarChart3 className="w-5 h-5" />
                Poll: {poll?.question}
              </CardTitle>
              <div className="flex items-center gap-2">
                {poll?.endsAt && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {new Date(poll.endsAt).toLocaleDateString()}
                  </div>
                )}
                {isAuthor && isPollActive && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={endPoll}
                    disabled={loading}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    End Poll
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {poll?.options?.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 text-left border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all duration-200"
                  onClick={() => voteOnPoll(index)}
                  disabled={loading}
                >
                  <Vote className="w-4 h-4 mr-2 text-orange-600" />
                  {option.text}
                </Button>
              ))}
              <p className="text-sm text-gray-600 text-center mt-4">
                Click to vote! You can only vote once.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Create Poll Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                Create a Poll
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <Input
                  placeholder="What would you like to ask your readers?"
                  value={createForm.question}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, question: e.target.value }))}
                  maxLength={200}
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Options (2-5)</label>
                {createForm.options.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      maxLength={100}
                      className="border-orange-200 focus:border-orange-500"
                    />
                    {createForm.options.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {createForm.options.length < 5 && (
                  <Button variant="outline" size="sm" onClick={addOption} className="border-orange-200 text-orange-600 hover:bg-orange-50">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                <Input
                  type="datetime-local"
                  value={createForm.endsAt}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, endsAt: e.target.value }))}
                  className="border-orange-200 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for no end date
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={createPoll} 
                  disabled={loading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? 'Creating...' : 'Create Poll'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  disabled={loading}
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Poll Results Dialog */}
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Poll Results</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{poll?.question}</h3>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {poll?.totalVotes} votes
                  </div>
                  {poll?.endsAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Ends: {new Date(poll.endsAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {poll?.options?.map((option, index) => (
                  <div key={index} className="relative p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{option.text}</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {option.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <span>{option.voteCount} votes</span>
                      {hasVoted && poll.userVoted === index && (
                        <span className="text-green-600 font-medium">Your vote</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // If poll is active and user has voted or is not logged in, show results
  if (isPollActive) {
    return (
      <div className="mt-6">
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <BarChart3 className="w-5 h-5" />
                Poll: {poll?.question}
              </CardTitle>
              <div className="flex items-center gap-2">
                {poll?.endsAt && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {new Date(poll.endsAt).toLocaleDateString()}
                  </div>
                )}
                {isAuthor && isPollActive && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={endPoll}
                    disabled={loading}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    End Poll
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {poll?.options?.map((option, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      {hasVoted && poll.userVoted === index && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-medium">{option.text}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {option.voteCount} votes
                      </span>
                      <span className="text-sm font-semibold text-orange-600">
                        {option.percentage}%
                      </span>
                    </div>
                  </div>
                  <div 
                    className="absolute top-0 left-0 h-full bg-orange-200 rounded-lg transition-all duration-300"
                    style={{ 
                      width: `${option.percentage}%`,
                      zIndex: -1
                    }}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
                <span>Total votes: {poll?.totalVotes}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowResultsDialog(true)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Poll Results Dialog */}
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Poll Results</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{poll?.question}</h3>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {poll?.totalVotes} votes
                  </div>
                  {poll?.endsAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Ends: {new Date(poll.endsAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {poll?.options?.map((option, index) => (
                  <div key={index} className="relative p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{option.text}</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {option.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <span>{option.voteCount} votes</span>
                      {hasVoted && poll.userVoted === index && (
                        <span className="text-green-600 font-medium">Your vote</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // If no poll exists, don't show anything
  return null;
};

export default Poll; 