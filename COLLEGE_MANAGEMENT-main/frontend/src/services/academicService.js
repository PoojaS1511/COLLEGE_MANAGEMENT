import { supabase } from '../lib/supabase';

class AcademicService {
  // ====================
  // 📘 COURSES
  // ====================
  static async getCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { success: false, error: error.message };
    }
  }

  static async createCourse(courseData) {
    try {
      // Remove fee_per_semester from the course data
      const { fee_per_semester, ...cleanCourseData } = courseData;
      
      const { data, error } = await supabase
        .from('courses')
        .insert([cleanCourseData])
        .select();

      if (error) throw error;
      return { success: true, data: data?.[0] };
    } catch (error) {
      console.error('Error creating course:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================
  // 📚 SUBJECTS
  // ====================
  static async getSubjects(filters = {}) {
    try {
      // Explicit relationship reference to avoid ambiguity
      let query = supabase
        .from('subjects')
        .select(`
          id,
          name,
          code,
          semester,
          credits,
          subject_type,
          is_elective,
          description,
          course_id,
          subject_uuid,
          created_at,
          courses!fk_subject_course(
            id,
            name,
            code
          )
        `)
        .order('name');

      // Apply filters safely
      if (filters.course_id) query = query.eq('course_id', filters.course_id);
      if (filters.semester) query = query.eq('semester', filters.semester);

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return { success: false, error: error.message };
    }
  }

  static async getSubject(id) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          id,
          name,
          code,
          semester,
          credits,
          subject_type,
          is_elective,
          description,
          course_id,
          subject_uuid,
          created_at,
          courses!fk_subject_course(
            id,
            name,
            code
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching subject:', error);
      return { success: false, error: error.message };
    }
  }

  static async createSubject(subjectData) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([
          {
            ...subjectData,
            credits: subjectData.credits || 3,
            subject_type: subjectData.subject_type || 'theory',
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data: data?.[0] };
    } catch (error) {
      console.error('Error creating subject:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateSubject(id, updates) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { success: true, data: data?.[0] };
    } catch (error) {
      console.error('Error updating subject:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteSubject(id) {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting subject:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================
  // 🧾 EXAMS
  // ====================
  static async getExams(filters = {}) {
    try {
      let query = supabase
        .from('exams')
        .select(`
          id,
          name,
          exam_type,
          total_marks,
          start_date,
          end_date,
          is_published,
          course_id,
          semester,
          courses!fk_exam_course(id, name, code)
        `)
        .order('start_date', { ascending: false });

      if (filters.course_id) query = query.eq('course_id', filters.course_id);
      if (filters.semester) query = query.eq('semester', filters.semester);
      if (filters.exam_type) query = query.eq('exam_type', filters.exam_type);
      if (filters.academic_year)
        query = query.eq('academic_year', filters.academic_year);

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching exams:', error);
      return { success: false, error: error.message };
    }
  }

  static async createExam(examData) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([
          {
            ...examData,
            total_marks: examData.total_marks || 100,
            is_published: examData.is_published || false,
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data: data?.[0] };
    } catch (error) {
      console.error('Error creating exam:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AcademicService;
