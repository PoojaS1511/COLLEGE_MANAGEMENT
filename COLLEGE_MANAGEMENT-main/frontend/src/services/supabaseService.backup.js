import { supabase } from '../lib/supabase';

class SupabaseService {
  // Students
  static async getStudents(filters = {}) {
    try {
      let query = supabase
        .from('students')
        .select(`
          *,
          course:course_id (id, name, code),
          department:department_id (id, name, code)
        `);

      // Apply search filter
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,register_number.ilike.%${filters.search}%`);
      }

      // Apply department filter
      if (filters.department_id) {
        query = query.eq('department_id', filters.department_id);
      }

      // Apply course filter
      if (filters.course_id) {
        query = query.eq('course_id', filters.course_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getStudents:', error);
      return { success: false, error: error.message };
    }
  }

  static async getStudent(id) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        department:department_id (id, name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  static async createStudent(studentData) {
    // First, insert the student data
    const { data: insertedStudent, error: insertError } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();

    if (insertError) throw insertError;

    // Then fetch the student with all relationships
    const { data: studentWithRelations, error: fetchError } = await supabase
      .from('students')
      .select(`
        *,
        course:course_id (id, name, code),
        department:department_id (id, name, code)
      `)
      .eq('id', insertedStudent.id)
      .single();

    if (fetchError) {
      console.error('Error fetching student with relationships:', fetchError);
      // Return the inserted student even if we couldn't fetch relationships
      return { success: true, data: insertedStudent };
    }

    return { success: true, data: studentWithRelations };
  }

  static async updateStudent(id, updates) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        department:department_id (id, name, code)
      `)
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  static async deleteStudent(id) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  // Departments
  static async getAllDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Courses
  static async getCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          department:department_id (id, name, code)
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error in getCourses:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data || [],
        message: data && data.length > 0 ? '' : 'No courses found'
      };
    } catch (error) {
      console.error('Unexpected error in getCourses:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch courses'
      };
    }
    
    // Ensure we always return an array
    return { data: Array.isArray(data) ? data : [], error: null };
  }

  static async getCourse(id) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        department:department_id (id, name, code)
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return { success: true, data };
  }

  static async checkCourseCodeExists(code, excludeId = null) {
    try {
      console.log('[Supabase] Checking if course code exists:', { code, excludeId });
      
      if (!code || typeof code !== 'string') {
        console.error('[Supabase] Invalid course code:', code);
        return { success: false, exists: false, error: 'Invalid course code' };
      }
      
      const trimmedCode = code.trim();
      if (!trimmedCode) {
        return { success: false, exists: false, error: 'Course code cannot be empty' };
      }
      
      // First, try to find any course with this code
      let query = supabase
        .from('courses')
        .select('id, code')
        .eq('code', trimmedCode)
        .maybeSingle();
      
      const { data: existingCourse, error: fetchError } = await query;
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('[Supabase] Error checking course code:', fetchError);
        return { 
          success: false, 
          exists: false, 
          error: 'Error checking course code',
          details: fetchError 
        };
      }
      
      // If no course found with this code, it's available
      if (!existingCourse) {
        return { success: true, exists: false };
      }
      
      // If we're excluding an ID and it matches, it's not a duplicate
      if (excludeId && existingCourse.id === excludeId) {
        return { success: true, exists: false };
      }
      
      // Otherwise, the code is already in use
      return { 
        success: true, 
        exists: true,
        message: `Course code '${trimmedCode}' is already in use`
      };
      
    } catch (error) {
      console.error('[Supabase] Error in checkCourseCodeExists:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      
      // If it's a unique constraint violation, the code exists
      if (error.code === '23505' || error.message?.includes('unique constraint')) {
        return { 
          success: true, 
          exists: true,
          message: 'This course code is already in use'
        };
      }
      
      return { 
        success: false, 
        exists: false, 
        error: error.message || 'Failed to check course code',
        details: error 
      };
    }
  }

  static async createCourse(courseData) {
    try {
      // Create a new object without the id field
      const { id, ...courseWithoutId } = courseData;
      
      // Ensure all required fields are present and properly typed
      const dataToInsert = { 
        name: String(courseWithoutId.name || '').trim(),
        code: String(courseWithoutId.code || '').trim(),
        description: String(courseWithoutId.description || '').trim(),
        duration: Number(courseWithoutId.duration) || 1,
        credits: Number(courseWithoutId.credits) || 0,
        department_id: courseWithoutId.department_id || null
      };
      
      // Validate required fields
      if (!dataToInsert.code) {
        throw new Error('Course code is required');
      }
      
      if (!dataToInsert.name) {
        throw new Error('Course name is required');
      }
      
      // Log the data being sent for debugging
      console.log('Creating course with data:', dataToInsert);
      
      // First, check if a course with this code already exists
      const { exists: codeExists } = await this.checkCourseCodeExists(dataToInsert.code);
      if (codeExists) {
        throw { 
          code: '23505', 
          message: `A course with code '${dataToInsert.code}' already exists` 
        };
      }
      
      const { data, error } = await supabase
        .from('courses')
        .insert([dataToInsert])
        .select(`
          *,
          department:department_id (id, name, code)
        `)
        .single();
        
      if (error) {
        console.error('Error creating course:', error);
        
        // Handle duplicate key error specifically
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          throw { 
            code: '23505', 
            message: `A course with code '${dataToInsert.code}' already exists` 
          };
        }
        
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in createCourse:', error);
      throw error; // Re-throw to be handled by the caller
    }
  }

  static async updateCourse(id, updates) {
    // Ensure all fields are properly typed
    const updatesToApply = {
      ...updates,
      name: updates.name !== undefined ? String(updates.name) : undefined,
      code: updates.code !== undefined ? String(updates.code) : undefined,
      description: updates.description !== undefined ? String(updates.description) : undefined,
      duration: updates.duration !== undefined ? Number(updates.duration) : undefined,
      credits: updates.credits !== undefined ? Number(updates.credits) : undefined,
      department_id: updates.department_id || null
    };
    
    // Remove undefined values
    Object.keys(updatesToApply).forEach(key => 
      updatesToApply[key] === undefined && delete updatesToApply[key]
    );
    
    // Log the data being sent for debugging
    console.log('Updating course with data:', updatesToApply);
    
    const { data, error } = await supabase
      .from('courses')
      .update(updatesToApply)
      .eq('id', id)
      .select(`
        *,
        department:department_id (id, name, code)
      `)
      .single();
      
    if (error) {
      console.error('Error updating course:', error);
      throw error;
    }
    
    return { success: true, data };
  }

  static async deleteCourse(id) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return { success: true };
  }

  // Helper function to check if a string is a valid UUID
  static isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(String(uuid));
  }

  // Helper function to combine subjects with courses
  static combineSubjectsWithCourses(subjects, courses) {
    // Create a map of course ID to course (with string keys for comparison)
    const courseMap = new Map();
    courses.forEach(course => {
      courseMap.set(String(course.id), course);
    });

    // Combine the data
    return subjects.map(subject => ({
      ...subject,
      course: subject.course_id ? (courseMap.get(String(subject.course_id)) || null) : null
    }));
  }

  // Subjects
  static async getSubjects(courseId = null) {
    try {
      // First, get all subjects
      let query = supabase
        .from('subjects')
        .select('*');
      
      if (courseId) {
        // Convert courseId to string to match the database type
        query = query.eq('course_id', String(courseId));
      }

      const { data: subjects, error: subjectsError } = await query;
      
      if (subjectsError) throw subjectsError;

      // If no subjects found, return empty array
      if (!subjects || subjects.length === 0) {
        return { success: true, data: [] };
      }

      // Get all unique course IDs as strings and filter out invalid UUIDs
      const courseIds = [...new Set(subjects
        .map(subject => subject.course_id ? String(subject.course_id) : null)
        .filter(Boolean)
      )];

      // If no valid course IDs, return subjects with null courses
      if (courseIds.length === 0) {
        return { 
          success: true, 
          data: subjects.map(subject => ({
            ...subject,
            course: null
          }))
        };
      }

      // Filter out non-UUID course IDs to prevent query errors
      const validUUIDs = courseIds.filter(id => SupabaseService.isValidUUID(id));
      
      if (validUUIDs.length > 0) {
        try {
          // Try to fetch courses with valid UUIDs
          const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('id, name, code')
            .in('id', validUUIDs);
          
          if (coursesError) throw coursesError;
          
          // If we got courses, return them
          if (courses && courses.length > 0) {
            return { 
              success: true, 
              data: SupabaseService.combineSubjectsWithCourses(subjects, courses)
            };
          }
        } catch (e) {
          console.log('Error fetching courses with UUIDs, trying alternative approach:', e);
        }
      }

      // If we're here, either the direct ID match failed or returned no results
      // Try to fetch all courses and match them by ID as strings
      try {
        const { data: allCourses, error: allCoursesError } = await supabase
          .from('courses')
          .select('id, name, code');
        
        if (allCoursesError) throw allCoursesError;
        
        // Convert all course IDs to strings for comparison
        const stringCourses = allCourses.map(course => ({
          ...course,
          id: String(course.id)
        }));
        
        return { 
          success: true, 
          data: SupabaseService.combineSubjectsWithCourses(subjects, stringCourses)
        };
      } catch (e) {
        console.error('Error fetching all courses:', e);
        // If all else fails, return subjects without course data
        return { 
          success: true, 
          data: subjects.map(subject => ({
            ...subject,
            course: null
          }))
        };
      }
    } catch (error) {
      console.error('Error in getSubjects:', error);
      // Return empty array on error to prevent UI breakage
      return { 
        success: false, 
        data: [], 
        error: {
          message: error.message || 'Failed to load subjects',
          code: error.code
        }
      };
    }
  }

  static async getSubject(id) {
    try {
      // First, get the subject
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();
        
      if (subjectError) throw subjectError;
      if (!subject) return { success: true, data: null };

      // If there's a course_id, fetch the course details
      let course = null;
      if (subject.course_id) {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, name, code')
          .eq('id', subject.course_id)
          .single();
          
        if (!courseError) {
          course = courseData;
        }
      }

      // Combine the data
      const enrichedSubject = {
        ...subject,
        course
      };

      return { success: true, data: enrichedSubject };
    } catch (error) {
      console.error('Error in getSubject:', error);
      throw error;
    }
  }

  static async createSubject(subjectData) {
    try {
      // Prepare the subject data with proper types
      const subjectToCreate = {
        name: String(subjectData.name || '').trim(),
        code: String(subjectData.code || '').trim(),
        course_id: subjectData.course_id || null,
        semester: subjectData.semester ? parseInt(subjectData.semester, 10) : 1,
        credits: subjectData.credits ? parseInt(subjectData.credits, 10) : 3,
        subject_type: String(subjectData.type || subjectData.subject_type || 'Theory').trim(),
        is_elective: Boolean(subjectData.is_elective || false),
        description: String(subjectData.description || '').trim()
      };

      // Validate required fields
      if (!subjectToCreate.name) {
        throw new Error('Subject name is required');
      }
      if (!subjectToCreate.code) {
        throw new Error('Subject code is required');
      }
      if (!subjectToCreate.course_id) {
        throw new Error('Course is required');
      }

      // First, check if a subject with this code already exists
      const { data: existingSubject } = await supabase
        .from('subjects')
        .select('id')
        .eq('code', subjectToCreate.code)
        .maybeSingle();

      if (existingSubject) {
        throw { 
          code: '23505', 
          message: `A subject with code '${subjectToCreate.code}' already exists` 
        };
      }

      // Insert the subject
      const { data: subject, error: insertError } = await supabase
        .from('subjects')
        .insert([subjectToCreate])
        .select('*')
        .single();
        
      if (insertError) throw insertError;
      
      // Fetch the course details
      let course = null;
      if (subject.course_id) {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, name, code')
          .eq('id', subject.course_id)
          .single();
          
        if (!courseError) {
          course = courseData;
        }
      }
      
      // Combine the data
      const enrichedSubject = {
        ...subject,
        course
      };
      
      return { success: true, data: enrichedSubject };
    } catch (error) {
      console.error('Error in createSubject:', error);
      throw error;
    }
  }

  static async updateSubject(id, updates) {
    try {
      // Prepare the update data with proper types
      const subjectUpdates = {
        name: updates.name !== undefined ? String(updates.name).trim() : undefined,
        code: updates.code !== undefined ? String(updates.code).trim() : undefined,
        course_id: updates.course_id !== undefined ? updates.course_id : undefined,
        semester: updates.semester !== undefined ? parseInt(updates.semester, 10) : undefined,
        credits: updates.credits !== undefined ? parseInt(updates.credits, 10) : undefined,
        subject_type: updates.type !== undefined ? String(updates.type).trim() : 
                     updates.subject_type !== undefined ? String(updates.subject_type).trim() : undefined,
        is_elective: updates.is_elective !== undefined ? Boolean(updates.is_elective) : undefined,
        description: updates.description !== undefined ? String(updates.description).trim() : undefined
      };

      // Remove undefined values
      Object.keys(subjectUpdates).forEach(key => {
        if (subjectUpdates[key] === undefined) {
          delete subjectUpdates[key];
        }
      });

      // Validate required fields if they are being updated
      if (subjectUpdates.name !== undefined && !subjectUpdates.name) {
        throw new Error('Subject name cannot be empty');
      }
      if (subjectUpdates.code !== undefined && !subjectUpdates.code) {
        throw new Error('Subject code cannot be empty');
      }
      if (subjectUpdates.course_id !== undefined && !subjectUpdates.course_id) {
        throw new Error('Course is required');
      }

      // If updating the code, check for duplicates
      if (subjectUpdates.code) {
        const { data: existingSubject } = await supabase
          .from('subjects')
          .select('id')
          .eq('code', subjectUpdates.code)
          .neq('id', id)
          .maybeSingle();

        if (existingSubject) {
          throw { 
            code: '23505', 
            message: `A subject with code '${subjectUpdates.code}' already exists` 
          };
        }
      }

      // Update the subject
      const { data: subject, error: updateError } = await supabase
        .from('subjects')
        .update(subjectUpdates)
        .eq('id', id)
        .select('*')
        .single();
        
      if (updateError) throw updateError;
      
      // If there's a course_id, fetch the course details
      let course = null;
      if (subject.course_id) {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, name, code')
          .eq('id', subject.course_id)
          .single();
          
        if (!courseError) {
          course = courseData;
        }
      }
      
      // Combine the data
      const enrichedSubject = {
        ...subject,
        course
      };
      
      return { success: true, data: enrichedSubject };
    } catch (error) {
      console.error('Error in updateSubject:', error);
      throw error;
    }
  }

  static async deleteSubject(id) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return { success: true };
  }

  // Attendance
  static async getStudentAttendance(studentId, filters = {}) {
    try {
      // First, get all attendance records for the student
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId);

      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate).lte('date', filters.endDate);
      }

      if (filters.subjectId) {
        query = query.eq('subject_id', filters.subjectId);
      }

      const { data: attendanceData, error } = await query;
      
      if (error) throw error;
      
      if (!attendanceData || attendanceData.length === 0) {
        return { success: true, data: [] };
      }
      
      // Get unique subject IDs
      const subjectIds = [...new Set(attendanceData.map(a => a.subject_id))];
      
      // Fetch related subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, code')
        .in('id', subjectIds);
        
      if (subjectsError) throw subjectsError;
      
      // Create lookup map for subjects
      const subjectsMap = new Map(subjectsData?.map(s => [s.id, s]) || []);
      
      // Enrich attendance data with subject info
      const enrichedData = attendanceData.map(record => ({
        ...record,
        subject: subjectsMap.get(record.subject_id) || { 
          id: record.subject_id, 
          name: 'Unknown Subject', 
          code: 'N/A' 
        },
        student: { id: studentId } // We already know the student ID
      }));
      
      return { 
        success: true, 
        data: enrichedData 
      };
    } catch (error) {
      console.error('Error in getStudentAttendance:', error);
      
      // Return a more helpful error message
      if (error.message && error.message.includes('foreign key')) {
        throw new Error('Error fetching attendance: Database relationship issue. Please check if all related records exist.');
      }
      
      throw error;
    }
  }

  static async getAttendanceRecords(filters = {}) {
    try {
      // First, get all attendance records with basic info
      let query = supabase
        .from('attendance')
        .select('*');

      // Apply filters
      if (filters.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      
      if (filters.subjectId) {
        query = query.eq('subject_id', filters.subjectId);
      }
      
      if (filters.date) {
        query = query.eq('date', filters.date);
      }
      
      if (filters.startDate && filters.endDate) {
        query = query.gte('date', filters.startDate).lte('date', filters.endDate);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Execute the query
      const { data: attendanceData, error } = await query;
      
      if (error) throw error;
      
      if (!attendanceData || attendanceData.length === 0) {
        return { success: true, data: [] };
      }
      
      // Get unique subject and student IDs
      const subjectIds = [...new Set(attendanceData.map(a => a.subject_id))];
      const studentIds = [...new Set(attendanceData.map(a => a.student_id))];
      
      // Fetch related subjects and students in parallel
      const [subjectsResponse, studentsResponse] = await Promise.all([
        subjectIds.length > 0 
          ? supabase.from('subjects').select('id, name, code').in('id', subjectIds)
          : { data: [] },
        studentIds.length > 0 
          ? supabase
              .from('students')
              .select('id, register_number, full_name, email, phone')
              .in('id', studentIds)
          : { data: [] }
      ]);
      
      if (subjectsResponse.error) throw subjectsResponse.error;
      if (studentsResponse.error) throw studentsResponse.error;
      
      // Create lookup maps for subjects and students
      const subjectsMap = new Map(subjectsResponse.data.map(s => [s.id, s]));
      const studentsMap = new Map(studentsResponse.data.map(s => [s.id, s]));
      
      // Enrich attendance data with subject and student info
      const enrichedData = attendanceData.map(record => {
        const student = studentsMap.get(record.student_id) || { 
          id: record.student_id, 
          register_number: 'N/A', 
          full_name: 'Unknown Student',
          email: '',
          phone: ''
        };
        
        return {
          ...record,
          subject: subjectsMap.get(record.subject_id) || { 
            id: record.subject_id, 
            name: 'Unknown Subject', 
            code: 'N/A' 
          },
          student: {
            ...student,
            // For backward compatibility, include student_id as an alias for register_number
            student_id: student.register_number || 'N/A'
          }
        };
      });
      
      return { 
        success: true, 
        data: enrichedData
      };
    } catch (error) {
      console.error('Error in getAttendanceRecords:', error);
      
      // Return a more helpful error message
      if (error.message && error.message.includes('foreign key')) {
        throw new Error('Error fetching attendance records: Database relationship issue. Please check if all related records exist.');
      }
      
      throw error;
    }
  }

  // Exam Results
  static async getStudentResults(studentId) {
    const { data, error } = await supabase
      .from('exam_results')
      .select(`
        *,
        exam:exam_id (
          *,
          subject:subject_id (id, name, code)
        )
      `)
      .eq('student_id', studentId);

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Timetable
  static async getStudentTimetable(studentId) {
    // First get student's course and semester
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('course_id, current_semester')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;
    if (!student) throw new Error('Student not found');

    // Then get the timetable for the student's course and semester
    const { data: timetable, error: timetableError } = await supabase
      .from('timetable')
      .select(`
        *,
        subject:subject_id (id, name, code),
        faculty:faculty_id (id, name, email),
        course:course_id (id, name, code)
      `)
      .eq('course_id', student.course_id)
      .eq('semester', student.current_semester)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (timetableError) throw timetableError;
    return { success: true, data: timetable || [] };
  }

  // Exam Methods
  static async getExams(filters = {}) {
    try {
      let query = supabase
        .from('exams')
        .select(`
          *,
          subject:subject_id (id, name, code)
        `);

      // Apply academic year filter
      if (filters.academic_year) {
        query = query.eq('academic_year', filters.academic_year);
      }

      // Apply semester filter
      if (filters.semester) {
        query = query.eq('semester', filters.semester);
      }

      // Apply subject filter
      if (filters.subject_id) {
        query = query.eq('subject_id', filters.subject_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getExams:', error);
      return { success: false, error: error.message };
    }
  }

  static async getExam(id) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          subject:subject_id (id, name, code)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in getExam:', error);
      return { success: false, error: error.message };
    }
  }

  static async createExam(examData) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([examData])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in createExam:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateExam(id, examData) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .update(examData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in updateExam:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteExam(id) {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in deleteExam:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all exams with optional filters
  static async getExams(filters = {}) {
    try {
      let query = supabase
        .from('exams')
        .select(`
          *,
          subject:subject_id (id, name, code)
        `);

      // Apply academic year filter
      if (filters.academic_year) {
        query = query.eq('academic_year', filters.academic_year);
      }

      // Apply semester filter
      if (filters.semester) {
        query = query.eq('semester', filters.semester);
      }

      // Apply subject filter
      if (filters.subject_id) {
        query = query.eq('subject_id', filters.subject_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getExams:', error);
      return { success: false, error: error.message };
    }
  }

  // Get a single exam by ID
  static async getExam(id) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          subject:subject_id (id, name, code)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in getExam:', error);
      return { success: false, error: error.message };
    }
  }

  // Create a new exam
  static async createExam(examData) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([examData])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in createExam:', error);
      return { success: false, error: error.message };
    }
  }

  // Update an existing exam
  static async updateExam(id, examData) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .update(examData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in updateExam:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete an exam
  static async deleteExam(id) {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in deleteExam:', error);
      return { success: false, error: error.message };
    }
  }

  // Exam Methods
  static async getExams(filters = {}) {
    try {
      let query = supabase
        .from('exams')
        .select(`
          *,
          course:course_id (id, name, code),
          subject:subject_id (id, name, code)
        `);

      // Apply course filter
      if (filters.course_id) {
        query = query.eq('course_id', filters.course_id);
      }

      // Apply academic year filter
      if (filters.academic_year) {
        query = query.eq('academic_year', filters.academic_year);
      }

      // Apply semester filter
      if (filters.semester) {
        query = query.eq('semester', filters.semester);
      }

      // Apply subject filter
      if (filters.subject_id) {
        query = query.eq('subject_id', filters.subject_id);
      }

      // Apply date range filter
      if (filters.start_date && filters.end_date) {
        query = query.gte('exam_date', filters.start_date)
                    .lte('exam_date', filters.end_date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getExams:', error);
      return { success: false, error: error.message };
    }
  }

  static async getExam(id) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          course:course_id (id, name, code),
          subject:subject_id (id, name, code)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in getExam:', error);
      return { success: false, error: error.message };
    }
  }

  static async createExam(examData) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([{
          name: examData.name,
          exam_date: examData.date,
          exam_type: examData.exam_type,
          course_id: examData.course_id,
          description: examData.description,
          start_time: examData.start_time,
          duration: examData.duration,
          total_marks: examData.total_marks,
          academic_year: examData.academic_year,
          semester: examData.semester,
          subject_id: examData.subject_id
        }])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in createExam:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateExam(id, examData) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .update({
          name: examData.name,
          exam_date: examData.date,
          exam_type: examData.exam_type,
          course_id: examData.course_id,
          description: examData.description,
          start_time: examData.start_time,
          duration: examData.duration,
          total_marks: examData.total_marks,
          academic_year: examData.academic_year,
          semester: examData.semester,
          subject_id: examData.subject_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in updateExam:', error);
      return { success: false, error: error.message };
    }
  }

  // Marks Methods
  static async getMarks(filters = {}) {
    try {
      let query = supabase
        .from('marks')
        .select('*');

      if (filters.exam_id) {
        query = query.eq('exam_id', filters.exam_id);
      }
      if (filters.student_id) {
        query = query.eq('student_id', filters.student_id);
      }
      if (filters.subject_id) {
        query = query.eq('subject_id', filters.subject_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getMarks:', error);
      return { success: false, error: error.message };
    }
  }

  static async upsertMarks(marksData) {
    try {
      const { data, error } = await supabase
        .from('marks')
        .upsert(marksData, { onConflict: 'exam_id,student_id,subject_id' })
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in upsertMarks:', error);
      return { success: false, error: error.message };
    }
  }

  static async getStudentsForMarks(examId, subjectId) {
    try {
      // First, get the exam to get course_id
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('course_id')
        .eq('id', examId)
        .single();

      if (examError) throw examError;
      if (!exam) throw new Error('Exam not found');

      // Then get all students in that course
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('course_id', exam.course_id);

      if (studentsError) throw studentsError;

      // Get existing marks for these students
      const { data: existingMarks, error: marksError } = await supabase
        .from('marks')
        .select('*')
        .eq('exam_id', examId)
        .eq('subject_id', subjectId)
        .in('student_id', students.map(s => s.id));

      if (marksError) throw marksError;

      // Merge student data with existing marks
      const studentsWithMarks = students.map(student => {
        const mark = existingMarks.find(m => m.student_id === student.id);
        return {
          ...student,
          marks_obtained: mark?.marks_obtained || 0,
          grade: mark?.grade || '',
          remarks: mark?.remarks || '',
          id: mark?.id || null
        };
      });

      return { success: true, data: studentsWithMarks };
    } catch (error) {
      console.error('Error in getStudentsForMarks:', error);
      return { success: false, error: error.message };
    }
  }
}

  // Exam Management
  static async getExams(filters = {}) {
    try {
      let query = supabase
        .from('exams')
        .select(`
          *,
          subject:subject_id (id, name, code, department_id),
          created_by_user:created_by (id, first_name, last_name)
        `)
        .order('start_date', { ascending: false });

      // Apply subject filter
      if (filters.subject_id) {
        query = query.eq('subject_id', filters.subject_id);
      }

      // Apply status filter
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getExams:', error);
      return { success: false, error: error.message };
    }
  }

  static async getExam(id) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          subject:subject_id (id, name, code, department_id),
          created_by_user:created_by (id, first_name, last_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in getExam:', error);
      return { success: false, error: error.message };
    }
  }

  static async createExam(examData) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([examData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in createExam:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateExam(id, updates) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateExam:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteExam(id) {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in deleteExam:', error);
      return { success: false, error: error.message };
    }
  }

  // Exam Results
  static async getExamResults(filters = {}) {
    try {
      let query = supabase
        .from('exam_results')
        .select(`
          *,
          exam:exam_id (*, subject:subject_id (id, name, code)),
          student:student_id (id, first_name, last_name, email)
        `);

      if (filters.exam_id) {
        query = query.eq('exam_id', filters.exam_id);
      }

      if (filters.student_id) {
        query = query.eq('student_id', filters.student_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getExamResults:', error);
      return { success: false, error: error.message };
    }
  }

  static async upsertExamResult(resultData) {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .upsert([resultData], { onConflict: 'exam_id,student_id' })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in upsertExamResult:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all subjects for dropdowns
  static async getAllSubjects() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;