import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const MarksEntry = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    examType: 'class_test',
    date: format(new Date(), 'yyyy-MM-dd'),
    maxMarks: '100',
    passingMarks: '35'
  });

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name');

        if (error) throw error;
        setSubjects(data || []);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects');
      }
    };

    fetchSubjects();
  }, []);

  // Fetch students when subject is selected
  const fetchStudents = async () => {
    if (!formData.subject) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('students')
        .select('id, name, student_id, branch')
        .order('name');

      if (error) throw error;
      
      setStudents(data || []);
      
      // Initialize marks object
      const initialMarks = {};
      data.forEach(student => {
        initialMarks[student.id] = '';
      });
      setMarks(initialMarks);
      
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If subject changes, fetch students for that subject
    if (name === 'subject' && value) {
      fetchStudents();
    }
  };

  const handleMarksChange = (studentId, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !formData.subject) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const currentUser = (await supabase.auth.getUser()).data.user;
      const marksData = Object.entries(marks)
        .filter(([_, mark]) => mark !== '' && !isNaN(mark))
        .map(([studentId, mark]) => ({
          student_id: studentId,
          subject: formData.subject,
          exam_type: formData.examType,
          marks_obtained: parseFloat(mark),
          max_marks: parseFloat(formData.maxMarks),
          passing_marks: parseFloat(formData.passingMarks),
          date: formData.date,
          marked_by: currentUser?.email || 'admin',
          marked_time: new Date().toISOString()
        }));
      
      if (marksData.length === 0) {
        setError('Please enter marks for at least one student');
        return;
      }
      
      // Insert marks into the database
      const { error } = await supabase
        .from('marks_staging')
        .insert(marksData);
      
      if (error) throw error;
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setFormData({
        ...formData,
        examType: 'class_test',
        maxMarks: '100',
        passingMarks: '35'
      });
      
      // Reset marks
      const resetMarks = {};
      Object.keys(marks).forEach(studentId => {
        resetMarks[studentId] = '';
      });
      setMarks(resetMarks);
      
    } catch (err) {
      console.error('Error saving marks:', err);
      setError('Failed to save marks. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (marks) => {
    if (marks === '') return 'bg-gray-100';
    const marksNum = parseFloat(marks);
    const maxMarks = parseFloat(formData.maxMarks);
    const passingMarks = parseFloat(formData.passingMarks);
    
    if (isNaN(marksNum)) return 'bg-red-50';
    if (marksNum >= maxMarks * 0.8) return 'bg-green-50';
    if (marksNum >= passingMarks) return 'bg-blue-50';
    return 'bg-red-50';
  };

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Marks Entry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="class_test">Class Test</option>
                <option value="unit_test">Unit Test</option>
                <option value="mid_term">Mid Term</option>
                <option value="final">Final Exam</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  name="maxMarks"
                  min="1"
                  step="0.01"
                  value={formData.maxMarks}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
                <input
                  type="number"
                  name="passingMarks"
                  min="0"
                  step="0.01"
                  max={formData.maxMarks}
                  value={formData.passingMarks}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {showSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>Marks saved successfully!</p>
            </div>
          )}
          
          {students.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Enter Marks</h3>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Marks'}
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {student.name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.student_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.branch || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              max={formData.maxMarks}
                              value={marks[student.id] || ''}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              className="w-24 p-1 border rounded text-center"
                              placeholder="0.00"
                            />
                            <span className="ml-2 text-sm text-gray-500">/ {formData.maxMarks}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(marks[student.id])} ${
                            marks[student.id] === '' ? 'text-gray-600' : 
                            parseFloat(marks[student.id] || 0) >= formData.passingMarks ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {marks[student.id] === '' ? 'Not Entered' : 
                             parseFloat(marks[student.id]) >= formData.passingMarks ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MarksEntry;
