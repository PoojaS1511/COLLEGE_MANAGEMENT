import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const FacultyProfile = ({ setupMode = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(setupMode);
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    designation: '',
    qualification: '',
    department_id: '',
    joining_date: '',
    emergency_contact: '',
    status: 'Active' // Add status to form data
  });
  const [departments, setDepartments] = useState([]);

  // Debug form data changes
  useEffect(() => {
    console.log('Form data updated - gender:', formData.gender);
  }, [formData.gender]);

  // Debug faculty data changes
  useEffect(() => {
    console.log('Faculty data updated - gender:', faculty?.gender);
  }, [faculty]);

  // Debug user object
  useEffect(() => {
    console.log('User object in FacultyProfile:', user);
    
    // Debug: Log the current faculty data and form data
    console.log('Current faculty data:', faculty);
    console.log('Current form data:', formData);
  }, [user, faculty, formData]);
  
  // Debug: Log when the component renders
  console.log('FacultyProfile rendering with state:', {
    faculty: faculty,
    formData: formData,
    isEditing: isEditing
  });

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  // Fetch faculty data
  useEffect(() => {
    const fetchFacultyData = async () => {
      // Try different possible paths to get the user ID
      const userId = user?.id || user?.user?.id || (user?.user_metadata && user.user_metadata.user_id);
      
      if (!userId) {
        console.log('No user ID found in auth context');
        console.log('Available user data:', user);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching faculty data for user ID:', userId);
        
        // Fetch faculty data with department name using a join
        const { data, error } = await supabase
          .from('faculties')
          .select(`
            *,
            departments (id, name, code)
          `)
          .eq('id', userId)
          .single();
          
        console.log('Faculty data query result:', { data, error });

        if (error) throw error;
        
        if (data) {
          console.log('Raw faculty data from API:', data);
          setFaculty(data);
          const formDataUpdate = {
            full_name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            date_of_birth: data.date_of_birth || '',
            gender: data.gender || '',
            designation: data.designation || '',
            qualification: data.qualification || '',
            department_id: data.department_id || '',
            joining_date: data.joining_date || '',
            emergency_contact: data.emergency_contact || '',
            status: data.status || 'Active'
          };
          console.log('Setting form data with gender:', formDataUpdate.gender);
          setFormData(prev => ({
            ...prev,
            ...formDataUpdate
          }));
        }
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        if (error.code === 'PGRST116') {
          console.log('No faculty profile found, will create new one');
          // Initialize empty form for new faculty
          setFaculty({});
        } else {
          toast.error('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
    fetchDepartments();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const userId = user?.id || user?.user?.id || (user?.user_metadata && user.user_metadata.user_id);
      
      if (!userId) {
        throw new Error('No user ID available for update');
      }

      const { error } = await supabase
        .from('faculties')
        .upsert({
          id: userId,  // Make sure we're using the correct field name
          updated_at: new Date().toISOString(),
          ...formData
        });

      if (error) throw error;
      
      // Update local state
      setFaculty(prev => ({
        ...prev,
        ...formData
      }));
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      
      if (setupMode) {
        navigate('/faculty/dashboard');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !faculty && !setupMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading profile data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {setupMode ? 'Complete Your Profile' : 'My Profile'}
          </h2>
          {setupMode && (
            <p className="mt-2 text-sm text-gray-600">
              Please complete your profile information to continue.
            </p>
          )}
        </div>
        {!setupMode && (
          <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <CheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <XMarkIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Professional Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {isEditing ? 'Update your professional information' : 'Your professional details'}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <form onSubmit={handleSubmit}>
            <dl className="sm:divide-y sm:divide-gray-200">
              {/* Full Name */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Full Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  ) : (
                    faculty?.full_name || 'Not provided'
                  )}
                </dd>
              </div>

              {/* Email */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  ) : (
                    faculty?.email || 'Not provided'
                  )}
                </dd>
              </div>

              {/* Phone */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    faculty?.phone || 'Not provided'
                  )}
                </dd>
              </div>

              {/* Designation */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Designation
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    faculty?.designation || 'Not provided'
                  )}
                </dd>
              </div>

              {/* Qualification */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Qualification
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    faculty?.qualification || 'Not provided'
                  )}
                </dd>
              </div>

              {/* Department */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Department
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  ) : (
                    faculty?.departments?.name ? 
                    `${faculty.departments.name} (${faculty.departments.code})` : 
                    'Not provided'
                  )}
                </dd>
              </div>

              {/* Joining Date */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Joining Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="date"
                      name="joining_date"
                      value={formData.joining_date}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    faculty?.joining_date ? new Date(faculty.joining_date).toLocaleDateString() : 'Not provided'
                  )}
                </dd>
              </div>

              {/* Date of Birth */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Date of Birth
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    faculty?.date_of_birth ? new Date(faculty.date_of_birth).toLocaleDateString() : 'Not provided'
                  )}
                </dd>
              </div>

              {/* Gender */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Gender
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  ) : (
                    (() => {
                      const genders = {
                        'male': 'Male',
                        'female': 'Female',
                        'other': 'Other',
                        'prefer_not_to_say': 'Prefer not to say'
                      };
                      return genders[faculty?.gender] || 'Not provided';
                    })()
                  )}
                </dd>
              </div>

              {/* Status */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      faculty?.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : faculty?.status === 'Inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {faculty?.status || 'Not provided'}
                    </span>
                  )}
                </dd>
              </div>

              {/* Address */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <textarea
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    />
                  ) : (
                    faculty?.address ? (
                      <p className="whitespace-pre-line">{faculty.address}</p>
                    ) : (
                      'Not provided'
                    )
                  )}
                </dd>
              </div>

              {/* Emergency Contact */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <PhoneIcon className="h-5 w-5 text-red-400 mr-2" />
                  Emergency Contact
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="tel"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    faculty?.emergency_contact || 'Not provided'
                  )}
                </dd>
              </div>

              {isEditing && setupMode && (
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save and Continue'}
                  </button>
                </div>
              )}
            </dl>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
