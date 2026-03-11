const { supabase } = require('../../supabase_client');

// SUB-MODULE 7: REAL-TIME ANALYTICS
exports.getComprehensiveAnalytics = async (req, res) => {
  try {
    const analytics = {
      faculty: await getFacultyAnalytics(),
      audits: await getAuditAnalytics(),
      grievances: await getGrievanceAnalytics(),
      policies: await getPolicyAnalytics()
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching comprehensive analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
};

exports.getAIInsights = async (req, res) => {
  try {
    const insights = await generateAIInsights();
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI insights'
    });
  }
};

// Get faculty analytics
async function getFacultyAnalytics() {
  try {
    // Performance trends
    const performanceTrends = [
      { month: 'Jan', score: 75 },
      { month: 'Feb', score: 78 },
      { month: 'Mar', score: 82 },
      { month: 'Apr', score: 80 },
      { month: 'May', score: 85 },
      { month: 'Jun', score: 88 }
    ];

    // Research output trends
    const researchOutput = [
      { month: 'Jan', count: 15 },
      { month: 'Feb', count: 18 },
      { month: 'Mar', count: 22 },
      { month: 'Apr', count: 20 },
      { month: 'May', count: 25 },
      { month: 'Jun', count: 28 }
    ];

    // Department comparison
    const { data: facultyData } = await supabase
      .from('faculty')
      .select('department, performance_rating, research_output');

    const departmentComparison = facultyData ? 
      facultyData.reduce((acc, faculty) => {
        const dept = acc.find(item => item.department === faculty.department);
        if (dept) {
          dept.performance_total += faculty.performance_rating || 0;
          dept.research_total += faculty.research_output || 0;
          dept.count += 1;
        } else {
          acc.push({
            department: faculty.department,
            performance_total: faculty.performance_rating || 0,
            research_total: faculty.research_output || 0,
            count: 1
          });
        }
        return acc;
      }, []).map(item => ({
        department: item.department,
        avg_performance: Math.round(item.performance_total / item.count),
        total_research: item.research_total
      })) : [];

    return {
      performance_trends: performanceTrends,
      research_output: researchOutput,
      department_comparison: departmentComparison
    };
  } catch (error) {
    console.error('Error in getFacultyAnalytics:', error);
    return {
      performance_trends: [],
      research_output: [],
      department_comparison: []
    };
  }
}

// Get audit analytics
async function getAuditAnalytics() {
  try {
    // Completion trends
    const completionTrends = [
      { month: 'Jan', rate: 60 },
      { month: 'Feb', rate: 65 },
      { month: 'Mar', rate: 70 },
      { month: 'Apr', rate: 75 },
      { month: 'May', rate: 80 },
      { month: 'Jun', rate: 85 }
    ];

    // Department compliance scores
    const { data: auditData } = await supabase
      .from('audits')
      .select('department, compliance_score, status');

    const complianceScores = auditData ? 
      auditData.reduce((acc, audit) => {
        const dept = acc.find(item => item.department === audit.department);
        if (dept) {
          dept.total += audit.compliance_score || 0;
          dept.count += 1;
        } else {
          acc.push({
            department: audit.department,
            total: audit.compliance_score || 0,
            count: 1
          });
        }
        return acc;
      }, []).map(item => ({
        department: item.department,
        avg_compliance: Math.round(item.total / item.count)
      })) : [];

    // Status distribution
    const statusDistribution = auditData ? 
      auditData.reduce((acc, audit) => {
        const status = acc.find(item => item.status === audit.status);
        if (status) {
          status.count += 1;
        } else {
          acc.push({ status: audit.status, count: 1 });
        }
        return acc;
      }, []) : [];

    return {
      completion_trends: completionTrends,
      compliance_scores: complianceScores,
      status_distribution: statusDistribution
    };
  } catch (error) {
    console.error('Error in getAuditAnalytics:', error);
    return {
      completion_trends: [],
      compliance_scores: [],
      status_distribution: []
    };
  }
}

// Get grievance analytics
async function getGrievanceAnalytics() {
  try {
    // Resolution time analysis by category
    const { data: grievanceData } = await supabase
      .from('grievances')
      .select('category, resolution_time_hours, status');

    const resolutionTimes = grievanceData ? 
      grievanceData.reduce((acc, grievance) => {
        const category = acc.find(item => item.category === grievance.category);
        if (category) {
          category.total += grievance.resolution_time_hours || 0;
          category.count += 1;
        } else {
          acc.push({
            category: grievance.category,
            total: grievance.resolution_time_hours || 0,
            count: 1
          });
        }
        return acc;
      }, []).map(item => ({
        category: item.category,
        avg_hours: Math.round(item.total / item.count)
      })) : [];

    // Category distribution
    const categoryDistribution = grievanceData ? 
      grievanceData.reduce((acc, grievance) => {
        const category = acc.find(item => item.category === grievance.category);
        if (category) {
          category.count += 1;
        } else {
          acc.push({ category: grievance.category, count: 1 });
        }
        return acc;
      }, []) : [];

    // Status breakdown
    const statusBreakdown = grievanceData ? 
      grievanceData.reduce((acc, grievance) => {
        const status = acc.find(item => item.status === grievance.status);
        if (status) {
          status.count += 1;
        } else {
          acc.push({ status: grievance.status, count: 1 });
        }
        return acc;
      }, []) : [];

    return {
      resolution_times: resolutionTimes,
      category_distribution: categoryDistribution,
      status_breakdown: statusBreakdown
    };
  } catch (error) {
    console.error('Error in getGrievanceAnalytics:', error);
    return {
      resolution_times: [],
      category_distribution: [],
      status_breakdown: []
    };
  }
}

// Get policy analytics
async function getPolicyAnalytics() {
  try {
    // Compliance trends
    const complianceTrends = [
      { month: 'Jan', rate: 80 },
      { month: 'Feb', rate: 82 },
      { month: 'Mar', rate: 85 },
      { month: 'Apr', rate: 87 },
      { month: 'May', rate: 90 },
      { month: 'Jun', rate: 92 }
    ];

    // Policy-wise compliance status
    const { data: policyData } = await supabase
      .from('policies')
      .select('title, compliance_status');

    const policyCompliance = policyData ? 
      policyData.map(policy => ({
        policy: policy.title,
        status: policy.compliance_status
      })) : [];

    // Upcoming deadlines
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data: deadlineData } = await supabase
      .from('policies')
      .select('title, next_review_date')
      .gte('next_review_date', today.toISOString())
      .lte('next_review_date', thirtyDaysFromNow.toISOString())
      .order('next_review_date', { ascending: true });

    const upcomingDeadlines = deadlineData ? 
      deadlineData.map(policy => {
        const daysLeft = Math.ceil((new Date(policy.next_review_date) - today) / (1000 * 60 * 60 * 24));
        return {
          policy: policy.title,
          days_left: daysLeft
        };
      }) : [];

    return {
      compliance_trends: complianceTrends,
      policy_compliance: policyCompliance,
      upcoming_deadlines: upcomingDeadlines
    };
  } catch (error) {
    console.error('Error in getPolicyAnalytics:', error);
    return {
      compliance_trends: [],
      policy_compliance: [],
      upcoming_deadlines: []
    };
  }
}

// Generate AI-driven insights
async function generateAIInsights() {
  try {
    const insights = [];

    // Faculty performance insights
    const { data: faculty } = await supabase
      .from('faculty')
      .select('performance_rating, department');

    if (faculty && faculty.length > 0) {
      const avgPerformance = faculty.reduce((sum, f) => sum + (f.performance_rating || 0), 0) / faculty.length;
      
      if (avgPerformance < 75) {
        insights.push({
          type: 'warning',
          category: 'Faculty Performance',
          message: `Average faculty performance (${Math.round(avgPerformance)}%) is below target. Consider faculty development programs.`,
          priority: 'high'
        });
      } else if (avgPerformance > 85) {
        insights.push({
          type: 'success',
          category: 'Faculty Performance',
          message: `Excellent faculty performance (${Math.round(avgPerformance)}%) maintained across departments.`,
          priority: 'low'
        });
      }
    }

    // Audit compliance insights
    const { data: audits } = await supabase
      .from('audits')
      .select('status, compliance_score');

    if (audits && audits.length > 0) {
      const pendingAudits = audits.filter(a => a.status === 'pending').length;
      const avgCompliance = audits.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / audits.length;
      
      if (pendingAudits > audits.length * 0.3) {
        insights.push({
          type: 'warning',
          category: 'Audit Management',
          message: `${pendingAudits} audits pending. Immediate attention required to maintain compliance.`,
          priority: 'high'
        });
      }

      if (avgCompliance < 80) {
        insights.push({
          type: 'alert',
          category: 'Compliance',
          message: `Average compliance score (${Math.round(avgCompliance)}%) below acceptable levels.`,
          priority: 'medium'
        });
      }
    }

    // Grievance resolution insights
    const { data: grievances } = await supabase
      .from('grievances')
      .select('status, resolution_time_hours');

    if (grievances && grievances.length > 0) {
      const resolvedGrievances = grievances.filter(g => g.status === 'resolved');
      const avgResolutionTime = resolvedGrievances.length > 0 
        ? resolvedGrievances.reduce((sum, g) => sum + (g.resolution_time_hours || 0), 0) / resolvedGrievances.length
        : 0;

      if (avgResolutionTime > 72) { // 3 days
        insights.push({
          type: 'warning',
          category: 'Grievance Resolution',
          message: `Average grievance resolution time (${Math.round(avgResolutionTime)} hours) exceeds SLA.`,
          priority: 'medium'
        });
      }
    }

    // Policy compliance insights
    const { data: policies } = await supabase
      .from('policies')
      .select('compliance_status, next_review_date');

    if (policies && policies.length > 0) {
      const nonCompliantPolicies = policies.filter(p => p.compliance_status === 'non_compliant').length;
      
      if (nonCompliantPolicies > 0) {
        insights.push({
          type: 'alert',
          category: 'Policy Compliance',
          message: `${nonCompliantPolicies} policies are non-compliant and require immediate action.`,
          priority: 'high'
        });
      }
    }

    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}
