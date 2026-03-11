import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { 
  AcademicCapIcon, 
  CalendarIcon, 
  ClockIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

const UpcomingExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await examService.getAllExams();
        // Sort exams by start date
        const sortedExams = data
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
          .slice(0, 5); // Show only next 5 upcoming exams
        setExams(sortedExams);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load exam schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getDateBadge = (dateString) => {
    const date = new Date(dateString);
    if (isPast(date)) return 'Completed';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE');
  };

  if (loading) return <div className="text-center py-4">Loading exam schedule...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <AcademicCapIcon className="h-5 w-5 text-indigo-600 mr-2" />
          Upcoming Exams
        </h3>
        <Link 
          to="/admin/academic/exams" 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          View All
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      <div className="divide-y divide-gray-100">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <div key={exam.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">{exam.name}</h4>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                      {exam.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>{formatDate(exam.start_date)}</span>
                    <span className="mx-2">-</span>
                    <span>{format(new Date(exam.end_date), 'h:mm a')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {getDateBadge(exam.start_date)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No upcoming exams scheduled.
            <Link 
              to="/admin/academic/exams/new" 
              className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Schedule an Exam
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingExams;
