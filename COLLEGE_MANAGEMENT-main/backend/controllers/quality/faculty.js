const { supabase } = require('../../supabase_client');

// SUB-MODULE 2: FACULTY PERFORMANCE DATA
exports.getAllFaculty = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, search } = req.query;
    
    let query = supabase
      .from('quality_facultyperformance')
      .select('*', { count: 'exact' });

    if (department && department !== 'All Departments') {
      query = query.eq('department', department);
    }

    if (search) {
      query = query.or(`faculty_name.ilike.%${search}%,faculty_id.ilike.%${search}%`);
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
    console.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch faculty data'
    });
  }
};

exports.addFaculty = async (req, res) => {
  try {
    // Generate faculty_id if not provided
    if (!req.body.faculty_id) {
      const { data: lastFaculty } = await supabase
        .from('quality_facultyperformance')
        .select('faculty_id')
        .order('faculty_id', { ascending: false })
        .limit(1);
      
      let nextId = 'F0001';
      if (lastFaculty && lastFaculty.length > 0) {
        const lastId = lastFaculty[0].faculty_id;
        const currentNum = parseInt(lastId.substring(1));
        nextId = `F${(currentNum + 1).toString().padStart(4, '0')}`;
      }
      req.body.faculty_id = nextId;
    }

    const { data, error } = await supabase
      .from('quality_facultyperformance')
      .insert([req.body])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Faculty added successfully'
    });
  } catch (error) {
    console.error('Error adding faculty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add faculty'
    });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('quality_facultyperformance')
      .update(req.body)
      .eq('faculty_id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Faculty updated successfully'
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update faculty'
    });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('quality_facultyperformance')
      .delete()
      .eq('faculty_id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete faculty'
    });
  }
};

exports.getFacultyAnalytics = async (req, res) => {
  try {
    const { data: facultyData, error } = await supabase
      .from('quality_facultyperformance')
      .select('*');

    if (error) throw error;

    // Performance trends (mock data for demo)
    const performanceTrends = [
      { month: 'Jan', score: 75 },
      { month: 'Feb', score: 78 },
      { month: 'Mar', score: 82 },
      { month: 'Apr', score: 80 },
      { month: 'May', score: 85 },
      { month: 'Jun', score: 88 }
    ];

    // Research output trends (mock data for demo)
    const researchOutput = [
      { month: 'Jan', count: 15 },
      { month: 'Feb', count: 18 },
      { month: 'Mar', count: 22 },
      { month: 'Apr', count: 20 },
      { month: 'May', count: 25 },
      { month: 'Jun', count: 28 }
    ];

    // Department comparison based on actual data
    const departmentComparison = facultyData ? 
      facultyData.reduce((acc, faculty) => {
        const deptName = faculty.department;
        const dept = acc.find(item => item.department === deptName);
        if (dept) {
          dept.count += 1;
          dept.total_score += faculty.performance_rating;
          dept.score = Math.floor(dept.total_score / dept.count);
        } else {
          acc.push({
            department: deptName,
            count: 1,
            total_score: faculty.performance_rating,
            score: faculty.performance_rating
          });
        }
        return acc;
      }, []) : [];

    // Add some stats
    const totalFaculty = facultyData ? facultyData.length : 0;
    const avgPerformance = totalFaculty > 0 
      ? Math.floor(facultyData.reduce((sum, f) => sum + (f.performance_rating || 0), 0) / totalFaculty)
      : 0;
    
    const totalResearch = facultyData ? facultyData.reduce((sum, f) => sum + (f.research_papers || 0), 0) : 0;

    const analytics = {
      performance_trends: performanceTrends,
      research_output: researchOutput,
      department_comparison: departmentComparison,
      stats: {
        total_faculty: totalFaculty,
        avg_performance: avgPerformance,
        total_research: totalResearch,
        total_publications: totalResearch // Using research_papers as publications for now
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching faculty analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch faculty analytics'
    });
  }
};
