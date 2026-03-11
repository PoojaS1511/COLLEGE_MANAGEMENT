import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { pollService } from '../../services/pollService';

const PollsManagement = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  // Allowed meal values that match the database constraint
  const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'];

  const [formData, setFormData] = useState({
    title: '',
    day: '',
    meal: 'Lunch', // Default to 'Lunch' to match database constraint
    options: ['', ''],
    is_active: false,
    is_approved: false
  });

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await pollService.getPolls();
      setPolls(data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate meal is one of the allowed values
    if (!MEAL_OPTIONS.includes(formData.meal)) {
      alert(`Please select a valid meal: ${MEAL_OPTIONS.join(', ')}`);
      return;
    }

    try {
      // Format the data for submission
      const dayOfWeek = new Date(formData.day).toLocaleDateString('en-US', { weekday: 'long' });
      
      const pollData = {
        title: formData.title.trim(),
        day: dayOfWeek, // This will be like "Monday", "Tuesday", etc.
        meal: formData.meal, // Already validated to be one of MEAL_OPTIONS
        is_active: formData.is_active,
        is_approved: formData.is_approved,
        // Filter out empty options
        options: formData.options
          .filter(option => option.trim() !== '')
          .map(option => ({
            name: option.trim(),
            votes: 0
          }))
      };

      if (editingPoll) {
        await pollService.updatePoll(editingPoll.id, pollData);
      } else {
        await pollService.createPoll(pollData);
      }
      
      // Reset form and refresh polls
      setFormData({
        title: '',
        day: '',
        meal: 'breakfast',
        options: ['', ''],
        is_active: false,
        is_approved: false
      });
      
      setShowCreateModal(false);
      setEditingPoll(null);
      await fetchPolls();
    } catch (error) {
      console.error('Error saving poll:', error);
      alert(`Failed to save poll: ${error.message || 'Please check the form and try again'}`);
    }
  };

  const handleEdit = (poll) => {
    setEditingPoll(poll);
    setFormData({
      title: poll.title,
      day: poll.day,
      meal: poll.meal,
      // Extract just the option names for editing
      options: poll.options ? poll.options.map(opt => opt.name || opt) : ['', ''],
      is_active: poll.is_active,
      is_approved: poll.is_approved
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        await pollService.deletePoll(id);
        fetchPolls();
      } catch (error) {
        console.error('Error deleting poll:', error);
      }
    }
  };

  const togglePollStatus = async (pollId, statusType) => {
    try {
      await pollService.togglePollStatus(pollId, statusType);
      fetchPolls();
    } catch (error) {
      console.error(`Error toggling ${statusType}:`, error);
    }
  };

  const renderPollCard = (poll) => (
    <div key={poll.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{poll.title}</h3>
          <p className="text-sm text-gray-600">
            {poll.day} • {poll.meal}
          </p>
          <div className="mt-2 flex space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              poll.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {poll.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              poll.is_approved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {poll.is_approved ? 'Approved' : 'Pending'}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => togglePollStatus(poll.id, poll.is_active ? 'deactivate' : 'activate')}
            className="p-1 text-gray-500 hover:text-gray-700"
            title={poll.is_active ? 'Deactivate' : 'Activate'}
          >
            {poll.is_active ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <CheckIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => handleEdit(poll)}
            className="p-1 text-blue-500 hover:text-blue-700"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(poll.id)}
            className="p-1 text-red-500 hover:text-red-700"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Options:</h4>
        <div className="space-y-2">
          {poll.options?.map((option, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{option.name}</span>
              <span className="text-sm text-gray-500">{option.votes} votes</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Total Votes: {poll.total_votes || 0}</span>
          <span>Created: {new Date(poll.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Polls Management</h1>
        <button
          onClick={() => {
            setEditingPoll(null);
            setFormData({
              title: '',
              day: '',
              meal: 'breakfast',
              options: ['', ''],
              is_active: false,
              is_approved: false
            });
            setShowCreateModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Create Poll
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.length > 0 ? (
            polls.map(renderPollCard)
          ) : (
            <div className="col-span-3 text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No polls</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new poll.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPoll ? 'Edit Poll' : 'Create New Poll'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Poll Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                      Day
                    </label>
                    <input
                      type="date"
                      name="day"
                      id="day"
                      required
                      value={formData.day}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="meal" className="block text-sm font-medium text-gray-700">
                      Meal
                    </label>
                    <select
                      id="meal"
                      name="meal"
                      value={formData.meal}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      required
                    >
                      {MEAL_OPTIONS.map(meal => (
                        <option key={meal} value={meal}>
                          {meal}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Poll Options
                    </label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="is_approved"
                      name="is_approved"
                      type="checkbox"
                      checked={formData.is_approved}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_approved" className="ml-2 block text-sm text-gray-700">
                      Approved
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingPoll ? 'Update Poll' : 'Create Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollsManagement;
