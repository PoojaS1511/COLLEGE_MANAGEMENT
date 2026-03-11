import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import apiService from '../../services/api';

const ExamManagement = () => {
  const [activeTab, setActiveTab] = useState('schedules');
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch exams and subjects on component mount
  useEffect(() => {
    fetchExams();
    fetchSubjects();
  }, []);

  // Fetch exams from the API
  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await apiService.getExams();
      if (response.success) {
        setExams(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('An error occurred while fetching exams');
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects from the API
  const fetchSubjects = async () => {
    try {
      const response = await apiService.getSubjects();
      if (response.success) {
        setSubjects(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Fetch marks for a specific exam
  const fetchMarks = async (examId) => {
    try {
      setLoading(true);
      const response = await apiService.getExamResults({ exam_id: examId });
      if (response.success) {
        setMarks(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch marks');
      }
    } catch (error) {
      console.error('Error fetching marks:', error);
      setError('An error occurred while fetching marks');
    } finally {
      setLoading(false);
    }
  };

  // Handle exam selection
  const handleExamSelect = (examId) => {
    setSelectedExam(examId);
    if (examId) {
      fetchMarks(examId);
    } else {
      setMarks([]);
    }
  };

  // Handle saving marks
  const handleSaveMarks = async (studentId, markData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await apiService.upsertExamResult({
        exam_id: selectedExam,
        student_id: studentId,
        ...markData
      });

      if (response.success) {
        setSuccess('Marks saved successfully');
        fetchMarks(selectedExam);
      } else {
        setError(response.error || 'Failed to save marks');
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      setError('An error occurred while saving marks');
    } finally {
      setLoading(false);
    }
  };

  // Get subject name by ID
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
        <p className="text-gray-600">Schedule exams, manage marks, and generate analytics</p>
      </div>

      {/* Success and Error Messages */}
      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => {
                setActiveTab('schedules');
                setSelectedExam(null);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedules' ? 'border-royal-500 text-royal-600' : 'border-transparent text-gray-500'
              }`}
            >
              Exam Schedules
            </button>
            <button
              onClick={() => setActiveTab('marks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'marks' ? 'border-royal-500 text-royal-600' : 'border-transparent text-gray-500'
              }`}
              disabled={!selectedExam && activeTab !== 'marks'}
            >
              Marks Entry
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics' ? 'border-royal-500 text-royal-600' : 'border-transparent text-gray-500'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-600"></div>
              <span className="ml-3">Loading...</span>
            </div>
          )}

          {!loading && activeTab === 'schedules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Exam Schedules</h2>
                <button 
                  className="flex items-center px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700"
                  onClick={() => {
                    // TODO: Implement create exam modal
                    alert('Create exam functionality will be implemented here');
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Schedule Exam
                </button>
              </div>
              
              {exams.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {exams.map((exam) => (
                        <tr key={exam.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {exam.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getSubjectName(exam.subject_id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(exam.start_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              exam.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : exam.status === 'ongoing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {exam.status || 'scheduled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleExamSelect(exam.id)}
                              className="text-royal-600 hover:text-royal-900 mr-4"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement delete exam
                                if (window.confirm('Are you sure you want to delete this exam?')) {
                                  alert('Delete functionality will be implemented here');
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No exam schedules found. Create your first exam schedule.</p>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'marks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Marks Entry</h2>
                {selectedExam && (
                  <button 
                    className="flex items-center px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700"
                    onClick={() => {
                      // TODO: Implement bulk marks entry
                      alert('Bulk marks entry will be implemented here');
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Bulk Entry
                  </button>
                )}
              </div>

              {!selectedExam ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select an exam from the schedules tab to enter marks</p>
                </div>
              ) : marks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marks Obtained
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marks.map((mark) => (
                        <MarkRow 
                          key={mark.id} 
                          mark={mark} 
                          onSave={handleSaveMarks} 
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No marks recorded for this exam yet.</p>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Exam Analytics</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-center py-12">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Analytics and trends will be displayed here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MarkRow component for handling individual mark entries
const MarkRow = ({ mark, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    marks_obtained: mark.marks_obtained || '',
    grade: mark.grade || '',
    remarks: mark.remarks || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(mark.student_id || mark.student?.id, formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {mark.student?.name || mark.student_name || 'Unknown Student'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="number"
            name="marks_obtained"
            value={formData.marks_obtained}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-royal-500 focus:ring-royal-500 sm:text-sm"
            placeholder="Enter marks"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-royal-500 focus:ring-royal-500 sm:text-sm"
          >
            <option value="">Select grade</option>
            <option value="A+">A+</option>
            <option value="A">A</option>
            <option value="B+">B+</option>
            <option value="B">B</option>
            <option value="C+">C+</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="F">F</option>
          </select>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Editing
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-900 mr-4"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              // Reset form data
              setFormData({
                marks_obtained: mark.marks_obtained || '',
                grade: mark.grade || '',
                remarks: mark.remarks || ''
              });
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {mark.student?.name || mark.student_name || 'Unknown Student'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {mark.marks_obtained !== null && mark.marks_obtained !== undefined 
          ? mark.marks_obtained 
          : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {mark.grade || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          mark.status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : mark.status === 'absent'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {mark.status || 'pending'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => setIsEditing(true)}
          className="text-royal-600 hover:text-royal-900"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};

export default ExamManagement;
