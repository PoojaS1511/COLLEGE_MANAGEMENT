import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon, UserGroupIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import ApiService from '../../../services/api';

const ClubForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    logo_url: '',
    is_active: true,
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchCategories();
    
    if (isEditMode) {
      fetchClub();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      // For now, use predefined categories since the current schema uses VARCHAR category field
      const predefinedCategories = [
        { id: 'academic', name: 'Academic' },
        { id: 'sports', name: 'Sports' },
        { id: 'cultural', name: 'Cultural' },
        { id: 'technical', name: 'Technical' },
        { id: 'social', name: 'Social Service' },
        { id: 'arts', name: 'Arts & Literature' },
      ];
      setCategories(predefinedCategories);
      
      // Set default category if not in edit mode
      if (!isEditMode) {
        setFormData(prev => ({
          ...prev,
          category: predefinedCategories[0].id
        }));
      }
    } catch (error) {
      console.error('Error setting categories:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await ApiService.getFaculty();
      if (response.success) {
        setFaculty(response.data || []);
        // Set default faculty advisor if not in edit mode and faculty exist
        if (!isEditMode && response.data?.length > 0) {
          setFormData(prev => ({
            ...prev,
            faculty_advisor: response.data[0].id
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchClub = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getClub(id);
      if (response.success) {
        setFormData({
          name: response.data.name || '',
          description: response.data.description || '',
          category_id: response.data.category_id || '',
          faculty_advisor: response.data.faculty_advisor || '',
          meeting_schedule: response.data.meeting_schedule || '',
          location: response.data.location || '',
          is_active: response.data.is_active ?? true,
        });
        if (response.data.logo_url) {
          setLogoPreview(response.data.logo_url);
        }
      } else {
        setError(response.message || 'Failed to load club data');
      }
    } catch (error) {
      console.error('Error fetching club:', error);
      setError(error.message || 'Failed to load club data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      const clubData = { ...formData };
      
      // Handle file upload if a new logo was selected
      if (logoFile) {
        const uploadResponse = await ApiService.uploadClubLogo(logoFile, `club_${Date.now()}`);
        if (uploadResponse.success) {
          clubData.logo_url = uploadResponse.url;
        } else {
          throw new Error('Failed to upload logo');
        }
      }

      if (isEditMode) {
        response = await ApiService.updateClub(id, clubData);
      } else {
        response = await ApiService.createClub(clubData);
      }

      if (response.success) {
        navigate(`/admin/clubs/${response.data.id || id}`, { 
          state: { success: true, message: `Club ${isEditMode ? 'updated' : 'created'} successfully!` } 
        });
      } else {
        setError(response.message || `Failed to ${isEditMode ? 'update' : 'create'} club`);
      }
    } catch (error) {
      console.error('Error saving club:', error);
      setError(error.message || 'An error occurred while saving the club');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Clubs
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Club' : 'Create New Club'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Club Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Basic details about the club
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Club Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Brief description of the club's purpose and activities
                </p>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">Club Logo</label>
                <div className="mt-1 flex items-center">
                  <div className="flex-shrink-0 h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Club logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <PhotoIcon className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <label
                      htmlFor="logo-upload"
                      className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    >
                      Change
                      <input
                        id="logo-upload"
                        name="logo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="is_active" className="font-medium text-gray-700">
                      Active Club
                    </label>
                    <p className="text-gray-500">Inactive clubs won't be visible to students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditMode ? 'Update Club' : 'Create Club'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClubForm;
