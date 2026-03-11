const db = require('../config/database');
const { format } = require('date-fns');

// Helper function to execute database queries
const query = async (sql, params = []) => {
  try {
    const [results] = await db.promise().execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database operation failed');
  }
};

// Get admission analytics
exports.getAdmissionAnalytics = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      statuses = '',
      courses = '',
      departments = '',
      sources = '',
      school_types = '',
      genders = ''
    } = req.query;

    // Build the WHERE clause based on filters
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (start_date && end_date) {
      whereClause += ' AND admission_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    if (statuses) {
      const statusList = statuses.split(',').map(s => s.trim());
      whereClause += ` AND status IN (${statusList.map(() => '?').join(',')})`;
      params.push(...statusList);
    }

    if (courses) {
      const courseList = courses.split(',').map(c => c.trim());
      whereClause += ` AND course_id IN (${courseList.map(() => '?').join(',')})`;
      params.push(...courseList);
    }

    if (departments) {
      const deptList = departments.split(',').map(d => d.trim());
      whereClause += ` AND department IN (${deptList.map(() => '?').join(',')})`;
      params.push(...deptList);
    }

    if (sources) {
      const sourceList = sources.split(',').map(s => s.trim());
      whereClause += ` AND source IN (${sourceList.map(() => '?').join(',')})`;
      params.push(...sourceList);
    }

    if (school_types) {
      const schoolTypeList = school_types.split(',').map(t => t.trim());
      whereClause += ` AND school_type IN (${schoolTypeList.map(() => '?').join(',')})`;
      params.push(...schoolTypeList);
    }

    if (genders) {
      const genderList = genders.split(',').map(g => g.trim());
      whereClause += ` AND gender IN (${genderList.map(() => '?').join(',')})`;
      params.push(...genderList);
    }

    // Get total applications
    const [totalApplications] = await query(
      `SELECT COUNT(*) as count FROM admission_applications ${whereClause}`,
      params
    );

    // Get applications by status
    const [applicationsByStatus] = await query(
      `SELECT status, COUNT(*) as count 
       FROM admission_applications 
       ${whereClause} 
       GROUP BY status`,
      params
    );

    // Get applications by department
    const [applicationsByDepartment] = await query(
      `SELECT c.department, COUNT(*) as count 
       FROM admission_applications aa
       LEFT JOIN courses c ON aa.course_id = c.id
       ${whereClause.replace(/department/g, 'c.department')}
       GROUP BY c.department`,
      params
    );

    // Get applications by source
    const [applicationsBySource] = await query(
      `SELECT source, COUNT(*) as count 
       FROM admission_applications 
       ${whereClause} 
       GROUP BY source`,
      params
    );

    // Get applications by school type
    const [applicationsBySchoolType] = await query(
      `SELECT school_type, COUNT(*) as count 
       FROM admission_applications 
       ${whereClause} 
       GROUP BY school_type`,
      params
    );

    // Get applications by gender
    const [applicationsByGender] = await query(
      `SELECT gender, COUNT(*) as count 
       FROM admission_applications 
       ${whereClause} 
       GROUP BY gender`,
      params
    );

    // Get monthly trends
    const [monthlyTrends] = await query(
      `SELECT 
          DATE_FORMAT(submitted_at, '%Y-%m') as month,
          COUNT(*) as count 
       FROM admission_applications 
       ${whereClause} 
       GROUP BY DATE_FORMAT(submitted_at, '%Y-%m')
       ORDER BY month`,
      params
    );

    res.json({
      success: true,
      data: {
        totalApplications: totalApplications[0].count,
        applicationsByStatus,
        applicationsByDepartment,
        applicationsBySource,
        admissionTrends,
        genderDistribution,
        filters: {
          start_date,
          end_date,
          statuses: statuses ? statuses.split(',').map(s => s.trim()) : [],
          courses: courses ? courses.split(',').map(c => c.trim()) : [],
          departments: departments ? departments.split(',').map(d => d.trim()) : [],
          sources: sources ? sources.split(',').map(s => s.trim()) : [],
          school_types: school_types ? school_types.split(',').map(t => t.trim()) : [],
          genders: genders ? genders.split(',').map(g => g.trim()) : []
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getAdmissionAnalytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admission analytics',
      details: error.message
    });
  }
};

// Get marks analytics
exports.getMarksAnalytics = async (req, res) => {
  try {
    const {
      student_id,
      subject_id,
      exam_type,
      semester,
      start_date,
      end_date,
      min_marks
    } = req.query;

    // Build the WHERE clause based on filters
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (student_id) {
      whereClause += ' AND er.student_id = ?';
      params.push(student_id);
    }

    if (subject_id) {
      whereClause += ' AND er.subject_id = ?';
      params.push(subject_id);
    }

    if (exam_type) {
      whereClause += ' AND e.exam_type = ?';
      params.push(exam_type);
    }

    if (semester) {
      whereClause += ' AND s.semester = ?';
      params.push(semester);
    }

    if (start_date && end_date) {
      whereClause += ' AND e.exam_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    if (min_marks) {
      whereClause += ' AND er.marks_obtained >= ?';
      params.push(parseInt(min_marks));
    }

    // Get student performance data
    const studentPerformance = await query(`
      SELECT 
        s.id as student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as student_name,
        AVG(er.marks_obtained) as avg_marks,
        COUNT(DISTINCT er.subject_id) as subjects_count
      FROM exam_results er
      JOIN students s ON er.student_id = s.id
      JOIN subjects sub ON er.subject_id = sub.id
      JOIN exams e ON er.exam_id = e.id
      ${whereClause}
      GROUP BY s.id, s.roll_number, s.first_name, s.middle_name, s.last_name
      ORDER BY avg_marks DESC
    `, params);

    // Get subject performance data
    const subjectPerformance = await query(`
      SELECT 
        sub.id as subject_id,
        sub.name as subject_name,
        sub.code as subject_code,
        sub.semester,
        AVG(er.marks_obtained) as avg_marks,
        MAX(er.marks_obtained) as highest_marks,
        MIN(er.marks_obtained) as lowest_marks,
        COUNT(DISTINCT er.student_id) as student_count,
        ROUND(SUM(CASE WHEN er.status = 'pass' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pass_rate
      FROM exam_results er
      JOIN subjects sub ON er.subject_id = sub.id
      JOIN exams e ON er.exam_id = e.id
      ${whereClause}
      GROUP BY sub.id, sub.name, sub.code, sub.semester
      ORDER BY sub.semester, sub.name
    `, params);

    // Get exam trends
    const examTrends = await query(`
      SELECT 
        DATE_FORMAT(e.exam_date, '%Y-%m') as month,
        AVG(er.marks_obtained) as avg_marks,
        COUNT(DISTINCT er.student_id) as student_count
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      ${whereClause}
      GROUP BY DATE_FORMAT(e.exam_date, '%Y-%m')
      ORDER BY month
    `, params);

    // Get grade distribution
    const gradeDistribution = await query(`
      SELECT 
        er.grade,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM exam_results er2 JOIN exams e2 ON er2.exam_id = e2.id ${whereClause}), 2) as percentage
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      ${whereClause}
      GROUP BY er.grade
      ORDER BY FIELD(er.grade, 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F')
    `, params);

    // Get at-risk students (failing in 2 or more subjects)
    const atRiskStudents = await query(`
      SELECT 
        s.id as student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as student_name,
        COUNT(CASE WHEN er.status = 'fail' THEN 1 END) as failed_subjects,
        GROUP_CONCAT(DISTINCT sub.name SEPARATOR ', ') as failed_subject_names
      FROM exam_results er
      JOIN students s ON er.student_id = s.id
      JOIN subjects sub ON er.subject_id = sub.id
      JOIN exams e ON er.exam_id = e.id
      WHERE er.status = 'fail'
      ${student_id ? 'AND er.student_id = ?' : ''}
      ${subject_id ? 'AND er.subject_id = ?' : ''}
      ${start_date && end_date ? 'AND e.exam_date BETWEEN ? AND ?' : ''}
      GROUP BY s.id, s.roll_number, s.first_name, s.middle_name, s.last_name
      HAVING COUNT(CASE WHEN er.status = 'fail' THEN 1 END) >= 2
      ORDER BY failed_subjects DESC
    `, params.filter((_, i) => 
      (student_id && i === 0) || 
      (subject_id && i === (student_id ? 1 : 0)) ||
      (start_date && end_date && i >= (student_id ? (subject_id ? 2 : 1) : 0))
    ));

    res.json({
      success: true,
      data: {
        studentPerformance,
        subjectPerformance,
        examTrends,
        gradeDistribution,
        atRiskStudents: {
          count: atRiskStudents.length,
          students: atRiskStudents
        }
      }
    });

  } catch (error) {
    console.error('Error in getMarksAnalytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch marks analytics',
      details: error.message
    });
  }
};

// Get performance analytics
exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const { subject_id, student_id, start_date, end_date } = req.query;
    
    // Build WHERE clause for filters
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (subject_id) {
      whereClause += ' AND er.subject_id = ?';
      params.push(subject_id);
    }
    
    if (student_id) {
      whereClause += ' AND er.student_id = ?';
      params.push(student_id);
    }
    
    if (start_date && end_date) {
      whereClause += ' AND e.exam_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    // Get overall performance metrics
    const [overallMetrics] = await query(`
      SELECT 
        COUNT(DISTINCT er.student_id) as total_students,
        COUNT(DISTINCT er.subject_id) as total_subjects,
        COUNT(DISTINCT e.id) as total_exams,
        AVG(er.marks_obtained) as average_score,
        COUNT(CASE WHEN er.grade IN ('A', 'B', 'C', 'D') THEN 1 END) * 100.0 / COUNT(*) as pass_rate,
        COUNT(CASE WHEN er.grade = 'F' THEN 1 END) as failed_count,
        MAX(er.marks_obtained) as highest_score,
        MIN(er.marks_obtained) as lowest_score
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      ${whereClause}
    `, params);

    // Get subject-wise performance
    const [subjectPerformance] = await query(`
      SELECT 
        s.id as subject_id,
        s.name as subject_name,
        COUNT(DISTINCT er.student_id) as student_count,
        AVG(er.marks_obtained) as average_score,
        COUNT(CASE WHEN er.grade IN ('A', 'B', 'C', 'D') THEN 1 END) * 100.0 / COUNT(*) as pass_rate,
        MAX(er.marks_obtained) as highest_score,
        MIN(er.marks_obtained) as lowest_score
      FROM exam_results er
      JOIN subjects s ON er.subject_id = s.id
      JOIN exams e ON er.exam_id = e.id
      ${whereClause}
      GROUP BY s.id, s.name
      ORDER BY average_score DESC
    `, params);

    // Get performance trends over time
    const [performanceTrends] = await query(`
      SELECT 
        DATE_FORMAT(e.exam_date, '%Y-%m') as month,
        AVG(er.marks_obtained) as average_score,
        COUNT(DISTINCT er.student_id) as student_count
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      WHERE e.exam_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(e.exam_date, '%Y-%m')
      ORDER BY month
    `);

    // Get top performing students
    const [topPerformers] = await query(`
      SELECT 
        s.id as student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.roll_number,
        AVG(er.marks_obtained) as average_score,
        COUNT(DISTINCT er.subject_id) as subjects_count
      FROM exam_results er
      JOIN students s ON er.student_id = s.id
      JOIN exams e ON er.exam_id = e.id
      ${whereClause}
      GROUP BY s.id, s.first_name, s.last_name, s.roll_number
      HAVING COUNT(DISTINCT er.subject_id) >= 3
      ORDER BY average_score DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        summary: overallMetrics[0],
        subjectPerformance,
        performanceTrends,
        topPerformers,
        filters: {
          subject_id,
          student_id,
          start_date,
          end_date
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getPerformanceAnalytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get resource utilization analytics
exports.getUtilizationAnalytics = async (req, res) => {
  try {
    const { start_date, end_date, resource_type = '' } = req.query;
    
    // Build the WHERE clause based on filters
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (start_date && end_date) {
      whereClause += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    if (resource_type) {
      const types = resource_type.split(',').map(t => t.trim());
      whereClause += ` AND resource_type IN (${types.map(() => '?').join(',')})`;
      params.push(...types);
    }

    // Get resource utilization metrics
    const [utilizationData] = await query(`
      SELECT 
        resource_id,
        resource_name,
        resource_type,
        date,
        utilization_percentage,
        capacity,
        ROUND((utilization_percentage / 100) * capacity) as used_capacity,
        capacity - ROUND((utilization_percentage / 100) * capacity) as available_capacity
      FROM resource_utilization
      ${whereClause}
      ORDER BY date DESC, resource_type, resource_name
    `, params);

    // Calculate summary statistics
    const summary = {
      totalResources: 0,
      averageUtilization: 0,
      peakUtilization: 0,
      byResourceType: {}
    };

    if (utilizationData && utilizationData.length > 0) {
      // Calculate total resources (unique resource_ids)
      const uniqueResources = new Set(utilizationData.map(r => r.resource_id));
      summary.totalResources = uniqueResources.size;

      // Calculate average and peak utilization
      const totalUtilization = utilizationData.reduce((sum, r) => sum + (parseFloat(r.utilization_percentage) || 0), 0);
      summary.averageUtilization = parseFloat((totalUtilization / utilizationData.length).toFixed(2));
      summary.peakUtilization = Math.max(...utilizationData.map(r => parseFloat(r.utilization_percentage) || 0));

      // Group by resource type
      utilizationData.forEach(resource => {
        if (!summary.byResourceType[resource.resource_type]) {
          summary.byResourceType[resource.resource_type] = {
            count: 0,
            averageUtilization: 0,
            peakUtilization: 0
          };
        }
        summary.byResourceType[resource.resource_type].count++;
      });

      // Calculate averages per resource type
      Object.keys(summary.byResourceType).forEach(type => {
        const typeResources = utilizationData.filter(r => r.resource_type === type);
        const totalTypeUtilization = typeResources.reduce(
          (sum, r) => sum + (parseFloat(r.utilization_percentage) || 0), 0
        );
        summary.byResourceType[type].averageUtilization = parseFloat(
          (totalTypeUtilization / typeResources.length).toFixed(2)
        );
        summary.byResourceType[type].peakUtilization = Math.max(
          ...typeResources.map(r => parseFloat(r.utilization_percentage) || 0)
        );
      });
    }

    res.json({
      success: true,
      data: {
        utilizationData,
        summary,
        filters: {
          start_date,
          end_date,
          resource_type: resource_type ? resource_type.split(',').map(t => t.trim()) : []
        },
        lastUpdated: new Date().toISOString()
      }
    });

    // Get utilization metrics summary
    const [utilizationMetrics] = await query(`
      SELECT 
        resource_type,
        COUNT(*) as total_resources,
        AVG(utilization_rate) as avg_utilization_rate,
        MAX(utilization_rate) as max_utilization_rate,
        MIN(utilization_rate) as min_utilization_rate
      FROM resource_utilization
      GROUP BY resource_type
    `);

    res.json({
      success: true,
      data: {
        utilizationData,
        summary: utilizationMetrics
      }
    });
  } catch (error) {
    console.error('Error in getUtilizationAnalytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch utilization analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get placement reports data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPlacementReports = async (req, res) => {
  try {
    const [placements] = await query(`
      SELECT 
        department,
        COUNT(*) as total_placements,
        AVG(salary) as avg_salary,
        MAX(salary) as max_salary,
        MIN(salary) as min_salary
      FROM placements
      GROUP BY department
      ORDER BY total_placements DESC
    `);

    res.json({
      success: true,
      data: placements
    });
  } catch (error) {
    console.error('Error in getPlacementReports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch placement reports',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get exam reports data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getExamReports = async (req, res) => {
  try {
    const [examStats] = await query(`
      SELECT 
        exam_type,
        COUNT(*) as total_students,
        AVG(score) as avg_score,
        MAX(score) as max_score,
        MIN(score) as min_score,
        SUM(CASE WHEN score >= 40 THEN 1 ELSE 0 END) / COUNT(*) * 100 as pass_percentage
      FROM exam_results
      GROUP BY exam_type
      ORDER BY exam_type
    `);

    res.json({
      success: true,
      data: examStats
    });
  } catch (error) {
    console.error('Error in getExamReports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exam reports',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get fee reports data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getFeeReports = async (req, res) => {
  try {
    const [feeStats] = await query(`
      SELECT 
        fee_type,
        COUNT(*) as total_transactions,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
      FROM fee_transactions
      GROUP BY fee_type
      ORDER BY total_amount DESC
    `);

    res.json({
      success: true,
      data: feeStats
    });
  } catch (error) {
    console.error('Error in getFeeReports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fee reports',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
