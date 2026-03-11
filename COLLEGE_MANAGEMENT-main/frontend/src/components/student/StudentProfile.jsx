import React, { useState, useEffect } from 'react';
import { useStudent } from '../../contexts/StudentContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import { CameraIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const StudentProfile = () => {
  const { student } = useStudent();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');

  useEffect(() => {
    if (student?.id) {
      fetchStudentProfile();
    }
  }, [student]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch complete student data with related tables
      const { data: studentInfo, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          courses (
            id,
            name,
            code
          ),
          departments (
            id,
            name,
            code
          )
        `)
        .eq('id', student.id)
        .single();

      if (studentError) throw studentError;

      // Transform data to match component structure
      const transformedData = {
        personalInfo: {
          studentId: studentInfo.register_number || studentInfo.student_id || 'N/A',
          name: studentInfo.full_name || 'N/A',
          dob: studentInfo.date_of_birth || 'N/A',
          gender: studentInfo.gender || 'N/A',
          contactNumber: studentInfo.phone || 'N/A',
          email: studentInfo.email || 'N/A',
          address: studentInfo.address || 'N/A',
          bloodGroup: studentInfo.blood_group || 'N/A',
          photo: studentInfo.photo_url || null,
        },
        academicInfo: {
          department: studentInfo.departments?.name || 'N/A',
          program: studentInfo.courses?.name || 'N/A',
          year: studentInfo.year || 'N/A',
          semester: studentInfo.current_semester ? `${studentInfo.current_semester}${getSemesterSuffix(studentInfo.current_semester)} Semester` : 'N/A',
          admissionDate: studentInfo.admission_date || 'N/A',
          admissionType: studentInfo.type || 'Regular',
          rollNo: studentInfo.roll_no || 'N/A',
          section: studentInfo.section || 'N/A',
        },
        parentInfo: {
          fatherName: studentInfo.father_name || 'N/A',
          motherName: studentInfo.mother_name || 'N/A',
          guardianName: studentInfo.guardian_name || 'N/A',
          guardianContact: studentInfo.guardian_phone || 'N/A',
        },
        otherInfo: {
          hasHostel: studentInfo.hostel_required || false,
          hasTransport: studentInfo.transport_required || false,
          status: studentInfo.status || 'active',
        },
      };

      setStudentData(transformedData);
      setFormData(transformedData);
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError(err.message || 'Failed to load profile data');
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getSemesterSuffix = (sem) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = sem % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // In a real app, you would save this data to your API
    setStudentData(formData);
    setEditing(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const renderSection = () => {
    const sectionData = formData[activeSection] || {};
    const fields = {
      personalInfo: [
        { id: 'studentId', label: 'Student ID', type: 'text', readOnly: true },
        { id: 'name', label: 'Full Name', type: 'text' },
        { id: 'dob', label: 'Date of Birth', type: 'date' },
        { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
        { id: 'bloodGroup', label: 'Blood Group', type: 'text' },
        { id: 'contactNumber', label: 'Contact Number', type: 'tel' },
        { id: 'email', label: 'Email', type: 'email' },
        { id: 'address', label: 'Address', type: 'textarea' },
      ],
      academicInfo: [
        { id: 'department', label: 'Department', type: 'text', readOnly: true },
        { id: 'program', label: 'Course / Program', type: 'text', readOnly: true },
        { id: 'year', label: 'Year', type: 'text', readOnly: true },
        { id: 'semester', label: 'Semester', type: 'text', readOnly: true },
        { id: 'rollNo', label: 'Roll Number', type: 'text', readOnly: true },
        { id: 'section', label: 'Section', type: 'text', readOnly: true },
        { id: 'admissionDate', label: 'Admission Date', type: 'date', readOnly: true },
        { id: 'admissionType', label: 'Admission Type', type: 'text', readOnly: true },
      ],
      parentInfo: [
        { id: 'fatherName', label: 'Father Name', type: 'text' },
        { id: 'motherName', label: 'Mother Name', type: 'text' },
        { id: 'guardianName', label: 'Guardian Name', type: 'text' },
        { id: 'guardianContact', label: 'Guardian Contact', type: 'tel' },
        { id: 'contactNumber', label: 'Contact Number', type: 'tel' },
        { id: 'relationship', label: 'Relationship', type: 'text' },
      ],
      otherInfo: [
        { id: 'attendance', label: 'Attendance %', type: 'text' },
        { id: 'feeStatus', label: 'Fee Status', type: 'select', options: ['Paid', 'Pending'] },
        { id: 'hasHostel', label: 'Hostel', type: 'checkbox' },
        { id: 'hasTransport', label: 'Transport', type: 'checkbox' },
      ],
    };

    return (
      <div className="space-y-4">
        {fields[activeSection]?.map((field) => (
          <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="w-48 text-sm font-medium text-gray-700">{field.label}</label>
            {editing ? (
              field.type === 'select' ? (
                <select
                  className="flex-1 p-2 border rounded-md"
                  value={sectionData[field.id] || ''}
                  onChange={(e) => handleInputChange(activeSection, field.id, e.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className="flex-1 p-2 border rounded-md"
                  value={sectionData[field.id] || ''}
                  onChange={(e) => handleInputChange(activeSection, field.id, e.target.value)}
                  rows={3}
                />
              ) : field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  className="h-5 w-5 text-[#1d395e]"
                  checked={sectionData[field.id] || false}
                  onChange={(e) => handleInputChange(activeSection, field.id, e.target.checked)}
                />
              ) : (
                <input
                  type={field.type}
                  className="flex-1 p-2 border rounded-md"
                  value={sectionData[field.id] || ''}
                  onChange={(e) => handleInputChange(activeSection, field.id, e.target.value)}
                />
              )
            ) : (
              <span className="flex-1 p-2">
                {field.type === 'checkbox' 
                  ? sectionData[field.id] ? 'Yes' : 'No'
                  : sectionData[field.id] || 'N/A'}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#1d395e] text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Student Profile</h2>
          <div className="flex space-x-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 bg-green-500 rounded-md hover:bg-green-600 flex items-center"
                >
                  <CheckIcon className="h-5 w-5 mr-1" /> Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 bg-red-500 rounded-md hover:bg-red-600 flex items-center"
                >
                  <XMarkIcon className="h-5 w-5 mr-1" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="p-2 bg-[#1d395e] rounded-md hover:bg-[#153255] flex items-center"

              >
                <PencilIcon className="h-5 w-5 mr-1" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-4">
          {/* Photo and Basic Info */}
          <div className="flex flex-col md:flex-row items-center mb-6 pb-6 border-b">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              <img
                src={formData.personalInfo?.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.personalInfo?.name || 'Student') + '&background=random'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzc3NyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U1Q8L3RleHQ+PC9zdmc+';
                }}
              />
              {editing && (
                <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                  <CameraIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800">{formData.personalInfo?.name}</h1>
              <p className="text-gray-600">{formData.academicInfo?.program}</p>
              <p className="text-gray-600">{formData.academicInfo?.department}</p>
              <p className="text-gray-600">
                {formData.academicInfo?.year} • {formData.academicInfo?.semester}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {[
                { id: 'personal', label: '1. Personal Info' },
                { id: 'academic', label: '2. Academic Info' },
                { id: 'parent', label: '3. Parent/Guardian' },
                { id: 'other', label: '4. Other Info' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id + 'Info')}
                  className={`py-3 px-4 text-sm font-medium ${
                    activeSection === tab.id + 'Info'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Section Content */}
          <div className="p-4 bg-gray-50 rounded-lg">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
