const { supabase } = require('../../supabase_client');

// SUB-MODULE 5: POLICY COMPLIANCE STATUS
exports.getAllPolicies = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, compliance_status } = req.query;
    
    let query = supabase
      .from('quality_policy')
      .select('*', { count: 'exact' })
      .order('next_due_date', { ascending: true });

    if (department && department !== 'All Departments') {
      query = query.eq('responsible_department', department);
    }
    if (compliance_status) query = query.eq('compliance_status', compliance_status);

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
    console.error('Error fetching policies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch policy data'
    });
  }
};

exports.addPolicy = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quality_policy')
      .insert([req.body])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Policy added successfully'
    });
  } catch (error) {
    console.error('Error adding policy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add policy'
    });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('quality_policy')
      .update(req.body)
      .eq('policy_id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Policy updated successfully'
    });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update policy'
    });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('quality_policy')
      .delete()
      .eq('policy_id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete policy'
    });
  }
};

exports.getNonCompliantPolicies = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quality_policy')
      .select('*')
      .eq('compliance_status', 'Non-Compliant')
      .order('next_due_date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching non-compliant policies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch non-compliant policies'
    });
  }
};

exports.getPoliciesDueForReview = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('quality_policy')
      .select('*')
      .lte('next_due_date', today)
      .order('next_due_date', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching policies due for review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch policies due for review'
    });
  }
};

exports.getPolicyAnalytics = async (req, res) => {
  try {
    // Compliance trends (mock)
    const complianceTrends = [
      { month: 'Jan', rate: 80 },
      { month: 'Feb', rate: 82 },
      { month: 'Mar', rate: 85 },
      { month: 'Apr', rate: 87 },
      { month: 'May', rate: 90 },
      { month: 'Jun', rate: 92 }
    ];

    const { data: policyData, error } = await supabase
      .from('quality_policy')
      .select('*');

    if (error) throw error;

    const policyCompliance = policyData ? 
      policyData.map(policy => ({
        policy: policy.policy_name,
        status: policy.compliance_status
      })) : [];

    // Upcoming deadlines
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingDeadlines = policyData ? 
      policyData.filter(policy => {
        const dueDate = new Date(policy.next_due_date);
        return dueDate >= today && dueDate <= thirtyDaysFromNow;
      }).map(policy => {
        const daysLeft = Math.ceil((new Date(policy.next_due_date) - today) / (1000 * 60 * 60 * 24));
        return {
          policy: policy.policy_name,
          days_left: daysLeft
        };
      }) : [];

    const analytics = {
      compliance_trends: complianceTrends,
      policy_compliance: policyCompliance,
      upcoming_deadlines: upcomingDeadlines
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching policy analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch policy analytics'
    });
  }
};
