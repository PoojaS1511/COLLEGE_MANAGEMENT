import React from 'react';
import { useStudent } from '../../contexts/StudentContext';
import { AcademicCapIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';

const StudentAcademic = () => {
  const { student } = useStudent();

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading academic information...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Academic Information</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-lg font-medium">Current Semester</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {student.current_semester || 'N/A'}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <BookOpenIcon className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-lg font-medium">Courses Enrolled</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {student.courses?.length || 0}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <ClockIcon className="h-6 w-6 text-yellow-600 mr-2" />
              <h2 className="text-lg font-medium">Attendance</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {student.attendance_percentage || 'N/A'}%
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Enrolled Courses</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {student.courses?.length > 0 ? (
                student.courses.map((course) => (
                  <li key={course.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {course.code} - {course.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {course.credits} Credits
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {course.instructor}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>Grade: {course.grade || 'In Progress'}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 text-center text-gray-500">
                  No courses enrolled for this semester.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAcademic;
