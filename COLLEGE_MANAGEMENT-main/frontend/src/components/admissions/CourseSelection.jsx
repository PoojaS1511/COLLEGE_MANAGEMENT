import React, { useState, useEffect } from 'react'
import apiService from '../../services/api'

const CourseSelection = ({ register, errors, watch, setValue }) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  
  // Watch the course_id field from the form
  const watchedCourseId = watch('course_id')

  useEffect(() => {
    fetchCourses()
  }, [])

  // Update local state when the watched value changes (e.g., when editing)
  useEffect(() => {
    if (watchedCourseId) {
      setSelectedCourseId(watchedCourseId)
    }
  }, [watchedCourseId])

  const handleCourseChange = (e) => {
    const courseId = parseInt(e.target.value, 10)
    setSelectedCourseId(courseId)
    // Update the form value
    setValue('course_id', courseId, { shouldValidate: true })
  }

  const fetchCourses = async () => {
    try {
      const response = await apiService.getCourses()
      console.log('Courses API Response:', response) // Debug log

      let coursesData = []
      
      // Handle different response formats
      if (response && response.success) {
        // Check if data is an array or an object that might contain courses
        if (Array.isArray(response.data)) {
          coursesData = response.data
        } else if (response.data && Array.isArray(response.data.courses)) {
          coursesData = response.data.courses
        } else if (response.data && Array.isArray(response.data.data)) {
          coursesData = response.data.data
        } else if (typeof response.data === 'object' && response.data !== null) {
          // If data is an object but not an array, try to extract courses
          const possibleCourseArrays = Object.values(response.data).find(Array.isArray)
          if (possibleCourseArrays) {
            coursesData = possibleCourseArrays
          }
        }

        // Normalize the course data to ensure consistent property names
        coursesData = coursesData.map(course => ({
          ...course,
          // Use department or departments, defaulting to empty object if neither exists
          departments: course.departments || course.department || {},
          // Ensure all required fields have default values
          duration_years: course.duration_years || 4,
          total_semesters: course.total_semesters || 8,
          fee_per_semester: course.fee_per_semester || 0
        }))
      }

      console.log('Processed courses data:', coursesData) // Debug log

      if (coursesData && coursesData.length > 0) {
        console.log(`Found ${coursesData.length} courses in API response`)
        setCourses(coursesData)
        
        // If there's only one course, select it by default
        if (coursesData.length === 1) {
          setSelectedCourseId(coursesData[0].id)
          setValue('course_id', coursesData[0].id, { shouldValidate: true })
        }
      } else {
        console.warn('No courses found in API response, using mock data')
        useMockData()
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      useMockData()
    } finally {
      setLoading(false)
    }
  }

  const useMockData = () => {
    const mockCourses = [
      {
        id: 1,
        name: 'Bachelor of Technology - Computer Science Engineering',
        code: 'B.Tech CSE',
        fee_per_semester: 60000,
        duration_years: 4,
        total_semesters: 8,
        departments: { name: 'Computer Science Engineering', code: 'CSE' }
      },
      {
        id: 2,
        name: 'Bachelor of Technology - Artificial Intelligence & Data Science',
        code: 'B.Tech AI & DS',
        fee_per_semester: 65000,
        duration_years: 4,
        total_semesters: 8,
        departments: { name: 'Artificial Intelligence & Data Science', code: 'AI&DS' }
      },
      {
        id: 3,
        name: 'Bachelor of Technology - Electronics and Communication Engineering',
        code: 'B.Tech ECE',
        fee_per_semester: 55000,
        duration_years: 4,
        total_semesters: 8,
        departments: { name: 'Electronics and Communication Engineering', code: 'ECE' }
      },
      {
        id: 4,
        name: 'Bachelor of Technology - Mechanical Engineering',
        code: 'B.Tech MECH',
        fee_per_semester: 50000,
        duration_years: 4,
        total_semesters: 8,
        departments: { name: 'Mechanical Engineering', code: 'MECH' }
      },
      {
        id: 5,
        name: 'Bachelor of Technology - Civil Engineering',
        code: 'B.Tech CIVIL',
        fee_per_semester: 48000,
        duration_years: 4,
        total_semesters: 8,
        departments: { name: 'Civil Engineering', code: 'CIVIL' }
      },
      {
        id: 6,
        name: 'Bachelor of Technology - Information Technology',
        code: 'B.Tech IT',
        fee_per_semester: 58000,
        duration_years: 4,
        total_semesters: 8,
        departments: { name: 'Information Technology', code: 'IT' }
      },
      {
        id: 7,
        name: 'Bachelor of Technology - Electrical and Electronics Engineering',
        code: 'B.Tech EEE',
        fee_per_semester: 52000,
        duration_years: 4,
        total_semesters: 8,
        departments: { name: 'Electrical and Electronics Engineering', code: 'EEE' }
      },
      {
        id: 8,
        name: 'Bachelor of Computer Applications',
        code: 'BCA',
        fee_per_semester: 45000,
        duration_years: 3,
        total_semesters: 6,
        departments: { name: 'Computer Applications', code: 'CA' }
      }
    ]
    console.log('Using mock courses data:', mockCourses) // Debug log
    setCourses(mockCourses)
  }

  const getSelectedCourseDetails = () => {
    if (!selectedCourseId) return null
    const course = courses.find(c => c.id === selectedCourseId)
    console.log('Selected course details:', course) // Debug log
    return course
  }

  const courseDetails = getSelectedCourseDetails()

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course/Department <span className="text-red-500">*</span>
        </label>
        {loading ? (
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            Loading courses...
          </div>
        ) : (
          <select
            {...register('course_id', { 
              required: 'Course selection is required',
              valueAsNumber: true // Ensure the value is treated as a number
            })}
            value={selectedCourseId || ''}
            onChange={handleCourseChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          >
            <option value="">Select Course</option>
            {courses.map(course => {
              // Get department name, handling both department and departments properties
              const deptName = course.departments?.name || course.department?.name || 'N/A'
              return (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code}) - {deptName}
                </option>
              )
            })}
          </select>
        )}
        {errors.course_id && (
          <p className="mt-1 text-sm text-red-600">{errors.course_id.message}</p>
        )}
      </div>

      {/* Course Details Display */}
      {courseDetails && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Course Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Course:</span> {courseDetails.name}
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Code:</span> {courseDetails.code}
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Department:</span> {courseDetails.departments?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Duration:</span> {courseDetails.duration_years} years
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Semesters:</span> {courseDetails.total_semesters}
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Fee/Semester:</span> ₹{courseDetails.fee_per_semester?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseSelection
