import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  BookOpenIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  AcademicCapIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon,
  CurrencyDollarIcon,
  LanguageIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const StudentCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    price: '',
    search: ''
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchCourses();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch courses from Supabase
      const { data: coursesData, error } = await supabase
        .from('career_courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the API response to match our expected format
      const formattedCourses = (coursesData || []).map(course => ({
        id: course.id,
        title: course.title,
        platform: course.platform || 'N/A',
        url: course.url || '#',
        category: course.category || 'General',
        level: course.difficulty || 'Beginner',
        duration: course.duration || 'Self-paced',
        rating: typeof course.rating === 'number' ? course.rating : 'N/A',
        language: course.language || 'English',
        price: course.is_free ? 'Free' : 'Paid',
        instructor: course.instructor || 'Instructor not specified',
        description: course.description || 'No description available.',
        image: course.image_url || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=60',
        skills: Array.isArray(course.skills) ? course.skills : [],
        status: course.enrollment_status || 'Not Started',
        progress: course.progress || 0,
        assignments: Array.isArray(course.assignments) ? course.assignments : (course.assignments ? [course.assignments] : []),
        resources: Array.isArray(course.resources) ? course.resources : (course.resources ? [course.resources] : [])
      }));
      
      setCourses(formattedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses. Please try again later.');
      // Fallback to empty array to prevent UI breakage
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Loading career courses...</span>
      </div>
    );
  }
  
  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6">
        <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No courses available</h3>
        <p className="mt-1 text-sm text-gray-500">We couldn't find any career preparation courses at the moment.</p>
        <button
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowPathIcon className={`-ml-1 mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    );
  }

  // Filter courses based on selected filters
  const filteredCourses = courses.filter(course => {
    const matchesCategory = !filters.category || 
      (course.category && course.category.toLowerCase().includes(filters.category.toLowerCase()));
    const matchesLevel = !filters.level || 
      (course.level && course.level.toLowerCase() === filters.level.toLowerCase());
    const matchesPrice = !filters.price || 
      (filters.price === 'free' ? course.price === 'Free' : course.price !== 'Free');
    const matchesSearch = !filters.search || 
      (course.title && course.title.toLowerCase().includes(filters.search.toLowerCase())) ||
      (course.platform && course.platform.toLowerCase().includes(filters.search.toLowerCase())) ||
      (course.instructor && course.instructor.toLowerCase().includes(filters.search.toLowerCase())) ||
      (course.skills && course.skills.some(skill => 
        skill && skill.toLowerCase().includes(filters.search.toLowerCase())
      ));
    
    return matchesCategory && matchesLevel && matchesPrice && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">Career Preparation</h1>
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="ml-3 p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Refresh courses"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Explore and manage your career development courses</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search courses..."
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <select
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                <option value="AI, Data Science">AI & Data Science</option>
                <option value="Web Development">Web Development</option>
                              </select>
              <select
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.level}
                onChange={(e) => setFilters({...filters, level: e.target.value})}
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.price}
                onChange={(e) => setFilters({...filters, price: e.target.value})}
              >
                <option value="">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="relative pb-48">
                  <img 
                    className="absolute inset-0 h-full w-full object-cover" 
                    src={course.image} 
                    alt={course.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(course.status)}`}>
                        {course.status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {course.price}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2 h-14">{course.title}</h3>
                    <a 
                      href={course.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-indigo-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                    </a>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2 h-10">{course.platform}</p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <AcademicCapIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>{course.level}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                  
                  {course.status === 'In Progress' && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium text-gray-900">{course.rating}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCourse(course)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl leading-6 font-medium text-gray-900">
                        {selectedCourse.title}
                      </h3>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setSelectedCourse(null)}
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>{selectedCourse.platform}</span>
                      <span className="mx-2">•</span>
                      <span>{selectedCourse.instructor}</span>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedCourse.status)}`}>
                        {selectedCourse.status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {selectedCourse.price}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedCourse.level}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {selectedCourse.language}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900">Description</h4>
                      <p className="mt-1 text-sm text-gray-600">{selectedCourse.description}</p>
                    </div>
                    
                    {selectedCourse.skills && selectedCourse.skills.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900">Skills You'll Learn</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedCourse.skills.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedCourse.status === 'In Progress' && selectedCourse.assignments && selectedCourse.assignments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900">Assignments</h4>
                        <div className="mt-2 space-y-2">
                          {selectedCourse.assignments.map((assignment, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <span className="text-sm font-medium text-gray-900">{assignment.title}</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                assignment.status === 'Submitted' ? 'bg-green-100 text-green-800' : 
                                assignment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {assignment.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedCourse.resources && selectedCourse.resources.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900">Resources</h4>
                        <div className="mt-2 space-y-2">
                          {selectedCourse.resources.map((resource, index) => (
                            <a
                              key={index}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                              {resource.title} ({resource.type})
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <a
                  href={selectedCourse.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Go to Course
                </a>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedCourse(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
