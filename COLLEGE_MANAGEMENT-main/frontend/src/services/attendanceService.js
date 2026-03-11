import { supabase } from './supabaseClient';

/**
 * Fetches attendance records for the logged-in student
 * @param {string} studentId - The ID of the student
 * @param {Object} [options] - Optional parameters
 * @param {string} [options.startDate] - Start date in YYYY-MM-DD format
 * @param {string} [options.endDate] - End date in YYYY-MM-DD format
 * @param {string} [options.status] - Filter by status (present/absent)
 * @param {string} [options.subjectId] - Filter by subject ID
 * @returns {Promise<Array>} - Array of attendance records
 */
export const getStudentAttendance = async (studentId, { startDate, endDate, status, subjectId } = {}) => {
  try {
    // First, fetch the attendance records from student_attendance
    let query = supabase
      .from('student_attendance')
      .select('*')
      .eq('student_id', studentId);

    // Apply filters
    if (status) query = query.eq('status', status.toLowerCase());
    if (subjectId) query = query.eq('subject_id', subjectId);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data: attendanceData, error } = await query;

    if (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }

    if (!attendanceData || attendanceData.length === 0) {
      console.log('No attendance records found for student:', studentId);
      return [];
    }

    // Get unique subject IDs, filtering out null/undefined values
    const subjectIds = [...new Set(attendanceData
      .map(record => record.subject_id)
      .filter(id => id !== null && id !== undefined)
    )];
    
    if (subjectIds.length === 0) {
      console.warn('No valid subject IDs found in attendance records');
      return [];
    }

    try {
      // Fetch subjects for the attendance records
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .in('id', subjectIds);

      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError);
        throw subjectsError;
      }

      // Create a map of subject IDs to subject data for quick lookup
      const subjectsMap = new Map();
      if (subjectsData) {
        subjectsData.forEach(subject => {
          subjectsMap.set(subject.id, subject);
        });
      }

      // Transform the attendance data to match the expected format
      return attendanceData.map(record => {
        const subject = subjectsMap.get(record.subject_id) || {};
        
        return {
          id: record.id,
          date: record.date || new Date().toISOString().split('T')[0],
          status: record.status || 'present',
          subject: subject.name || 'Unknown Subject',
          subject_id: record.subject_id,
          subjectCode: subject.code || '',
          facultyName: record.faculty_name || 'Unknown Faculty',
          notes: record.notes || '',
          classTime: record.class_time || 'N/A'
        };
      });
    } catch (error) {
      console.error('Error in getStudentAttendance:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in getStudentAttendance:', error);
    throw error;
  }
};

/**
 * Gets attendance statistics for a student
 * @param {string} studentId - The ID of the student
 * @returns {Promise<Object>} - Object containing attendance statistics
 */
export const getAttendanceStatistics = async (studentId) => {
  try {
    // Get all attendance records for the student
    const { data, error } = await supabase
      .from('attendance')
      .select('status, subject_id')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching attendance statistics:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        totalClasses: 0,
        presentCount: 0,
        absentCount: 0,
        attendancePercentage: 0,
        bySubject: {}
      };
    }

    // Calculate statistics
    const bySubject = {};
    let presentCount = 0;
    let absentCount = 0;

    data.forEach(record => {
      const subjectId = record.subject_id;
      
      if (!bySubject[subjectId]) {
        bySubject[subjectId] = {
          present: 0,
          absent: 0,
          total: 0,
          percentage: 0
        };
      }

      bySubject[subjectId].total++;
      if (record.status === 'present') {
        bySubject[subjectId].present++;
        presentCount++;
      } else {
        bySubject[subjectId].absent++;
        absentCount++;
      }

      // Calculate percentage for this subject
      bySubject[subjectId].percentage = Math.round(
        (bySubject[subjectId].present / bySubject[subjectId].total) * 100
      );
    });

    // Get subject names for the bySubject object
    const subjectIds = Object.keys(bySubject);
    if (subjectIds.length > 0) {
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, code')
        .in('id', subjectIds);

      subjects?.forEach(subject => {
        if (bySubject[subject.id]) {
          bySubject[subject.id].name = subject.name;
          bySubject[subject.id].code = subject.code;
        }
      });
    }

    const totalClasses = presentCount + absentCount;
    const attendancePercentage = totalClasses > 0 
      ? Math.round((presentCount / totalClasses) * 100) 
      : 0;

    return {
      totalClasses,
      presentCount,
      absentCount,
      attendancePercentage,
      bySubject
    };
  } catch (error) {
    console.error('Error in getAttendanceStatistics:', error);
    throw error;
  }
};
