import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    name: '',
    email: '',
    phone: '',
    roll_no: '',
    gender: 'male',
    date_of_birth: '',
    blood_group: 'O+',
    address: '',
    register_number: '',
    course_id: '',
    department_id: '',
    year: 1,
    current_semester: 1,
    section: 'A',
    admission_year: new Date().getFullYear(),
    admission_date: new Date().toISOString().split('T')[0],
    father_name: '',
    mother_name: '',
    guardian_name: '',
    guardian_phone: '',
    annual_income: '',
    status: 'active',
    type: 'day_scholar',
    quota: 'GENERAL',
    category: 'GENERAL',
    quota_type: 'GENERAL',
    hostel_required: false,
    transport_required: false,
    first_graduate: false,
    student_uuid: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingInitialData(true);
        
        // Fetch departments and courses in parallel
        const [
          { data: deptData, error: deptError },
          { data: coursesData, error: coursesError }
        ] = await Promise.all([
          supabase.from('departments').select('*').order('name'),
          supabase.from('courses').select('*').order('name')
        ]);
        
        if (deptError) throw deptError;
        if (coursesError) throw coursesError;
        
        setDepartments(deptData || []);
        setCourses(coursesData || []);
        
        // Set default course if available
        if (coursesData?.length > 0) {
          setFormData(prev => ({
            ...prev,
            course_id: coursesData[0].id
          }));
        }
        
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load required data. Please refresh the page.');
      } finally {
        setLoadingInitialData(false);
      }
    };
    
    loadData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'department_id') {
      setFormData(prev => ({
        ...prev,
        department_id: value,
        course_id: '' // Reset course when department changes
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Form validation
      if (!formData.full_name.trim() || !formData.course_id) {
        throw new Error('Please fill in all required fields (Name and Course)');
      }

      // Prepare student data
      const studentData = {
        full_name: formData.full_name.trim(),
        name: formData.name.trim() || formData.full_name.trim(),
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        roll_no: formData.roll_no?.trim() || null,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth || null,
        blood_group: formData.blood_group,
        address: formData.address?.trim() || null,
        register_number: formData.register_number || `REG${new Date().getTime()}`,
        course_id: formData.course_id,
        department_id: formData.department_id || null,
        year: parseInt(formData.year, 10) || 1,
        current_semester: parseInt(formData.current_semester, 10) || 1,
        section: formData.section || 'A',
        admission_year: parseInt(formData.admission_year, 10) || new Date().getFullYear(),
        admission_date: formData.admission_date || new Date().toISOString().split('T')[0],
        father_name: formData.father_name?.trim() || null,
        mother_name: formData.mother_name?.trim() || null,
        guardian_name: formData.guardian_name?.trim() || null,
        guardian_phone: formData.guardian_phone?.trim() || null,
        annual_income: formData.annual_income || null,
        status: formData.status || 'active',
        type: formData.type || 'day_scholar',
        quota: formData.quota || 'GENERAL',
        category: formData.category || 'GENERAL',
        quota_type: formData.quota_type || 'GENERAL',
        hostel_required: formData.hostel_required || false,
        transport_required: formData.transport_required || false,
        first_graduate: formData.first_graduate || false,
        student_uuid: formData.student_uuid || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add the student to the database
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select();
        
      if (error) throw error;
      
      // Show success message and reset form
      alert('Student added successfully!');
      setFormData(prev => ({
        ...prev,
        full_name: '',
        name: '',
        email: '',
        phone: '',
        roll_no: '',
        address: '',
        register_number: '',
        course_id: courses[0]?.id || '',
        student_uuid: crypto.randomUUID()
      }));
      
    } catch (err) {
      console.error('Error adding student:', err);
      setError(err.message || 'Failed to add student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingInitialData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Add New Student
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Back
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Student Information</h3>
                <p className="mt-1 text-sm text-gray-500">Enter the student's personal details.</p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      id="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                      Department *
                    </label>
                    <select
                      id="department_id"
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="course_id" className="block text-sm font-medium text-gray-700">
                      Course *
                    </label>
                    <select
                      id="course_id"
                      name="course_id"
                      value={formData.course_id}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Select Course</option>
                      {courses
                        .filter(course => !formData.department_id || course.department_id === formData.department_id)
                        .map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Save Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
