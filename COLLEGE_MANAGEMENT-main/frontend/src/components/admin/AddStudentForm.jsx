// AddStudentForm.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';

export default function AddStudentForm({ onSuccess, onCancel, onSubmit: onSubmitProp }) {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const sections = ['A', 'B', 'C', 'D'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const quotas = ['Management', 'Government', 'NRI', 'Others'];
  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      admission_year: currentYear,
      current_semester: 1,
      status: 'active',
      gender: 'male',
      blood_group: 'O+',
      quota_type: 'Management',
      category: 'General',
      section: 'A',
      hostel_required: false,
      transport_required: false,
      first_graduate: false
    }
  });

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .order('name');

        if (coursesError) throw coursesError;
        
        // Fetch departments
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .order('name');
          
        if (deptError) throw deptError;
        
        // Set initial data
        if (coursesData && coursesData.length > 0) {
          setCourses(coursesData);
        } else {
          // If no courses found, create some default courses
          const defaultCourses = [
            { id: 'btech-cse', name: 'B.Tech Computer Science' },
            { id: 'btech-ece', name: 'B.Tech Electronics' },
            { id: 'bca', name: 'BCA' },
            { id: 'mca', name: 'MCA' },
          ];
          
          const { data: insertedCourses, error: insertError } = await supabase
            .from('courses')
            .insert(defaultCourses)
            .select();
            
          if (!insertError && insertedCourses) {
            setCourses(insertedCourses);
          }
        }
        
        if (deptData && deptData.length > 0) {
          setDepartments(deptData);
        }
        
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load required data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmitForm = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate student ID and other system fields
      const studentId = `STU-${Date.now()}`;
      const currentDate = new Date().toISOString();
      
      // Prepare student data
      const studentData = {
        ...formData,
        id: crypto.randomUUID(), // Changed from student_uuid to id
        register_number: studentId,
        admission_date: formData.admission_date || currentDate.split('T')[0],
        created_at: currentDate,
        updated_at: currentDate,
        full_name: `${formData.name}`,
        // Convert string 'true'/'false' to boolean
        hostel_required: formData.hostel_required === 'true',
        transport_required: formData.transport_required === 'true',
        first_graduate: formData.first_graduate === 'true'
      };

      // Call the parent's onSubmit handler with the form data
      if (onSubmitProp) {
        await onSubmitProp(studentData);
      }
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add student');
      console.error('Error adding student:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>
            
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                id="date_of_birth"
                {...register('date_of_birth', { required: 'Date of birth is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date_of_birth && <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>}
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                id="gender"
                {...register('gender', { required: 'Gender is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
            </div>
            
            <div>
              <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                id="blood_group"
                {...register('blood_group')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                id="address"
                rows={3}
                {...register('address', { required: 'Address is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>
          </div>
        </div>
        
        {/* Academic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
                Course *
              </label>
              <select
                id="course_id"
                {...register('course_id', { required: 'Course is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || courses.length === 0}
              >
                <option value="">-- Select a course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {errors.course_id && <p className="mt-1 text-sm text-red-600">{errors.course_id.message}</p>}
            </div>
            
            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                id="department_id"
                {...register('department_id', { required: 'Department is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || departments.length === 0}
              >
                <option value="">-- Select a department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>}
            </div>
            
            <div>
              <label htmlFor="admission_year" className="block text-sm font-medium text-gray-700 mb-1">
                Admission Year *
              </label>
              <select
                id="admission_year"
                {...register('admission_year', { required: 'Admission year is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.admission_year && <p className="mt-1 text-sm text-red-600">{errors.admission_year.message}</p>}
            </div>
            
            <div>
              <label htmlFor="current_semester" className="block text-sm font-medium text-gray-700 mb-1">
                Current Semester *
              </label>
              <select
                id="current_semester"
                {...register('current_semester', { required: 'Current semester is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              {errors.current_semester && <p className="mt-1 text-sm text-red-600">{errors.current_semester.message}</p>}
            </div>
            
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <select
                id="section"
                {...register('section', { required: 'Section is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {sections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
              {errors.section && <p className="mt-1 text-sm text-red-600">{errors.section.message}</p>}
            </div>
            
            <div>
              <label htmlFor="quota_type" className="block text-sm font-medium text-gray-700 mb-1">
                Quota Type *
              </label>
              <select
                id="quota_type"
                {...register('quota_type', { required: 'Quota type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {quotas.map(quota => (
                  <option key={quota} value={quota}>{quota}</option>
                ))}
              </select>
              {errors.quota_type && <p className="mt-1 text-sm text-red-600">{errors.quota_type.message}</p>}
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                {...register('category', { required: 'Category is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="first_graduate"
                {...register('first_graduate')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="first_graduate" className="ml-2 block text-sm text-gray-700">
                First Graduate in Family
              </label>
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="father_name" className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name *
              </label>
              <input
                type="text"
                id="father_name"
                {...register('father_name', { required: "Father's name is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              {errors.father_name && <p className="mt-1 text-sm text-red-600">{errors.father_name.message}</p>}
            </div>
            
            <div>
              <label htmlFor="mother_name" className="block text-sm font-medium text-gray-700 mb-1">
                Mother's Name *
              </label>
              <input
                type="text"
                id="mother_name"
                {...register('mother_name', { required: "Mother's name is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              {errors.mother_name && <p className="mt-1 text-sm text-red-600">{errors.mother_name.message}</p>}
            </div>
            
            <div>
              <label htmlFor="guardian_name" className="block text-sm font-medium text-gray-700 mb-1">
                Guardian's Name
              </label>
              <input
                type="text"
                id="guardian_name"
                {...register('guardian_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="guardian_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Guardian's Phone
              </label>
              <input
                type="tel"
                id="guardian_phone"
                {...register('guardian_phone', {
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              {errors.guardian_phone && <p className="mt-1 text-sm text-red-600">{errors.guardian_phone.message}</p>}
            </div>
            
            <div>
              <label htmlFor="annual_income" className="block text-sm font-medium text-gray-700 mb-1">
                Annual Income (₹)
              </label>
              <input
                type="number"
                id="annual_income"
                {...register('annual_income', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              {errors.annual_income && <p className="mt-1 text-sm text-red-600">{errors.annual_income.message}</p>}
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hostel_required"
                  {...register('hostel_required')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="hostel_required" className="ml-2 block text-sm text-gray-700">
                  Hostel Required
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="transport_required"
                  {...register('transport_required')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="transport_required" className="ml-2 block text-sm text-gray-700">
                  Transport Required
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Student'}
        </button>
      </div>
    </form>
  );
}