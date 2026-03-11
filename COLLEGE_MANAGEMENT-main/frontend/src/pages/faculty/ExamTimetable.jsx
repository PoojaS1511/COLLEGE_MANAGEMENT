import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

const ExamTimetable = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchFacultyExams = async () => {
      try {
        setLoading(true);
        // First, get the faculty's assigned subjects
        const { data: facultyAssignments, error: assignmentsError } = await supabase
          .from('faculty_subject_assignments')
          .select(`
            *,
            subject:subject_id (id, name, code)
          `)
          .eq('faculty_id', user.id)
          .eq('is_active', true);
          
        if (assignmentsError) throw assignmentsError;
        
        if (!facultyAssignments || facultyAssignments.length === 0) {
          toast.info('No subject assignments found for this faculty member.');
          setLoading(false);
          return;
        }

        // Extract unique subject IDs
        const subjectIds = [...new Set(facultyAssignments.map(a => a.subject_id))];
        setSubjects(facultyAssignments);
        
        // If there are subjects, select the first one by default
        if (subjectIds.length > 0) {
          setSelectedSubject(subjectIds[0]);
          
          // Fetch exams for these subjects
          const { data: examsData, error } = await supabase
            .from('exams')
            .select('*')
            .in('subject_id', subjectIds);
          
          if (error) throw error;
          
          setExams(examsData || []);
          setFilteredExams(examsData || []);
        }
      } catch (error) {
        console.error('Error fetching exam timetable:', error);
        toast.error('Failed to load exam timetable. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFacultyExams();
    }
  }, [user]);

  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    
    try {
      setLoading(true);
      const { data: examsData, error } = await supabase
        .from('exams')
        .select('*')
        .eq('subject_id', subjectId);
        
      if (error) throw error;
      
      setExams(examsData || []);
      setFilteredExams(examsData || []);
    } catch (error) {
      console.error('Error fetching exams for subject:', error);
      toast.error('Failed to load exams for the selected subject.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Exam Timetable</h1>
        
        {subjects.length > 0 ? (
          <>
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={handleSubjectChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {subjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name || `Subject ${subject.subject_id}`}
                  </option>
                ))}
              </select>
            </div>

            {filteredExams.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sections
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Marks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {exam.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exam.exam_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(exam.exam_date || exam.start_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exam.semester || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Array.isArray(exam.sections) ? exam.sections.join(', ') : (exam.sections || 'N/A')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exam.total_marks || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No exams scheduled for the selected subject.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">You don't have any assigned subjects.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamTimetable;
