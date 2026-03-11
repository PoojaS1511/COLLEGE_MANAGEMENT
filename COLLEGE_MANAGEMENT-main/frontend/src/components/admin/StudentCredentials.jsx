import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const StudentCredentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    password: ''
  });

  // Fetch all student credentials
  const fetchCredentials = async () => {
    try {
      setLoading(true);
      
      // First, fetch all student credentials
      const { data: credentialsData, error: credError } = await supabase
        .from('student_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (credError) throw credError;
      
      if (!credentialsData || credentialsData.length === 0) {
        setCredentials([]);
        return;
      }

      // Then fetch the related student data
      const studentIds = credentialsData.map(cred => cred.student_id);
      const { data: studentsData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds);

      if (studentError) throw studentError;

      // Combine the data
      const combinedData = credentialsData.map(cred => {
        const student = studentsData?.find(s => s.id === cred.student_id) || {};
        return {
          ...cred,
          students: student
        };
      });
      
      setCredentials(combinedData);
      
      // Initialize showPassword state for each credential
      const passwordState = {};
      combinedData.forEach(cred => {
        passwordState[cred.id] = false;
      });
      setShowPassword(passwordState);
      
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter credentials based on search term
  const filteredCredentials = credentials.filter(cred => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cred.username.toLowerCase().includes(searchLower) ||
      (cred.students?.admission_number?.toLowerCase()?.includes(searchLower) || '') ||
      (cred.students?.first_name?.toLowerCase()?.includes(searchLower) || '') ||
      (cred.students?.last_name?.toLowerCase()?.includes(searchLower) || '')
    );
  });

  // Toggle password visibility
  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Start editing a credential
  const startEditing = (cred) => {
    setEditingId(cred.id);
    setEditForm({
      username: cred.username,
      password: '' // Don't pre-fill password for security
    });
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited credential
  const saveEdit = async (id) => {
    try {
      const updates = {
        username: editForm.username,
        updated_at: new Date().toISOString()
      };
      
      // Only update password if it's not empty
      if (editForm.password) {
        updates.password_hash = editForm.password; // In production, hash this password
        updates.is_initial_password = false;
      }
      
      const { error } = await supabase
        .from('student_credentials')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Credentials updated successfully');
      setEditingId(null);
      fetchCredentials();
    } catch (error) {
      console.error('Error updating credentials:', error);
      toast.error('Failed to update credentials');
    }
  };

  // Reset password to a random value
  const resetPassword = async (id) => {
    if (!window.confirm('Are you sure you want to reset this password? The student will need to change it on next login.')) {
      return;
    }
    
    try {
      const newPassword = Math.random().toString(36).slice(-8); // Generate random 8-char password
      
      const { error } = await supabase
        .from('student_credentials')
        .update({
          password_hash: newPassword, // In production, hash this password
          is_initial_password: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Password reset successful');
      fetchCredentials();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCredentials();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Student Credentials Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student login credentials and access permissions
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-6 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by name, username, or admission number"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <button
            onClick={fetchCredentials}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Refresh
          </button>
        </div>
        
        {/* Credentials Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCredentials.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No credentials found
                    </td>
                  </tr>
                ) : (
                  filteredCredentials.map((cred) => (
                    <tr key={cred.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <UserIcon className="h-6 w-6" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {cred.students?.first_name} {cred.students?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cred.students?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cred.students?.admission_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === cred.id ? (
                          <input
                            type="text"
                            name="username"
                            value={editForm.username}
                            onChange={handleEditChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{cred.username}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {editingId === cred.id ? (
                            <input
                              type={showPassword[cred.id] ? 'text' : 'password'}
                              name="password"
                              value={editForm.password}
                              onChange={handleEditChange}
                              placeholder="Leave blank to keep current"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          ) : (
                            <span className={`font-mono ${showPassword[cred.id] ? 'text-gray-900' : 'text-gray-400'}`}>
                              {showPassword[cred.id] ? cred.password_hash : '••••••••'}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(cred.id)}
                            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            {showPassword[cred.id] ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cred.is_initial_password ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {cred.is_initial_password ? 'Needs Reset' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === cred.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(cred.id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(cred)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => resetPassword(cred.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Reset Password"
                            >
                              <ArrowPathIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Help Text */}
        <div className="mt-4 text-sm text-gray-500">
          <p>• Click on the eye icon to view/hide passwords</p>
          <p>• Use the edit button to update usernames or set new passwords</p>
          <p>• Reset password will generate a new random password for the student</p>
        </div>
      </div>
    </div>
  );
};

export default StudentCredentials;
