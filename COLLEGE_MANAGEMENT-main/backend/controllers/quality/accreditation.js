const { supabase } = require('../../supabase_client');

// Helper function to calculate readiness score
async function calculateReadinessScore() {
  try {
    // Get faculty performance data
    const { data: faculty } = await supabase
      .from('quality_facultyperformance')
      .select('performance_rating, department, research_papers');

    // Get audit compliance data
    const { data: audits } = await supabase
      .from('quality_audits')
      .select('compliance_score, department');

    // Get policy compliance data
    const { data: policies } = await supabase
      .from('quality_policy')
      .select('compliance_status');

    // Calculate criteria scores
    const criteriaScores = {
      'Curriculum': calculateFacultyScore(faculty),
      'Teaching-Learning': calculateFacultyScore(faculty) * 0.9,
      'Research': calculateResearchScore(faculty),
      'Infrastructure': 85, // Mock score
      'Student Support': 80, // Mock score (grievances table missing)
      'Governance': calculatePolicyScore(policies),
      'Innovative Practices': 80, // Mock score
    };

    // Calculate department scores
    const departmentScores = {};
    const departments = [...new Set(faculty?.map(f => f.department) || [])];
    
    departments.forEach(dept => {
      const deptFaculty = faculty?.filter(f => f.department === dept) || [];
      const deptAudits = audits?.filter(a => a.department === dept) || [];
      
      departmentScores[dept] = Math.round(
        (calculateFacultyScore(deptFaculty) + 
         calculateAuditScore(deptAudits)) / 2
      );
    });

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(criteriaScores).reduce((sum, score) => sum + score, 0) / 
      Object.keys(criteriaScores).length
    );

    return {
      overall_score: overallScore,
      criteria_scores: criteriaScores,
      department_scores: departmentScores
    };
  } catch (error) {
    console.error('Error calculating readiness score:', error);
    return {
      overall_score: 0,
      criteria_scores: {},
      department_scores: {}
    };
  }
}

// Helper functions for score calculations
function calculateFacultyScore(faculty) {
  if (!faculty || faculty.length === 0) return 0;
  const total = faculty.reduce((sum, f) => sum + (f.performance_rating || 0), 0);
  return Math.round(total / faculty.length);
}

function calculateResearchScore(faculty) {
  if (!faculty || faculty.length === 0) return 0;
  const total = faculty.reduce((sum, f) => sum + (f.research_papers || 0), 0);
  return Math.min(100, Math.round(total / faculty.length * 10));
}

function calculatePolicyScore(policies) {
  if (!policies || policies.length === 0) return 0;
  const compliant = policies.filter(p => p.compliance_status === 'Compliant').length;
  return Math.round((compliant / policies.length) * 100);
}

function calculateAuditScore(audits) {
  if (!audits || audits.length === 0) return 0;
  const total = audits.reduce((sum, a) => sum + (a.compliance_score || 0), 0);
  return Math.round(total / audits.length);
}

function getReadinessLevel(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  return 'poor';
}

function generateRecommendations(readinessScore) {
  const recommendations = [];
  
  Object.entries(readinessScore.criteria_scores).forEach(([criteria, score]) => {
    if (score < 75) {
      recommendations.push(`Improve ${criteria} performance (Current: ${score}%)`);
    }
  });
  
  if (readinessScore.overall_score < 80) {
    recommendations.push('Focus on overall institutional development');
  }
  
  return recommendations;
}

function identifyStrengths(readinessScore) {
  const strengths = [];
  
  Object.entries(readinessScore.criteria_scores).forEach(([criteria, score]) => {
    if (score >= 85) {
      strengths.push(`${criteria} (${score}%)`);
    }
  });
  
  return strengths;
}

function identifyWeaknesses(readinessScore) {
  const weaknesses = [];
  
  Object.entries(readinessScore.criteria_scores).forEach(([criteria, score]) => {
    if (score < 70) {
      weaknesses.push(`${criteria} (${score}%)`);
    }
  });
  
  return weaknesses;
}

// SUB-MODULE 6: ACCREDITATION READINESS REPORTS
exports.getReadinessScore = async (req, res) => {
  try {
    const readinessScore = await calculateReadinessScore();
    
    res.json({
      success: true,
      data: readinessScore
    });
  } catch (error) {
    console.error('Error calculating readiness score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate readiness score'
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, accreditation_body, status } = req.query;
    
    let query = supabase
      .from('quality_accreditation')
      .select('*', { count: 'exact' })
      .order('report_date', { ascending: false });

    if (accreditation_body) query = query.eq('report_type', accreditation_body);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    const mappedData = data ? data.map(report => ({
      id: report.report_id,
      accreditation_body: report.report_type,
      generated_date: report.report_date,
      overall_score: report.score,
      status: 'completed',
      recommendations: [report.recommendations],
      department: report.department
    })) : [];

    res.json({
      success: true,
      data: mappedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching accreditation reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accreditation reports'
    });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { accreditation_body, academic_year, department } = req.body;
    
    // Calculate readiness score and generate report
    const readinessScore = await calculateReadinessScore();
    
    const reportData = {
      report_type: accreditation_body,
      department: department || 'Institutional',
      report_date: new Date().toISOString().split('T')[0],
      score: readinessScore.overall_score,
      recommendations: generateRecommendations(readinessScore).join(', ')
    };

    const { data, error } = await supabase
      .from('quality_accreditation')
      .insert([reportData])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: {
        id: data[0].report_id,
        accreditation_body: data[0].report_type,
        generated_date: data[0].report_date,
        overall_score: data[0].score,
        recommendations: [data[0].recommendations],
        department: data[0].department
      },
      message: 'Accreditation report generated successfully'
    });
  } catch (error) {
    console.error('Error generating accreditation report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate accreditation report'
    });
  }
};

exports.getAccreditationAnalytics = async (req, res) => {
  try {
    // Get historical reports for trend analysis
    const { data: reports } = await supabase
      .from('quality_accreditation')
      .select('*')
      .order('report_date', { ascending: true });

    // Score trends
    const scoreTrends = reports ? 
      reports.map(report => ({
        date: report.report_date,
        score: report.score,
        body: report.report_type
      })) : [];

    // Department-wise readiness
    const { data: faculty } = await supabase
      .from('quality_facultyperformance')
      .select('department, performance_rating');

    const departmentReadiness = faculty ? 
      faculty.reduce((acc, f) => {
        const dept = acc.find(item => item.department === f.department);
        if (dept) {
          dept.total += f.performance_rating;
          dept.count += 1;
        } else {
          acc.push({
            department: f.department,
            total: f.performance_rating,
            count: 1
          });
        }
        return acc;
      }, []).map(item => ({
        department: item.department,
        readiness_score: Math.round(item.total / item.count)
      })) : [];

    // Readiness distribution
    const readinessDistribution = [
      { level: 'Excellent', count: 0, range: '90-100' },
      { level: 'Good', count: 0, range: '75-89' },
      { level: 'Average', count: 0, range: '60-74' },
      { level: 'Poor', count: 0, range: '0-59' }
    ];

    if (reports) {
      reports.forEach(report => {
        if (report.score >= 90) readinessDistribution[0].count++;
        else if (report.score >= 75) readinessDistribution[1].count++;
        else if (report.score >= 60) readinessDistribution[2].count++;
        else readinessDistribution[3].count++;
      });
    }

    const analytics = {
      score_trends: scoreTrends,
      department_readiness: departmentReadiness,
      readiness_distribution: readinessDistribution
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching accreditation analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accreditation analytics'
    });
  }
};
