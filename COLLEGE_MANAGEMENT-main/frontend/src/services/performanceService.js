import { supabase } from './supabaseClient';

export const getAvgMarks = async () => {
  const { data, error } = await supabase
    .from('view_avg_marks_per_student')
    .select('*');
  if (error) throw error;
  return data || [];
};

export const getSubjectAvgMarks = async () => {
  const { data, error } = await supabase
    .from('view_subject_avg_marks')
    .select('*');
  if (error) throw error;
  return data || [];
};

export const getExamAvgMarks = async () => {
  const { data, error } = await supabase
    .from('view_exam_avg_marks')
    .select('*');
  if (error) throw error;
  return data || [];
};

export const getTop5Students = async () => {
  const { data, error } = await supabase
    .from('view_top5_students')
    .select('*')
    .limit(5);
  if (error) throw error;
  return data || [];
};

export const getStudentTrends = async () => {
  const { data, error } = await supabase
    .from('view_student_trends')
    .select('*')
    .order('exam_date', { ascending: true });
  if (error) throw error;
  return data || [];
};

// Fallback mock data in case of errors
export const mockPerformanceData = {
  summary: {
    totalStudents: 0,
    totalSubjects: 0,
    overallAvg: 0,
    topPerformer: null
  },
  subjectPerformance: [],
  performanceTrends: [],
  topPerformers: [],
  avgMarks: [],
  examMarks: [],
  studentTrends: []
};

// Helper function to format data for charts
export const formatChartData = (data, xField, yField) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => ({
    name: item[xField],
    value: parseFloat(item[yField]) || 0
  }));
};
