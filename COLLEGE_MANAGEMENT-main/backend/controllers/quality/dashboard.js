const { supabase } = require('../../supabase_client');

// SUB-MODULE 1: DASHBOARD OVERVIEW
exports.getKPIs = async (req, res) => {
  try {
    // Get total faculty count (real data)
    const { count: totalFaculty } = await supabase
      .from('quality_facultyperformance')
      .select('*', { count: 'exact', head: true });

    // Mock data for other metrics since tables don't exist yet
    const kpis = {
      total_faculty: totalFaculty || 0,
      pending_audits: 3,
      open_grievances: 5,
      overall_policy_compliance_rate: 87,
      accreditation_readiness_score: 82,
      monthly_trends: {
        faculty_performance: [75, 78, 82, 80, 85, 88],
        audit_completion_rate: [60, 65, 70, 75, 80, 85],
        grievance_resolution_rate: [70, 72, 75, 78, 80, 82],
        policy_compliance: [80, 82, 85, 87, 90, 92]
      }
    };

    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard KPIs'
    });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    // Mock recent activity data since tables don't exist yet
    const mockActivities = [
      {
        id: 'audit-001',
        title: 'Quality Assurance Audit - Computer Science',
        type: 'audit',
        status: 'pending',
        updated_at: '2026-01-25T10:00:00Z'
      },
      {
        id: 'grievance-001',
        title: 'Lab Equipment Issue',
        type: 'grievance',
        status: 'in_progress',
        updated_at: '2026-01-25T09:30:00Z'
      },
      {
        id: 'policy-001',
        title: 'Academic Integrity Policy',
        type: 'policy',
        compliance_status: 'compliant',
        updated_at: '2026-01-24T16:45:00Z'
      },
      {
        id: 'audit-002',
        title: 'Infrastructure Audit - Electrical Engineering',
        type: 'audit',
        status: 'completed',
        updated_at: '2026-01-24T14:20:00Z'
      },
      {
        id: 'grievance-002',
        title: 'Course Registration Problem',
        type: 'grievance',
        status: 'resolved',
        updated_at: '2026-01-23T11:15:00Z'
      }
    ];

    res.json({
      success: true,
      data: mockActivities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity'
    });
  }
};
