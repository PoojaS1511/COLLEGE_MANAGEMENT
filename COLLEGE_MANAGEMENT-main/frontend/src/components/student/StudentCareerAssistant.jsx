import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  SparklesIcon,
  ArrowPathIcon,
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import { API_URL } from '../../config';
const API_BASE = import.meta.env.VITE_API_URL || API_URL.replace(/\/$/, '');

// RoadmapDetails component
const RoadmapDetails = ({
  roadmap,
  onBack,
  onToggleMentorChat,
  showMentorChat,
  chatHistory = [],
  chatMessage = '',
  setChatMessage = () => {},
  chatLoading = false,
  handleSendMessage = () => {},
  roadmapSteps = [],
  handleUpdateStepStatus = () => {},
  calculateProgress = () => 0
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          ← Back to Roadmap
        </button>
        <button
          onClick={onToggleMentorChat}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
          {showMentorChat ? 'Hide' : 'Show'} AI Mentor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Roadmap: {roadmap.roadmap_title}</h2>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600">{roadmap.description || 'No description available'}</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900">Progress</h3>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(calculateProgress(roadmap))}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full"
              style={{ width: `${calculateProgress(roadmap)}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Roadmap Steps</h3>
            <button
              onClick={onToggleMentorChat}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showMentorChat ? 'Hide Mentor' : 'Ask Mentor'}
            </button>
          </div>

          {Array.isArray(roadmapSteps) && roadmapSteps.length > 0 ? (
            <div className="space-y-4">
              {roadmapSteps.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 border rounded-lg ${
                    step.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      {step.resource_link && (
                        <a
                          href={step.resource_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 mt-2"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Learning Resource
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(step.status)}`}>
                        {step.status || 'pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {step.status !== 'completed' && (
                      <>
                        {step.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStepStatus(step.id, 'in_progress')}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          >
                            Start Week
                          </button>
                        )}
                        {step.status === 'in_progress' && (
                          <button
                            onClick={() => handleUpdateStepStatus(step.id, 'completed')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Mark as Complete
                          </button>
                        )}
                      </>
                    )}
                    {step.status === 'completed' && step.completed_on && (
                      <span className="text-sm text-gray-500">
                        Completed on {new Date(step.completed_on).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No steps available for this roadmap.</p>
            </div>
          )}
        </div>

        {showMentorChat && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI Mentor</h3>
            <div className="border rounded-lg p-4 h-64 overflow-y-auto mb-4 bg-gray-50">
              {chatHistory.map((chat, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-end mb-1">
                    <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-md">
                      {chat.message}
                    </div>
                  </div>
                  {chat.reply && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-md">
                        {chat.reply}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask the AI mentor a question..."
                className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
              >
                {chatLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main StudentCareerAssistant component
const StudentCareerAssistant = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [roadmapSteps, setRoadmapSteps] = useState([]);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showMentorChat, setShowMentorChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    career_interest: '',
    description: '',
    weeks: 10,
    current_education: '',
    skills: []
  });

  // Fetch roadmaps on component mount
  useEffect(() => {
    const fetchRoadmaps = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE}/roadmap/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch roadmaps');
        }
        
        const result = await response.json();
        setRoadmaps(Array.isArray(result.roadmaps) ? result.roadmaps : []);
      } catch (error) {
        console.error('Error fetching roadmaps:', error);
        toast.error(error.message || 'Failed to load roadmaps');
        setRoadmaps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, [user?.id]);

  const fetchRoadmapSteps = async (roadmapId) => {
    if (!roadmapId) {
      setRoadmapSteps([]);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/roadmap/steps/${roadmapId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch roadmap steps');
      }
      
      const result = await response.json();
      setRoadmapSteps(Array.isArray(result.steps) ? result.steps : []);
    } catch (error) {
      console.error('Error fetching roadmap steps:', error);
      toast.error(error.message || 'Failed to load roadmap steps');
      setRoadmapSteps([]);
    }
  };

  const handleViewRoadmap = (roadmap) => {
    setSelectedRoadmap(roadmap);
    fetchRoadmapSteps(roadmap.id);
  };

  const handleUpdateStepStatus = async (stepId, newStatus) => {
    if (!stepId) {
      toast.error('Invalid step ID');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/roadmap/steps/update-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          step_id: stepId,
          status: newStatus
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update step status');
      }
      
      const result = await response.json();
      
      setRoadmapSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === stepId 
            ? { 
                ...step, 
                status: newStatus,
                completed_on: newStatus === 'completed' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
              } 
            : step
        )
      );
      
      toast.success('Step status updated successfully');
    } catch (error) {
      console.error('Error updating step status:', error);
      toast.error(error.message || 'Failed to update step status');
    }
  };

  const calculateProgress = (roadmap) => {
    if (!roadmap.steps || roadmap.steps.length === 0) return 0;
    const completedSteps = roadmap.steps.filter(step => step.status === 'completed').length;
    return (completedSteps / roadmap.steps.length) * 100;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    if (!formData.career_interest || !formData.weeks) {
      toast.error('Please fill in all required fields');
      return;
    }

    setGenerating(true);
    toast('Generating your personalized roadmap with AI... This may take a moment.');

    try {
      console.log('Generating roadmap with data:', {
        student_id: user.id,
        ...formData
      });

      const response = await fetch(`${API_BASE}/roadmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          student_id: user.id,
          ...formData
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to generate roadmap');
      }

      const result = await response.json();
      console.log('Roadmap generated:', result);

      toast.success('Roadmap generated successfully with AI!');
      setShowGenerateForm(false);

      // Reset form
      setFormData({
        career_interest: '',
        description: '',
        weeks: 10
      });

      // Refresh the roadmaps list
      const roadmapsResponse = await fetch(`${API_BASE}/roadmap/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (!roadmapsResponse.ok) {
        throw new Error('Failed to refresh roadmaps');
      }

      const roadmapsData = await roadmapsResponse.json();
      console.log('Refreshed roadmaps:', roadmapsData);
      setRoadmaps(Array.isArray(roadmapsData.roadmaps) ? roadmapsData.roadmaps : []);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error(error.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    const userMessage = chatMessage.trim();
    setChatMessage('');

    // Add user message to chat history
    const updatedChatHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(updatedChatHistory);
    setChatLoading(true);

    try {
      console.log('Sending message to AI mentor:', {
        student_id: user.id,
        roadmap_id: selectedRoadmap?.id,
        message: userMessage
      });

      const response = await fetch(`${API_BASE}/roadmap/mentor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          student_id: user.id,
          message: userMessage,
          roadmap_id: selectedRoadmap?.id || null
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to get mentor response');
      }

      const result = await response.json();
      console.log('AI mentor response:', result);

      // Add assistant's reply to chat history
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: result.reply }
      ]);

      toast.success('Response received!');

    } catch (error) {
      console.error('Error in chat:', error);
      toast.error(error.message || 'Failed to send message');
      // Revert to previous chat history if there's an error
      setChatHistory(chatHistory);
    } finally {
      setChatLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Career Assistant</h1>
      
      {selectedRoadmap ? (
        <RoadmapDetails
          roadmap={selectedRoadmap}
          onBack={() => setSelectedRoadmap(null)}
          onToggleMentorChat={() => setShowMentorChat(!showMentorChat)}
          showMentorChat={showMentorChat}
          chatHistory={chatHistory}
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          chatLoading={chatLoading}
          handleSendMessage={handleSendMessage}
          roadmapSteps={roadmapSteps}
          handleUpdateStepStatus={handleUpdateStepStatus}
          calculateProgress={calculateProgress}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">My Career Roadmaps</h2>
            <button
              onClick={() => setShowGenerateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Generate New Roadmap
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : roadmaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <div
                  key={roadmap.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900">{roadmap.roadmap_title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        roadmap.status === 'completed' ? 'bg-green-100 text-green-800' :
                        roadmap.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {roadmap.status || 'draft'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {roadmap.description || 'No description available'}
                    </p>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(calculateProgress(roadmap))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${calculateProgress(roadmap)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                      <button
                        onClick={() => handleViewRoadmap(roadmap)}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700"
                      >
                        View Details →
                      </button>
                      <span className="text-xs text-gray-500">
                        Created: {new Date(roadmap.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No roadmaps yet</h3>
              <p className="mt-1 text-gray-500">Get started by generating a new career roadmap.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowGenerateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Generate Roadmap
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate Roadmap Form */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Generate New Career Roadmap</h3>
                <button
                  onClick={() => setShowGenerateForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                <div>
                  <label htmlFor="career_interest" className="block text-sm font-medium text-gray-700">
                    Career Interest
                  </label>
                  <input
                    type="text"
                    id="career_interest"
                    name="career_interest"
                    value={formData.career_interest}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder="e.g., Software Engineering, Data Science"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder="Describe your career goals and interests in more detail"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="current_education" className="block text-sm font-medium text-gray-700">
                    Current Education Level
                  </label>
                  <select
                    id="current_education"
                    name="current_education"
                    value={formData.current_education}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    required
                  >
                    <option value="">Select your current education level</option>
                    <option value="high_school">High School</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="weeks" className="block text-sm font-medium text-gray-700">
                    Timeline (weeks)
                  </label>
                  <input
                    type="number"
                    id="weeks"
                    name="weeks"
                    min="4"
                    max="52"
                    value={formData.weeks}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills.join(', ')}
                    onChange={(e) => {
                      const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, skills }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder="e.g., JavaScript, Python, Machine Learning"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGenerateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                        Generate Roadmap
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCareerAssistant;