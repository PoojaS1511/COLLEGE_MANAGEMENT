import { supabase } from '../lib/supabase';
import { createStudentWithAuth } from './authService';
import { getAuthToken } from '../utils/auth';

// Validation schema for student data
const validateStudentData = (data, isUpdate = false) => {
  const requiredFields = ['full_name', 'email', 'phone', 'course', 'current_semester'];
  const errors = [];

  // Check required fields
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`${field.replace('_', ' ')} is required`);
    }
  });

  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Phone validation
  if (data.phone && !/^\d{10}$/.test(data.phone)) {
    errors.push('Phone number must be 10 digits');
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  return true;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    console.warn('No authentication token found');
    throw new Error('Authentication required');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Fetch all students with pagination and filters
export const fetchStudents = async ({
  page = 1,
  pageSize = 10,
  filters = {},
  sortField = 'created_at',
  sortOrder = 'desc'
} = {}) => {
  try {
    // Map frontend filter names to backend column names
    const mappedFilters = { ...filters };

    // If 'course' filter is provided, map it to 'course_id' for the backend
    if (mappedFilters.course) {
      mappedFilters.course_id = mappedFilters.course;
      delete mappedFilters.course;
    }

    // Remove undefined, null, or empty string values from filters
    const cleanFilters = Object.entries(mappedFilters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Build query parameters with cleaned filters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      sort: sortField,
      order: sortOrder
    });

    // Add cleaned filters to params
    Object.entries(cleanFilters).forEach(([key, value]) => {
      params.append(key, value);
    });

    console.log('Fetching students with params:', params.toString());

    // Get auth headers
    const headers = getAuthHeaders();

    // Make API request to backend with auth headers
    const response = await fetch(`http://localhost:5001/api/students?${params.toString()}`, {
      method: 'GET',
      headers: headers,
      credentials: 'include' // Important for cookies if using httpOnly cookies
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.warn('Authentication failed');
      localStorage.removeItem('access_token');
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch students: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform the response to match the expected format
    const paginationData = data.pagination || {};

    return {
      data: data.data || [],
      pagination: {
        currentPage: paginationData.page || page,
        pageSize: paginationData.limit || pageSize,
        totalPages: paginationData.pages || Math.ceil((paginationData.total || 0) / pageSize),
        totalItems: paginationData.total || 0
      }
    };
  } catch (error) {
    console.error('Error in fetchStudents:', error);
    throw error;
  }
};

// Fetch a single student by ID with related data
export const fetchStudentById = async (id) => {
  try {
    if (!id) {
      console.warn('No student ID provided to fetchStudentById');
      return null;
    }

    // First, get the basic student data
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Use maybeSingle instead of single to handle no results

    if (studentError) {
      console.error('Error fetching student:', studentError);
      throw studentError;
    }

    // If no student found, return null
    if (!studentData) {
      console.warn(`No student found with ID: ${id}`);
      return null;
    }

    // Try to get course information if course_id exists
    let courseData = null;
    if (studentData.course_id) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          departments!department_id (
            id,
            name,
            code
          )
        `)
        .eq('id', studentData.course_id)
        .maybeSingle();

      if (!courseError && course) {
        courseData = course;
      } else if (courseError) {
        console.warn('Could not fetch course data:', courseError);
      }
    }

    // Return student data with course information if available
    return {
      ...studentData,
      courses: courseData
    };
  } catch (error) {
    console.error(`Error in fetchStudentById for ID ${id}:`, error);
    // Don't throw the error, return null instead to allow the UI to handle it gracefully
    return null;
  }
};

// Add a new student with transaction support
export const addStudent = async (studentData) => {
  try {
    // Validate student data
    validateStudentData(studentData);

    // Generate a default password if not provided
    if (!studentData.password) {
      const namePart = studentData.full_name.replace(/\s+/g, '').toLowerCase().substring(0, 4);
      const phonePart = (studentData.phone || '1234').slice(-4);
      studentData.password = `${namePart}@${phonePart}`; // e.g., "john@1234"
    }

    // Create student with auth
    const result = await createStudentWithAuth(studentData);

    if (!result.success) {
      throw new Error(result.error || 'Failed to create student account');
    }

    return result.data;
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
};

// Update an existing student with validation
export const updateStudent = async (id, updates) => {
  try {
    if (!id) throw new Error('Student ID is required');

    // Validate updates if needed
    if (updates.email || updates.phone) {
      validateStudentData({
        email: updates.email,
        phone: updates.phone,
        full_name: updates.full_name || 'dummy',
        course: updates.course || 'dummy',
        current_semester: updates.current_semester || 1
      }, true);
    }

    const { data, error } = await supabase
      .from('students')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Student not found');

    return data;
  } catch (error) {
    console.error(`Error updating student with ID ${id}:`, error);
    throw new Error(error.message || 'Failed to update student. Please try again.');
  }
};

// Soft delete a student (update status to 'inactive')
export const softDeleteStudent = async (id) => {
  try {
    if (!id) throw new Error('Student ID is required');

    const { data, error } = await supabase
      .from('students')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error soft deleting student with ID ${id}:`, error);
    throw new Error('Failed to delete student. Please try again.');
  }
};

// Permanently delete a student (use with caution)
export const deleteStudent = async (id) => {
  try {
    if (!id) throw new Error('Student ID is required');

    // First check if student exists
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !student) {
      throw new Error('Student not found');
    }

    // Then delete the student
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error deleting student with ID ${id}:`, error);
    throw new Error(error.message || 'Failed to permanently delete student.');
  }
};

// Search students with advanced filtering
export const searchStudents = async (searchTerm, filters = {}) => {
  try {
    if (!searchTerm) {
      return [];
    }

    // Build query parameters
    const params = new URLSearchParams({
      search: searchTerm,
      ...filters
    });

    // Make API request to backend
    const response = await fetch(`http://localhost:5001/api/students/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to search students');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error searching students:', error);
    throw error;
  }
};

// Get student statistics (count by status, course, etc.)
export const getStudentStatistics = async () => {
  try {
    console.log('Fetching student statistics...');

    const response = await fetch('http://localhost:5001/api/students/stats', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    console.log('Statistics response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch student statistics');
    }

    const data = await response.json();

    return {
      total: data.total_students || 0,
      recent: data.recent_students || 0,
      byStatus: data.by_status || {},
      byCourse: data.by_course || [],
      byYear: data.by_year || []
    };
  } catch (error) {
    console.error('Error fetching student statistics:', error);
    return {
      total: 0,
      recent: 0,
      byStatus: {},
      byCourse: [],
      byYear: []
    };
  }
};

// Check current database content
export const checkDatabaseContent = async () => {
  try {
    console.log('🔍 Checking Supabase database content...');

    // Check students table
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .limit(5);

    if (studentsError) {
      console.error('❌ Error fetching students:', studentsError);
      return { error: studentsError.message };
    }

    console.log('📊 Students in database:', students?.length || 0);
    if (students && students.length > 0) {
      console.log('Sample student:', students[0]);
    }

    // Check courses table
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .limit(5);

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError);
    } else {
      console.log('📚 Courses in database:', courses?.length || 0);
      if (courses && courses.length > 0) {
        console.log('Sample course:', courses[0]);
      }
    }

    // Check departments table
    const { data: departments, error: departmentsError } = await supabase
      .from('departments')
      .select('*')
      .limit(5);

    if (departmentsError) {
      console.error('❌ Error fetching departments:', departmentsError);
    } else {
      console.log('🏢 Departments in database:', departments?.length || 0);
      if (departments && departments.length > 0) {
        console.log('Sample department:', departments[0]);
      }
    }

    return {
      students: students || [],
      courses: courses || [],
      departments: departments || []
    };
  } catch (error) {
    console.error('❌ Error checking database:', error);
    return { error: error.message };
  }
};

// Utility function to parse CSV data
export const parseCSVData = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const students = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`);
    }

    const student = {};
    headers.forEach((header, index) => {
      const value = values[index];
      student[header] = value === '' ? null : value;
    });

    students.push(student);
  }

  return students;
};

// Enhanced import function with better error handling and validation
export const importStudentsFromCSV = async (csvText) => {
  try {
    console.log('📄 Starting CSV import...');

    const studentsData = parseCSVData(csvText);
    console.log(`📊 Parsed ${studentsData.length} students from CSV`);

    if (studentsData.length === 0) {
      throw new Error('No valid student data found in CSV');
    }

    console.log('Sample student data:', studentsData[0]);

    const validatedStudents = studentsData.map((student, index) => {
      const requiredFields = ['full_name', 'email'];
      const missingFields = requiredFields.filter(field => !student[field]);

      if (missingFields.length > 0) {
        throw new Error(`Row ${index + 2}: Missing required fields: ${missingFields.join(', ')}`);
      }

      return {
        ...student,
        phone: student.phone || null,
        course_id: student.course_id || null,
        current_semester: student.current_semester ? parseInt(student.current_semester) : 1,
        admission_year: student.admission_year ? parseInt(student.admission_year) : new Date().getFullYear(),
        status: student.status || 'active',
        gender: student.gender || null,
        father_name: student.father_name || null,
        mother_name: student.mother_name || null,
        date_of_birth: student.date_of_birth || null,
        quota_type: student.quota_type || null,
        category: student.category || null,
        hostel_required: student.hostel_required ? student.hostel_required.toLowerCase() === 'true' : false,
        transport_required: student.transport_required ? student.transport_required.toLowerCase() === 'true' : false,
        first_graduate: student.first_graduate ? student.first_graduate.toLowerCase() === 'true' : false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    console.log('✅ Validation complete, importing students...');

    const BATCH_SIZE = 25;
    const results = [];

    for (let i = 0; i < validatedStudents.length; i += BATCH_SIZE) {
      const batch = validatedStudents.slice(i, i + BATCH_SIZE);
      console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(validatedStudents.length / BATCH_SIZE)}`);

      const { data, error } = await supabase
        .from('students')
        .insert(batch)
        .select();

      if (error) {
        console.error('❌ Batch insert error:', error);
        throw new Error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`);
      }

      results.push(...(data || []));
      console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} completed: ${data?.length || 0} students inserted`);
    }

    console.log(`🎉 Successfully imported ${results.length} students!`);

    return {
      success: true,
      count: results.length,
      data: results
    };
  } catch (error) {
    console.error('❌ CSV import failed:', error);
    throw new Error(`CSV Import failed: ${error.message}`);
  }
};