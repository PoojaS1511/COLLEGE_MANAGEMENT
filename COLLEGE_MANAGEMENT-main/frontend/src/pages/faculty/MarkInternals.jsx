import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { format } from 'date-fns';

const MarkInternals = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [internalMarks, setInternalMarks] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [assessmentType, setAssessmentType] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [remarks, setRemarks] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [assignment, setAssignment] = useState(null);
  const [assessmentTypes] = useState([
    'Quiz',
    'Assignment',
    'Mid Term',
    'Internal Test',
    'Lab Work',
    'Project',
    'Presentation',
    'Other'
  ]);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch faculty's students and exams
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setError('User authentication failed. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Get faculty assignments first
        const assignmentsResponse = await api.getFacultyAssignments(user.id);
        
        if (!assignmentsResponse.success || !assignmentsResponse.data?.length) {
          throw new Error('No class assignments found for this faculty member.');
        }
        
        // Get the first assignment
        const firstAssignment = assignmentsResponse.data[0];
        setAssignment(firstAssignment);
        
        // Fetch exams for the subject with course and semester filters
        const examsResponse = await api.getExams({
          subject_id: firstAssignment.subject_id,
          course_id: firstAssignment.course_id,
          semester: firstAssignment.semester,
          academic_year: firstAssignment.academic_year || new Date().getFullYear()
        });
        
        if (examsResponse.success && Array.isArray(examsResponse.data) && examsResponse.data.length > 0) {
          // Filter out any exams that don't have a name or id
          const validExams = examsResponse.data.filter(exam => exam.id && exam.name);
          
          if (validExams.length > 0) {
            setExams(validExams);
            setSelectedExam(validExams[0].id);
            console.log('Fetched exams:', validExams);
          } else {
            console.warn('No valid exams found after filtering');
            toast.warning('No valid exams found for this subject. Please create exams first.');
          }
        } else {
          console.warn('No exams found for the current filters:', {
            subject_id: firstAssignment.subject_id,
            course_id: firstAssignment.course_id,
            semester: firstAssignment.semester
          });
          toast.warning('No exams found for this subject. Please create exams first.');
        }

        // Set default assessment type
        if (assessmentTypes.length > 0) {
          setAssessmentType(assessmentTypes[0]);
        }
        
        // Get students for the assignment
        const response = await api.getFacultyStudents({
          facultyId: user.id,
          semester: firstAssignment.semester,
          section: firstAssignment.section,
          subjectId: firstAssignment.subject_id
        });
        
        if (response.success) {
          const studentList = response.data || [];
          setStudents(studentList);
          
          // Initialize marks as empty strings
          const initialMarks = {};
          studentList.forEach(student => {
            initialMarks[student.id] = '';
          });
          setInternalMarks(initialMarks);
          
          if (studentList.length === 0) {
            setError('No students found for your class.');
          }
        } else {
          throw new Error(response.message || 'Failed to load students');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleMarkChange = (studentId, value) => {
    // Ensure the value is a number between 0 and 100
    const numericValue = value === '' ? '' : Math.min(100, Math.max(0, Number(value))).toString();
    
    setInternalMarks(prev => ({
      ...prev,
      [studentId]: numericValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (students.length === 0) {
      toast.error('No students to mark internals for');
      return;
    }
    
    if (!assessmentType) {
      toast.error('Please select an assessment type');
      return;
    }
    
    if (!maxMarks || isNaN(maxMarks) || maxMarks <= 0) {
      toast.error('Please enter valid maximum marks');
      return;
    }

    // Validate marks
    const invalidMarks = Object.entries(internalMarks).some(([studentId, mark]) => {
      if (mark === '') return false; // Skip validation for empty marks
      const numMark = parseFloat(mark);
      return isNaN(numMark) || numMark < 0 || numMark > parseFloat(maxMarks);
    });

    if (invalidMarks) {
      toast.error(`Please enter valid marks between 0 and ${maxMarks}`);
      return;
    }

    setSubmitting(true);
    try {
      // Prepare marks data according to internal_marks schema
      const marksToSave = [];
      const now = new Date().toISOString();
      
      students.forEach(student => {
        const markValue = internalMarks[student.id];
        if (markValue !== '') { // Only include students with marks entered
          marksToSave.push({
            student_id: student.id,
            faculty_subject_assignment_id: assignment.id,
            assessment_type: assessmentType,
            marks_obtained: parseFloat(markValue),
            max_marks: parseFloat(maxMarks),
            entered_by_faculty_id: user.id,
            entered_at: now,
            remarks: remarks || null,
            exam_id: selectedExam || null
          });
        }
      });

      if (marksToSave.length === 0) {
        toast.error('Please enter marks for at least one student');
        return;
      }

      // Call API to save marks
      const response = await api.saveInternalMarks(marksToSave);

      if (response.success) {
        const savedCount = marksToSave.length;
        toast.success(`✅ Successfully saved marks for ${savedCount} student${savedCount !== 1 ? 's' : ''}! Redirecting...`, {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          onClose: () => navigate('/faculty/dashboard')
        });
      } else {
        throw new Error(response.message || 'Failed to save marks');
      }
    } catch (error) {
      console.error('Error saving internal marks:', error);
      toast.error(error.message || 'Failed to save internal marks');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mark Internals</h1>
        <span className="text-sm text-gray-500">
          {students.length} student(s) found
        </span>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label htmlFor="assessmentType" className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
                <select
                  id="assessmentType"
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                >
                  {assessmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="maxMarks" className="block text-sm font-medium text-gray-700 mb-1">Maximum Marks</label>
                <input
                  type="number"
                  id="maxMarks"
                  min="1"
                  step="0.01"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter max marks"
                  required
                />
              </div>

              <div>
                <label htmlFor="exam" className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                {exams.length > 0 ? (
                  <select
                    id="exam"
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name} {exam.exam_date ? `(${format(new Date(exam.exam_date), 'MMM dd, yyyy')})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-100">
                    No exams found. Please create exams for this subject first.
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Any additional remarks"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register Number</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained (Max: {maxMarks || 'N/A'})</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                        {student.register_number || 'N/A'}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.full_name}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                        {student.section || 'N/A'}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max={maxMarks || 100}
                          step="0.01"
                          className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={internalMarks[student.id] || ''}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          placeholder={`0-${maxMarks || 100}`}
                          disabled={!maxMarks}
                          required
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 rounded-md text-white ${submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {submitting ? 'Saving...' : 'Save Internal Marks'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MarkInternals;
