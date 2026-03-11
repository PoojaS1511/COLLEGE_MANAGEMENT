import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  TrophyIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import ApiService from '../../../services/api';

const ClubAwards = () => {
  const { clubId } = useParams();
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [members, setMembers] = useState([]);
  
  const [awardData, setAwardData] = useState({
    id: null,
    title: '',
    description: '',
    recipient_id: '',
    awarded_date: format(new Date(), 'yyyy-MM-dd'),
    category: 'achievement',
    prize: ''
  });

  const awardCategories = [
    { value: 'achievement', label: 'Achievement' },
    { value: 'excellence', label: 'Excellence' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'participation', label: 'Participation' },
    { value: 'innovation', label: 'Innovation' },
    { value: 'service', label: 'Service' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchAwards();
    fetchMembers();
  }, [clubId]);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clubs/${clubId}/awards`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process awards to include formatted date
      const processedAwards = data.map(award => ({
        ...award,
        formattedDate: format(new Date(award.awarded_date), 'MMM d, yyyy')
      }));
      
      setAwards(processedAwards);
    } catch (error) {
      console.error('Error fetching awards:', error);
      setError('Failed to load awards');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/members`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAwardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const awardPayload = {
        ...awardData,
        club_id: clubId,
        awarded_date: new Date(awardData.awarded_date).toISOString()
      };
      
      let response;
      
      if (awardData.id) {
        // Update existing award
        const { id, ...updateData } = awardPayload;
        response = await ApiService.updateAward(awardData.id, updateData);
      } else {
        // Create new award
        response = await ApiService.createAward(awardPayload);
      }
      
      if (response.success) {
        // Refresh the awards list
        await fetchAwards();
        // Reset form
        resetForm();
        // Close the form
        setShowAwardForm(false);
      } else {
        setError(response.message || 'Failed to save award');
      }
    } catch (error) {
      console.error('Error saving award:', error);
      setError('Failed to save award');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAward = (award) => {
    setAwardData({
      id: award.id,
      title: award.title,
      description: award.description,
      recipient_id: award.recipient_id,
      awarded_date: format(new Date(award.awarded_date), 'yyyy-MM-dd'),
      category: award.category,
      prize: award.prize || ''
    });
    setShowAwardForm(true);
  };

  const handleDeleteAward = async (awardId) => {
    try {
      setIsDeleting(true);
      const response = await ApiService.deleteAward(awardId);
      
      if (response.success) {
        // Remove the award from the local state
        setAwards(prev => prev.filter(award => award.id !== awardId));
      } else {
        setError(response.message || 'Failed to delete award');
      }
    } catch (error) {
      console.error('Error deleting award:', error);
      setError('Failed to delete award');
    } finally {
      setShowDeleteModal(null);
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setAwardData({
      id: null,
      title: '',
      description: '',
      recipient_id: '',
      awarded_date: format(new Date(), 'yyyy-MM-dd'),
      category: 'achievement',
      prize: ''
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      achievement: 'bg-blue-100 text-blue-800',
      excellence: 'bg-purple-100 text-purple-800',
      leadership: 'bg-yellow-100 text-yellow-800',
      participation: 'bg-green-100 text-green-800',
      innovation: 'bg-indigo-100 text-indigo-800',
      service: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getRecipientName = (recipientId) => {
    const member = members.find(m => m.id === recipientId);
    return member ? `${member.first_name} ${member.last_name}` : 'Unknown Member';
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Club Awards</h1>
          <p className="mt-2 text-sm text-gray-700">
            Recognize and manage awards for club members.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAwardForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Award
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Awards List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : awards.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {awards.map((award) => (
              <li key={award.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                        <TrophyIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-lg font-medium text-gray-900">{award.title}</p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(award.category)}`}>
                            {awardCategories.find(cat => cat.value === award.category)?.label || award.category}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>{getRecipientName(award.recipient_id)}</span>
                          <span className="mx-1">•</span>
                          <time dateTime={award.awarded_date}>{award.formattedDate}</time>
                          {award.prize && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="font-medium text-gray-900">{award.prize}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                      <button
                        type="button"
                        onClick={() => handleEditAward(award)}
                        className="mr-3 bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PencilIcon className="h-5 w-5" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(award.id)}
                        className="bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-5 w-5" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </div>
                  {award.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{award.description}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow sm:rounded-lg">
          <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No awards yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding an award to recognize club members.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowAwardForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Award
            </button>
          </div>
        </div>
      )}

      {/* Award Form Modal */}
      {showAwardForm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <TrophyIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {awardData.id ? 'Edit Award' : 'Add New Award'}
                  </h3>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Award Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={awardData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., Outstanding Leadership Award"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={awardData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Describe the award and any relevant details"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="recipient_id" className="block text-sm font-medium text-gray-700">
                      Recipient <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="recipient_id"
                      name="recipient_id"
                      required
                      value={awardData.recipient_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a member</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={awardData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      {awardCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="awarded_date" className="block text-sm font-medium text-gray-700">
                      Awarded Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="awarded_date"
                      name="awarded_date"
                      required
                      value={awardData.awarded_date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="prize" className="block text-sm font-medium text-gray-700">
                      Prize (Optional)
                    </label>
                    <input
                      type="text"
                      id="prize"
                      name="prize"
                      value={awardData.prize}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., $100, Trophy, Certificate"
                    />
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Saving...' : (awardData.id ? 'Update Award' : 'Add Award')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAwardForm(false);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal !== null && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Award</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this award? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDeleteAward(showDeleteModal)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubAwards;
