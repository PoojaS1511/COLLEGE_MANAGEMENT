import { supabase } from '../lib/supabase';
import { TABLES } from '../lib/supabase';

export const examService = {
  // Get all exams with related data
  getAllExams: async () => {
    try {
      // First, get all exams with basic info
      const { data: exams, error: examsError } = await supabase
        .from(TABLES.EXAMS)
        .select('*')
        .order('start_date', { ascending: false });
      
      if (examsError) throw examsError;
      if (!exams || exams.length === 0) return [];

      // Initialize empty arrays for related data
      let subjects = [];
      let creators = [];

      // Get all related subjects (only if there are subject_ids)
      const subjectIds = [...new Set(exams.map(exam => exam.subject_id).filter(Boolean))];
      if (subjectIds.length > 0) {
        const { data: subjectsData, error: subjectsError } = await supabase
          .from(TABLES.SUBJECTS)
          .select('*, department:department_id(*)')
          .in('id', subjectIds);
        
        if (subjectsError) throw subjectsError;
        subjects = subjectsData || [];
      }
      
      // Get all creators (only if there are creator_ids)
      const creatorIds = [...new Set(exams.map(exam => exam.created_by).filter(Boolean))];
      if (creatorIds.length > 0) {
        const { data: creatorsData, error: creatorsError } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .in('id', creatorIds);
        
        if (creatorsError) throw creatorsError;
        creators = creatorsData || [];
      }

      // Create maps for quick lookup
      const subjectsMap = new Map(subjects.map(subj => [subj.id, subj]));
      const creatorsMap = new Map(creators.map(creator => [creator.id, creator]));
      
      // Combine the data
      const transformedData = exams.map(exam => ({
        ...exam,
        subject: exam.subject_id ? subjectsMap.get(exam.subject_id) : null,
        created_by: exam.created_by ? creatorsMap.get(exam.created_by) : {
          id: exam.created_by,
          full_name: 'Unknown User',
          email: ''
        }
      }));
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },

  // Subscribe to exams changes
  subscribeToExams: (callback) => {
    const subscription = supabase
      .channel('exams_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.EXAMS 
        }, 
        (payload) => {
          console.log('Exams change received!', payload);
          callback(payload);
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  },

  // Get a single exam by ID with related data
  getExamById: async (examId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.EXAMS)
        .select(`
          *,
          subject:subject_id (*, department:department_id (*)),
          created_by:created_by (*)
        `)
        .eq('id', examId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching exam ${examId}:`, error);
      throw error;
    }
  },

  // Create a new exam
  createExam: async (examData) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from(TABLES.EXAMS)
        .insert([{
          ...examData,
          created_by: user.id,
          status: 'upcoming'
        }])
        .select();
      
      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  },

  // Update an existing exam
  updateExam: async (examId, examData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.EXAMS)
        .update({
          ...examData,
          updated_at: new Date().toISOString()
        })
        .eq('id', examId)
        .select();
      
      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error(`Error updating exam ${examId}:`, error);
      throw error;
    }
  },

  // Delete an exam
  deleteExam: async (examId) => {
    try {
      const { error } = await supabase
        .from(TABLES.EXAMS)
        .delete()
        .eq('id', examId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting exam ${examId}:`, error);
      throw error;
    }
  },

  // Get exam status options
  getStatusOptions: () => [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ],

  // Get all subjects for the form
  getAllSubjects: async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUBJECTS)
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

  // Get performance analysis data
  getPerformanceAnalysis: async () => {
    try {
      // Overall Performance Summary
      const { data: summary, error: summaryError } = await supabase.rpc('get_performance_summary');
      if (summaryError) throw summaryError;

      // Student-wise Performance
      const { data: studentPerformance, error: studentPerfError } = await supabase
        .rpc('get_student_performance')
        .order('average_marks', { ascending: false });
      if (studentPerfError) throw studentPerfError;

      // Semester-wise Performance
      const { data: semesterPerformance, error: semesterError } = await supabase
        .rpc('get_semester_performance')
        .order('semester');
      if (semesterError) throw semesterError;

      // Exam Type Analysis
      const { data: examTypeAnalysis, error: examTypeError } = await supabase
        .rpc('get_exam_type_analysis')
        .order('average_marks', { ascending: false });
      if (examTypeError) throw examTypeError;

      // Grade Distribution
      const { data: gradeDistribution, error: gradeError } = await supabase
        .rpc('get_grade_distribution')
        .order('grade');
      if (gradeError) throw gradeError;

      // Performance Trends Over Time
      const { data: performanceTrends, error: trendError } = await supabase
        .rpc('get_performance_trends')
        .order('month');
      if (trendError) throw trendError;

      // Top Performing Students
      const { data: topStudents, error: topStudentsError } = await supabase
        .rpc('get_top_performing_students')
        .order('rank');
      if (topStudentsError) throw topStudentsError;

      // Students Needing Improvement
      const { data: improvementNeeded, error: improvementError } = await supabase
        .rpc('get_students_needing_improvement')
        .order('average_marks');
      if (improvementError) throw improvementError;

      // Subject-wise Performance
      const { data: subjectPerformance, error: subjectError } = await supabase
        .rpc('get_subject_performance')
        .order('average_marks', { ascending: false });
      if (subjectError) throw subjectError;

      // Exam Difficulty Analysis
      const { data: examDifficulty, error: difficultyError } = await supabase
        .rpc('get_exam_difficulty_analysis')
        .order('avg_percentage');
      if (difficultyError) throw difficultyError;

      return {
        summary: summary?.[0] || {},
        studentPerformance: studentPerformance || [],
        semesterPerformance: semesterPerformance || [],
        examTypeAnalysis: examTypeAnalysis || [],
        gradeDistribution: gradeDistribution || [],
        performanceTrends: performanceTrends || [],
        topStudents: topStudents || [],
        improvementNeeded: improvementNeeded || [],
        subjectPerformance: subjectPerformance || [],
        examDifficulty: examDifficulty || []
      };
    } catch (error) {
      console.error('Error fetching performance analysis:', error);
      throw error;
    }
  },

  // Get upcoming exams for a student
  getUpcomingExams: async (studentId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from(TABLES.EXAMS)
        .select(`
          *,
          subject:subject_id (*),
          result:exam_results!left(
            *
          )
        `)
        .gte('start_date', today)
        .order('start_date');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming exams:', error);
      throw error;
    }
  },

  // Submit exam results
  submitExamResults: async (examId, studentId, marks) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.EXAM_RESULTS)
        .upsert({
          exam_id: examId,
          student_id: studentId,
          marks_obtained: marks,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Error submitting exam results:', error);
      throw error;
    }
  }
};
