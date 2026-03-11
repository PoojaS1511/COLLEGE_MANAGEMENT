import React, { useState, useEffect } from 'react';
import { useStudent } from '../../contexts/StudentContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const StudentProfile = ({ setupMode = false }) => {
  const { student, updateStudentProfile } = useStudent();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(setupMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    emergency_contact: '',
    parent_name: '',
    parent_phone: '',
    parent_occupation: ''
  });

  // Initialize form data when student data is available
  useEffect(() => {
    if (student) {
      setFormData(prev => ({
        ...prev,
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || '',
        blood_group: student.blood_group || '',
        emergency_contact: student.emergency_contact || '',
        parent_name: student.parent_name || '',
        parent_phone: student.parent_phone || '',
        parent_occupation: student.parent_occupation || ''
      }));
    }
  }, [student]);

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
      await updateStudentProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      
      if (setupMode) {
        navigate('/student/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (!student && !setupMode) {
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            Personal Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {isEditing ? 'Update your personal information' : 'Your personal details'}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <form onSubmit={handleSubmit}>
            <dl className="sm:divide-y sm:divide-gray-200">
              {/* Name */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Full name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  ) : (
                    student?.name || 'Not provided'
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
                    student?.email || 'Not provided'
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
                    student?.phone || 'Not provided'
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
                    student?.date_of_birth || 'Not provided'
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
                    student?.address ? (
                      <p className="whitespace-pre-line">{student.address}</p>
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
                    student?.emergency_contact || 'Not provided'
                  )}
                </dd>
              </div>

              {/* Parent Information */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-indigo-400 mr-2" />
                    Parent/Guardian
                  </div>
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="parent_name"
                        value={formData.parent_name}
                        onChange={handleChange}
                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      <p>{student?.parent_name || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="parent_phone"
                        value={formData.parent_phone}
                        onChange={handleChange}
                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      <p>{student?.parent_phone || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Occupation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="parent_occupation"
                        value={formData.parent_occupation}
                        onChange={handleChange}
                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : (
                      <p>{student?.parent_occupation || 'Not provided'}</p>
                    )}
                  </div>
                </dd>
              </div>
            </dl>

            {isEditing && setupMode && (
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save and Continue
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
