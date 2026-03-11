import { SupabaseService } from './supabaseService';
import supabase from '../lib/supabase';

class ApiService {
  // ====================================
  // Faculty Methods
  // ====================================
  static async getFacultyStudents({ facultyId, semester, section, subjectId }) {
    try {
      // First, get the course ID from the faculty's assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('faculty_subject_assignments')
        .select('course_id, batch_year')
        .eq('faculty_id', facultyId)
        .eq('semester', semester)
        .eq('section', section)
        .eq('subject_id', subjectId)
        .eq('is_active', true)
        .single();

      if (assignmentError || !assignments) {
        throw new Error('No active assignment found for the given criteria');
      }

      // Then get students for that course, batch, and section
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          register_number,
          full_name,
          email,
          phone,
          profile_picture_url,
          current_semester,
          section,
          admission_year,
          course_id,
          created_at,
          roll_no,
          department_id,
          gender
        `)
        .eq('course_id', assignments.course_id)
        .eq('admission_year', assignments.batch_year)
        .eq('section', section);

      if (studentsError) throw studentsError;

      return { 
        success: true, 
        data: students || [] 
      };
    } catch (error) {
      console.error('Error in getFacultyStudents:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch students',
        data: [] 
      };
    }
  }
  static async getFacultyAssignments(facultyId) {
    try {
      const { data, error } = await supabase
        .from('faculty_subject_assignments')
        .select(`
          *,
          subjects (id, name, code),
          courses (id, name, code)
        `)
        .eq('faculty_id', facultyId)
        .eq('is_active', true);

      if (error) throw error;

      return { 
        success: true, 
        data: data || [] 
      };
    } catch (error) {
      console.error('Error in getFacultyAssignments:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch faculty assignments',
        data: [] 
      };
    }
  }

  // ====================================
  // Course Methods
  // ====================================
  static async getCourses(filters = {}) {
    return SupabaseService.getCourses(filters);
  }

  static async updateCourse(id, updates) {
    return SupabaseService.updateCourse(id, updates);
  }

  static async deleteCourse(id) {
    return SupabaseService.deleteCourse(id);
  }

  static async createCourse(courseData) {
    return SupabaseService.createCourse(courseData);
  }

  // ====================================
  // Department Methods
  // ====================================
  static async getAllDepartments(filters = {}) {
    return SupabaseService.getAllDepartments(filters);
  }

  // ====================================
  // Student Methods
  // ====================================
  static async getStudents(filters = {}) {
    return SupabaseService.getStudents(filters);
  }

  static async getStudent(id) {
    return SupabaseService.getStudent(id);
  }

  static async createStudent(studentData) {
    return SupabaseService.createStudent(studentData);
  }

  static async updateStudent(id, updates) {
    return SupabaseService.updateStudent(id, updates);
  }

  static async deleteStudent(id) {
    return SupabaseService.deleteStudent(id);
  }

  // ====================================
  // Mess Status Methods
  // ====================================
  static async getMessStatuses() {
    try {
      const data = await SupabaseService.getMessStatuses();
      return data || [];
    } catch (error) {
      console.error('Error in getMessStatuses:', error);
      throw error;
    }
  }

  static async createMessStatus(statusData) {
    try {
      const data = await SupabaseService.createMessStatus(statusData);
      return data;
    } catch (error) {
      console.error('Error in createMessStatus:', error);
      throw error;
    }
  }

  static async updateMessStatus(id, updates) {
    try {
      const data = await SupabaseService.updateMessStatus(id, updates);
      return data;
    } catch (error) {
      console.error('Error in updateMessStatus:', error);
      throw error;
    }
  }

  static async deleteMessStatus(id) {
    try {
      await SupabaseService.deleteMessStatus(id);
      return { success: true };
    } catch (error) {
      console.error('Error in deleteMessStatus:', error);
      throw error;
    }
  }

  // ====================================
  // Menu Items Methods
  // ====================================
  static async getMenuItems() {
    try {
      const { success, data, message } = await SupabaseService.getMenuItems();
      if (success) {
        return { success: true, data };
      } else {
        throw new Error(message || 'Failed to fetch menu items');
      }
    } catch (error) {
      console.error('Error in getMenuItems:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch menu items'
      };
    }
  }

  static async createMenuItem(menuItemData) {
    try {
      const { success, data, message } = await SupabaseService.createMenuItem(menuItemData);
      if (success) {
        return { success: true, data, message: message || 'Menu item created successfully' };
      } else {
        throw new Error(message || 'Failed to create menu item');
      }
    } catch (error) {
      console.error('Error in createMenuItem:', error);
      return {
        success: false,
        message: error.message || 'Failed to create menu item'
      };
    }
  }

  static async updateMenuItem(id, updates) {
    try {
      const { success, data, message } = await SupabaseService.updateMenuItem(id, updates);
      if (success) {
        return { success: true, data, message: message || 'Menu item updated successfully' };
      } else {
        throw new Error(message || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Error in updateMenuItem:', error);
      return {
        success: false,
        message: error.message || 'Failed to update menu item'
      };
    }
  }

  static async deleteMenuItem(id) {
    try {
      const { success, message } = await SupabaseService.deleteMenuItem(id);
      if (success) {
        return { success: true, message: message || 'Menu item deleted successfully' };
      } else {
        throw new Error(message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error in deleteMenuItem:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete menu item'
      };
    }
  }

  // ====================================
  // Department Methods
  // ====================================  
  static async getAllDepartments(filters = {}) {
    try {
      const response = await SupabaseService.getAllDepartments(filters);
      if (response && response.success) {
        return { 
          success: true, 
          data: Array.isArray(response.data) ? response.data : [] 
        };
      }
      return { 
        success: false, 
        data: [], 
        message: response?.message || 'No departments found' 
      };
    } catch (error) {
      console.error('Error in getAllDepartments:', error);
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch departments' 
      };
    }
  }

  static async getDepartment(id) {
    try {
      if (!id) {
        throw new Error('Department ID is required');
      }
      return await SupabaseService.getDepartment(id);
    } catch (error) {
      console.error('Error in getDepartment:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to fetch department' 
      };
    }
  }

  static async createDepartment(departmentData) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'code'];
      const missingFields = requiredFields.filter(field => !departmentData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      return await SupabaseService.createDepartment(departmentData);
    } catch (error) {
      console.error('Error in createDepartment:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to create department' 
      };
    }
  }

  static async updateDepartment(id, updates) {
    try {
      if (!id) {
        throw new Error('Department ID is required for update');
      }
      return await SupabaseService.updateDepartment(id, updates);
    } catch (error) {
      console.error('Error in updateDepartment:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update department' 
      };
    }
  }

  static async deleteDepartment(id) {
    try {
      if (!id) {
        throw new Error('Department ID is required for deletion');
      }
      return await SupabaseService.deleteDepartment(id);
    } catch (error) {
      console.error('Error in deleteDepartment:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete department' 
      };
    }
  }

  // ====================================
  // Subject Methods
  // ====================================
  static async getSubjects(filters = {}) {
    try {
      const response = await SupabaseService.getSubjects(filters);
      if (response && response.success) {
        return { 
          success: true, 
          data: Array.isArray(response.data) ? response.data : [] 
        };
      }
      return { 
        success: false, 
        data: [], 
        message: response?.message || 'No subjects found' 
      };
    } catch (error) {
      console.error('Error in getSubjects:', error);
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch subjects' 
      };
    }
  }

  static async getSubject(id) {
    try {
      return await SupabaseService.getSubject(id);
    } catch (error) {
      console.error('Error in getSubject:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to fetch subject' 
      };
    }
  }

  // ====================================
  // Exam Management Methods
  // ====================================
  static async getExams(filters = {}) {
    try {
      const response = await SupabaseService.getExams(filters);
      if (response && response.success) {
        return { 
          success: true, 
          data: Array.isArray(response.data) ? response.data : [] 
        };
      }
      return { 
        success: false, 
        data: [], 
        message: response?.message || 'No exams found' 
      };
    } catch (error) {
      console.error('Error in getExams:', error);
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch exams' 
      };
    }
  }

  static async getExam(id) {
    try {
      return await SupabaseService.getExam(id);
    } catch (error) {
      console.error('Error in getExam:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to fetch exam' 
      };
    }
  }

  static async createExam(examData) {
    try {
      return await SupabaseService.createExam(examData);
    } catch (error) {
      console.error('Error in createExam:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to create exam' 
      };
    }
  }

  static async updateExam(id, updates) {
    try {
      return await SupabaseService.updateExam(id, updates);
    } catch (error) {
      console.error('Error in updateExam:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to update exam' 
      };
    }
  }

  static async deleteExam(id) {
    try {
      return await SupabaseService.deleteExam(id);
    } catch (error) {
      console.error('Error in deleteExam:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete exam' 
      };
    }
  }

  // ====================================
  // Exam Results Methods
  // ====================================
  static async getExamResults(filters = {}) {
    try {
      const response = await SupabaseService.getExamResults(filters);
      if (response && response.success) {
        return { 
          success: true, 
          data: Array.isArray(response.data) ? response.data : [] 
        };
      }
      return { 
        success: false, 
        data: [], 
        message: response?.message || 'No exam results found' 
      };
    } catch (error) {
      console.error('Error in getExamResults:', error);
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch exam results' 
      };
    }
  }

  static async upsertExamResult(resultData) {
    try {
      return await SupabaseService.upsertExamResult(resultData);
    } catch (error) {
      console.error('Error in upsertExamResult:', error);
      return { 
        success: false, 
        data: null, 
        message: error.message || 'Failed to save exam result' 
      };
    }
  }

  static async getStudentsForMarks(examId, subjectId) {
    try {
      return await SupabaseService.getStudentsForMarks(examId, subjectId);
    } catch (error) {
      console.error('Error in getStudentsForMarks:', error);
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch students for marks entry' 
      };
    }
  }

  static async getSubject(id) {
    return SupabaseService.getSubject(id);
  }

  static async createSubject(subjectData) {
    return SupabaseService.createSubject(subjectData);
  }

  static async updateSubject(id, updates) {
    return SupabaseService.updateSubject(id, updates);
  }

  static async deleteSubject(id) {
    return SupabaseService.deleteSubject(id);
  }

  // Attendance
  static async getStudentAttendance(studentId, filters = {}) {
    return SupabaseService.getStudentAttendance(studentId, filters);
  }

  static async getAttendanceRecords(filters = {}) {
    try {
      const response = await SupabaseService.getAttendanceRecords(filters);
      console.log('Attendance records API response:', response);
      
      if (response && response.success) {
        return { 
          success: true, 
          data: response.data || [],
          message: response.message || ''
        };
      }
      
      return { 
        success: false, 
        data: [], 
        message: response?.message || 'No attendance records found'
      };
    } catch (error) {
      console.error('Error in getAttendanceRecords:', error);
      
      // In development, return sample data if there's an error
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using sample attendance data in development');
        return {
          success: true,
          data: [
            {
              id: '1',
              date: new Date().toISOString().split('T')[0],
              subject: { id: '1', name: 'Mathematics', code: 'MATH101' },
              course: { id: '1', name: 'B.Tech CSE', code: 'CSE' },
              present_count: 25,
              total_students: 30,
              status: 'completed'
            },
            {
              id: '2',
              date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
              subject: { id: '2', name: 'Physics', code: 'PHY101' },
              course: { id: '1', name: 'B.Tech CSE', code: 'CSE' },
              present_count: 28,
              total_students: 30,
              status: 'completed'
            }
          ],
          message: 'Using sample attendance data'
        };
      }
      
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch attendance records'
      };
    }
  }

  static async getAllCourses() {
    try {
      const response = await SupabaseService.getCourses();
      console.log('Courses response from Supabase:', response);
      
      if (response && Array.isArray(response)) {
        // Handle direct array response from Supabase
        return { 
          success: true, 
          data: response.length > 0 ? response : [],
          message: response.length > 0 ? '' : 'No courses found'
        };
      } else if (response && response.success) {
        // Handle success response with data
        return { 
          success: true, 
          data: response.data || [],
          message: response.message || ''
        };
      } else if (response && !response.success) {
        // Handle error response
        return { 
          success: false, 
          data: [], 
          message: response.message || 'Failed to fetch courses'
        };
      }
      
      // Fallback for unexpected response format
      return { 
        success: false, 
        data: [], 
        message: 'Unexpected response format from server'
      };
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      // Fallback to sample data in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using sample courses data in development');
        return {
          success: true,
          data: [
            { id: 1, name: 'B.Tech CSE', code: 'CSE', duration: 4 },
            { id: 2, name: 'B.Tech ECE', code: 'ECE', duration: 4 },
            { id: 3, name: 'B.Tech ME', code: 'ME', duration: 4 },
            { id: 4, name: 'B.Tech CE', code: 'CE', duration: 4 },
            { id: 5, name: 'BBA', code: 'BBA', duration: 3 },
            { id: 6, name: 'MBA', code: 'MBA', duration: 2 }
          ],
          message: 'Using sample data in development'
        };
      }
      return { 
        success: false, 
        data: [], 
        message: error.message || 'Failed to fetch courses'
      };
    }
  }

  // Exam Results
  static async getStudentResults(studentId) {
    try {
      const response = await SupabaseService.getMarks({ student_id: studentId });
      if (response && response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [], message: response?.message || 'No results found' };
    } catch (error) {
      console.error('Error in getStudentResults:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  // Marks Management
  static async getMarks(filters = {}) {
    try {
      const response = await SupabaseService.getMarks(filters);
      if (response && response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [], message: response?.message || 'No marks found' };
    } catch (error) {
      console.error('Error in getMarks:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  static async upsertMarks(marksData) {
    try {
      const response = await SupabaseService.upsertMarks(marksData);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Failed to save marks' };
    } catch (error) {
      console.error('Error in upsertMarks:', error);
      return { success: false, message: error.message };
    }
  }

  static async getStudentsForMarks(examId, subjectId) {
    try {
      const response = await SupabaseService.getStudentsForMarks(examId, subjectId);
      if (response && response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [], message: response?.message || 'No students found' };
    } catch (error) {
      console.error('Error in getStudentsForMarks:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  // Exams
  static async getExams(filters = {}) {
    try {
      const response = await SupabaseService.getExams(filters);
      if (response && response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [], message: response?.message || 'No exams found' };
    } catch (error) {
      console.error('Error in getExams:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  static async getExam(id) {
    try {
      const response = await SupabaseService.getExam(id);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Exam not found' };
    } catch (error) {
      console.error('Error in getExam:', error);
      return { success: false, message: error.message };
    }
  }

  static async createExam(examData) {
    try {
      const response = await SupabaseService.createExam(examData);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Failed to create exam' };
    } catch (error) {
      console.error('Error in createExam:', error);
      return { success: false, message: error.message };
    }
  }

  static async updateExam(id, examData) {
    try {
      const response = await SupabaseService.updateExam(id, examData);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Failed to update exam' };
    } catch (error) {
      console.error('Error in updateExam:', error);
      return { success: false, message: error.message };
    }
  }

  static async deleteExam(id) {
    try {
      const response = await SupabaseService.deleteExam(id);
      if (response && response.success) {
        return { success: true };
      }
      return { success: false, message: response?.message || 'Failed to delete exam' };
    } catch (error) {
      console.error('Error in deleteExam:', error);
      return { success: false, message: error.message };
    }
  }

  // Exams
  static async getExams(filters = {}) {
    try {
      const response = await SupabaseService.getExams(filters);
      if (response && response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, data: [], message: response?.message || 'No exams found' };
    } catch (error) {
      console.error('Error in getExams:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  static async getExam(id) {
    try {
      const response = await SupabaseService.getExam(id);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Exam not found' };
    } catch (error) {
      console.error('Error in getExam:', error);
      return { success: false, message: error.message };
    }
  }

  static async createExam(examData) {
    try {
      const response = await SupabaseService.createExam(examData);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Failed to create exam' };
    } catch (error) {
      console.error('Error in createExam:', error);
      return { success: false, message: error.message };
    }
  }

  static async updateExam(id, examData) {
    try {
      const response = await SupabaseService.updateExam(id, examData);
      if (response && response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response?.message || 'Failed to update exam' };
    } catch (error) {
      console.error('Error in updateExam:', error);
      return { success: false, message: error.message };
    }
  }

  static async deleteExam(id) {
    try {
      const response = await SupabaseService.deleteExam(id);
      if (response && response.success) {
        return { success: true };
      }
      return { success: false, message: response?.message || 'Failed to delete exam' };
    } catch (error) {
      console.error('Error in deleteExam:', error);
      return { success: false, message: error.message };
    }
  }

  // Generic request method for any remaining API calls
  static async request(endpoint, options = {}) {
    console.warn(`Direct API call to ${endpoint} not implemented. Using Supabase methods directly.`);
    throw new Error('API endpoint not implemented. Use Supabase methods directly.');
  }

  // ====================================
  // Student Resume Methods
  // ====================================
  static async getStudentResume(studentId) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('student_id', studentId)
        .order('upload_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      // If no resume found, return success but with uploaded: false
      if (!data || data.length === 0) {
        return {
          success: true,
          uploaded: false,
          data: null
        };
      }

      return {
        success: true,
        uploaded: true,
        data: data[0] // Return the first (and only) result
      };
    } catch (error) {
      console.error('Error fetching student resume:', error);
      return {
        success: false,
        error: error.message,
        uploaded: false
      };
    }
  }

  // ====================================
  // Internal Marks Methods
  // ====================================
  static async saveInternalMarks(marksData) {
    try {
      if (!Array.isArray(marksData) || marksData.length === 0) {
        throw new Error('No marks data provided');
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      // Get current timestamp for all operations
      const currentTimestamp = new Date().toISOString();

      // Process each mark record
      const results = await Promise.all(marksData.map(async (mark) => {
        // Check if a record with these constraints already exists
        const { data: existingMark, error: fetchError } = await supabase
          .from('internal_marks')
          .select('id, entered_at')
          .eq('student_id', mark.student_id)
          .eq('faculty_subject_assignment_id', mark.faculty_subject_assignment_id)
          .eq('assessment_type', mark.assessment_type)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingMark) {
          // Update existing record
          const updateData = {
            marks_obtained: mark.marks_obtained,
            max_marks: mark.max_marks,
            remarks: mark.remarks,
            // Use entered_at for existing records to maintain the original timestamp
            entered_at: existingMark.entered_at || currentTimestamp
          };

          const { data, error: updateError } = await supabase
            .from('internal_marks')
            .update(updateData)
            .eq('id', existingMark.id)
            .select();

          if (updateError) throw updateError;
          return { data, isNew: false };
        } else {
          // Prepare data for new record
          const newRecord = {
            ...mark,
            entered_at: currentTimestamp,
            entered_by_faculty_id: session.user.id
          };

          // Insert new record
          const { data, error: insertError } = await supabase
            .from('internal_marks')
            .insert(newRecord)
            .select();

          if (insertError) throw insertError;
          return { data, isNew: true };
        }
      }));

      const savedCount = results.length;
      const newCount = results.filter(r => r.isNew).length;
      const updatedCount = savedCount - newCount;

      return {
        success: true,
        message: `Successfully processed ${savedCount} records (${newCount} new, ${updatedCount} updated)`,
        data: results.map(r => r.data[0])
      };
    } catch (error) {
      console.error('Error in saveInternalMarks:', error);
      return {
        success: false,
        message: error.message || 'Failed to save internal marks',
        error: error
      };
    }
  }
}

export default ApiService;
