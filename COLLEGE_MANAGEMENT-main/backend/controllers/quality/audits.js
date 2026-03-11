const { supabase } = require('../../supabase_client');

// SUB-MODULE 3: AUDIT RECORDS
exports.getAllAudits = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, status, audit_type } = req.query;
    
    let query = supabase
      .from('quality_audits')
      .select('*', { count: 'exact' });

    if (department && department !== 'All Departments') {
      query = query.eq('department', department);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit data'
    });
  }
};

exports.createAudit = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quality_audits')
      .insert([req.body])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Audit created successfully'
    });
  } catch (error) {
    console.error('Error creating audit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create audit'
    });
  }
};

exports.updateAudit = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('quality_audits')
      .update(req.body)
      .eq('audit_id', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      data: data[0],
      message: 'Audit updated successfully'
    });
  } catch (error) {
    console.error('Error updating audit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update audit'
    });
  }
};

exports.deleteAudit = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('quality_audits')
      .delete()
      .eq('audit_id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Audit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting audit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete audit'
    });
  }
};

exports.getOverdueAudits = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('quality_audits')
      .select('*')
      .lt('audit_date', today)
      .in('status', ['Pending', 'In Progress'])
      .order('audit_date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching overdue audits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overdue audits'
    });
  }
};

exports.getAuditAnalytics = async (req, res) => {
  try {
    // Completion trends (mock)
    const completionTrends = [
      { month: 'Jan', rate: 60 },
      { month: 'Feb', rate: 65 },
      { month: 'Mar', rate: 70 },
      { month: 'Apr', rate: 75 },
      { month: 'May', rate: 80 },
      { month: 'Jun', rate: 85 }
    ];

    const { data: allAudits, error } = await supabase
      .from('quality_audits')
      .select('*');

    if (error) throw error;

    // Department compliance scores
    const complianceScores = allAudits ? 
      allAudits.reduce((acc, audit) => {
        const dept = acc.find(item => item.department === audit.department);
        if (dept) {
          dept.total += (audit.compliance_score || 0);
          dept.count += 1;
        } else {
          acc.push({
            department: audit.department,
            total: (audit.compliance_score || 0),
            count: 1
          });
        }
        return acc;
      }, []).map(item => ({
        department: item.department,
        score: Math.round(item.total / item.count)
      })) : [];

    // Status distribution
    const statusDistribution = allAudits ? 
      allAudits.reduce((acc, audit) => {
        const status = acc.find(item => item.status === audit.status);
        if (status) {
          status.count += 1;
        } else {
          acc.push({ status: audit.status, count: 1 });
        }
        return acc;
      }, []) : [];

    const analytics = {
      completion_trends: completionTrends,
      compliance_scores: complianceScores,
      status_distribution: statusDistribution
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching audit analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit analytics'
    });
  }
};
