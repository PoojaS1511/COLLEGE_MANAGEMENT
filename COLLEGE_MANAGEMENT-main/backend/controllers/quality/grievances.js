const { supabase } = require('../../supabase_client');

// AI-based grievance classification
function classifyGrievance(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('academic') || text.includes('course') || text.includes('exam')) {
    return 'Academic';
  } else if (text.includes('hostel') || text.includes('mess') || text.includes('facility')) {
    return 'Infrastructure';
  } else if (text.includes('fee') || text.includes('payment') || text.includes('scholarship')) {
    return 'Financial';
  } else if (text.includes('harassment') || text.includes('discrimination') || text.includes('behavior')) {
    return 'Conduct';
  } else if (text.includes('administration') || text.includes('process') || text.includes('procedure')) {
    return 'Administrative';
  } else {
    return 'General';
  }
}

// SUB-MODULE 4: GRIEVANCE REPORTS
exports.getAllGrievances = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, user_type } = req.query;
    
    let query = supabase
      .from('grievances')
      .select('*', { count: 'exact' })
      .order('submitted_date', { ascending: false });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (user_type) query = query.eq('user_type', user_type);

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
    console.error('Error fetching grievances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch grievance data'
    });
  }
};

exports.submitGrievance = async (req, res) => {
  try {
    const grievanceData = {
      ...req.body,
      submitted_by: req.user.id,
      submitted_date: new Date().toISOString(),
      status: 'pending',
      ai_classification: classifyGrievance(req.body.title, req.body.description)
    };

    const { data, error } = await supabase
      .from('grievances')
      .insert([grievanceData])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Grievance submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting grievance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit grievance'
    });
  }
};

exports.updateGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Calculate resolution time if status is being changed to resolved
    if (updateData.status === 'resolved' && !updateData.resolved_date) {
      updateData.resolved_date = new Date().toISOString();
      
      // Calculate resolution time in hours
      const { data: grievance } = await supabase
        .from('grievances')
        .select('submitted_date')
        .eq('id', id)
        .single();

      if (grievance) {
        const submitted = new Date(grievance.submitted_date);
        const resolved = new Date(updateData.resolved_date);
        const diffHours = Math.round((resolved - submitted) / (1000 * 60 * 60));
        updateData.resolution_time_hours = diffHours;
      }
    }

    const { data, error } = await supabase
      .from('grievances')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Grievance not found'
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Grievance updated successfully'
    });
  } catch (error) {
    console.error('Error updating grievance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update grievance'
    });
  }
};

exports.deleteGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('grievances')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Grievance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grievance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete grievance'
    });
  }
};

exports.getGrievanceAnalytics = async (req, res) => {
  try {
    // Resolution time analysis by category
    const { data: resolutionData } = await supabase
      .from('grievances')
      .select('category, resolution_time_hours')
      .not('resolution_time_hours', 'is', null);

    const resolutionTimes = resolutionData ? 
      resolutionData.reduce((acc, grievance) => {
        const category = acc.find(item => item.category === grievance.category);
        if (category) {
          category.total += grievance.resolution_time_hours;
          category.count += 1;
        } else {
          acc.push({
            category: grievance.category,
            total: grievance.resolution_time_hours,
            count: 1
          });
        }
        return acc;
      }, []).map(item => ({
        category: item.category,
        avg_hours: Math.round(item.total / item.count)
      })) : [];

    // Category distribution
    const { data: categoryData } = await supabase
      .from('grievances')
      .select('category');

    const categoryDistribution = categoryData ? 
      categoryData.reduce((acc, grievance) => {
        const category = acc.find(item => item.category === grievance.category);
        if (category) {
          category.count += 1;
        } else {
          acc.push({ category: grievance.category, count: 1 });
        }
        return acc;
      }, []) : [];

    // Status breakdown
    const { data: statusData } = await supabase
      .from('grievances')
      .select('status');

    const statusBreakdown = statusData ? 
      statusData.reduce((acc, grievance) => {
        const status = acc.find(item => item.status === grievance.status);
        if (status) {
          status.count += 1;
        } else {
          acc.push({ status: grievance.status, count: 1 });
        }
        return acc;
      }, []) : [];

    const analytics = {
      resolution_times: resolutionTimes,
      category_distribution: categoryDistribution,
      status_breakdown: statusBreakdown
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching grievance analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch grievance analytics'
    });
  }
};
