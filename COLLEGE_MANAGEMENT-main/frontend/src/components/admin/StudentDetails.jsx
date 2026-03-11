import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchStudentById, updateStudent } from '../../services/studentService';
import toast from 'react-hot-toast';
import { PencilIcon, ArrowLeftIcon, EnvelopeIcon, PhoneIcon, HomeIcon, AcademicCapIcon, CalendarIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    course: '',
    current_semester: '',
    admission_year: '',
    status: 'active',
    gender: 'Male',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    quota_type: 'Regular',
    category: 'General',
    hostel_required: false,
    transport_required: false,
    first_graduate: false
  });

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setLoading(true);
        const data = await fetchStudentById(id);
        setStudent(data);
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          course: data.courses?.name || data.course_name || '',
          current_semester: data.current_semester || '',
          admission_year: data.admission_year || data.admission_date || new Date().getFullYear(),
          status: data.status || 'active',
          gender: data.gender || 'Male',
          father_name: data.father_name || '',
          mother_name: data.mother_name || '',
          date_of_birth: data.date_of_birth || '',
          quota_type: data.quota_type || 'Regular',
          category: data.category || 'General',
          hostel_required: data.hostel_required || false,
          transport_required: data.transport_required || false,
          first_graduate: data.first_graduate || false
        });
      } catch (error) {
        console.error('Error loading student:', error);
        toast.error(error.message || 'Failed to load student details');
        navigate('/admin/students');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadStudent();
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedStudent = await updateStudent(id, {
        ...formData,
        updated_at: new Date().toISOString()
      });
      setStudent(updatedStudent);
      setIsEditing(false);
      toast.success('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error(error.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Student not found</h2>
          <p className="mt-2 text-gray-500">The requested student could not be found.</p>
          <button
            onClick={() => navigate('/admin/students')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/students')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Student' : 'Student Details'}
          </h2>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  ></textarea>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Register Number</label>
                  <input
                    type="text"
                    value={student.register_number || student.student_id || 'Not Available'}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course</label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select Course</option>
                      <option value="B.Tech CSE">B.Tech CSE</option>
                      <option value="B.Tech ECE">B.Tech ECE</option>
                      <option value="B.Tech MECH">B.Tech MECH</option>
                      <option value="B.Tech CIVIL">B.Tech CIVIL</option>
                      <option value="MCA">MCA</option>
                      <option value="MBA">MBA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Semester</label>
                    <select
                      name="current_semester"
                      value={formData.current_semester}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admission Year</label>
                    <input
                      type="number"
                      name="admission_year"
                      value={formData.admission_year}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quota Type</label>
                    <select
                      name="quota_type"
                      value={formData.quota_type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Management">Management</option>
                      <option value="NRI">NRI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hostel_required"
                      name="hostel_required"
                      checked={formData.hostel_required}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="hostel_required" className="ml-2 block text-sm text-gray-700">
                      Hostel Required
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="transport_required"
                      name="transport_required"
                      checked={formData.transport_required}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="transport_required" className="ml-2 block text-sm text-gray-700">
                      Transport Required
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="first_graduate"
                      name="first_graduate"
                      checked={formData.first_graduate}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="first_graduate" className="ml-2 block text-sm text-gray-700">
                      First Graduate
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Parent/Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                  <input
                    type="text"
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                  <input
                    type="text"
                    name="mother_name"
                    value={formData.mother_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original student data
                  setFormData({
                    full_name: student.full_name || '',
                    email: student.email || '',
                    phone: student.phone || '',
                    address: student.address || '',
                    course: student.courses?.name || student.course_name || '',
                    current_semester: student.current_semester || '',
                    admission_year: student.admission_year || student.admission_date || new Date().getFullYear(),
                    status: student.status || 'active',
                    gender: student.gender || 'Male',
                    father_name: student.father_name || '',
                    mother_name: student.mother_name || '',
                    date_of_birth: student.date_of_birth || '',
                    quota_type: student.quota_type || 'Regular',
                    category: student.category || 'General',
                    hostel_required: student.hostel_required || false,
                    transport_required: student.transport_required || false,
                    first_graduate: student.first_graduate || false
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            {/* Student Profile Header */}
            <div className="md:flex md:items-start md:space-x-6">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCircleIcon className="h-16 w-16 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 md:mt-0
              ">
                <h1 className="text-2xl font-bold text-gray-900">{student.full_name || 'Unknown Student'}</h1>
                <p className="text-gray-600">{student.register_number || student.student_id || 'No ID'}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {student.email || 'No Email'}
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <PhoneIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {student.phone || 'No Phone'}
                </div>
                {student.address && (
                  <div className="mt-1 flex items-start text-sm text-gray-500">
                    <HomeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 mt-0.5" />
                    <span>{student.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <dl className="space-y-3">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {student.gender || 'Not Specified'}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not Available'}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Father's Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {student.father_name || 'Not Provided'}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Mother's Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {student.mother_name || 'Not Provided'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Academic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
                <dl className="space-y-3">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Course</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {student.courses?.name || student.course_name || 'No Course Assigned'}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Department</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {student.courses?.departments?.name || student.department_name || 'No Department'}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Current Semester</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {student.current_semester ? `Semester ${student.current_semester}` : 'Not Enrolled'}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Admission Year</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {student.admission_year || student.admission_date || 'Not Available'}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        !student.status ? 'bg-gray-100 text-gray-800' :
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        student.status === 'graduated' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.status ? `${student.status.charAt(0).toUpperCase()}${student.status.slice(1)}` : 'Unknown'}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Quota Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {student.quota_type || 'Regular'}
                    </dd>
                  </div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      {student.category || student.caste || 'General'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hostel_required_view"
                      checked={student.hostel_required || false}
                      disabled
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="hostel_required_view" className="ml-2 block text-sm text-gray-700">
                      Hostel Required
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="transport_required_view"
                      checked={student.transport_required || false}
                      disabled
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="transport_required_view" className="ml-2 block text-sm text-gray-700">
                      Transport Required
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="first_graduate_view"
                      checked={student.first_graduate || false}
                      disabled
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="first_graduate_view" className="ml-2 block text-sm text-gray-700">
                      First Graduate
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
