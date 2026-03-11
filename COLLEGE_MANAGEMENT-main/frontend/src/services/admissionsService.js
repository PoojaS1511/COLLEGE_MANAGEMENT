import { supabase } from '../lib/supabase';

// Helper function to list all tables (for debugging)
const listAllTables = async () => {
  try {
    const { data, error } = await supabase.rpc('get_tables');
    if (error) throw error;
    console.log('📋 Available tables:', data);
    return data;
  } catch (error) {
    console.error('Error listing tables:', error);
    // Fallback: Try to get tables from information_schema
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (error) throw error;
      console.log('📋 Available tables (from information_schema):', data.map(t => t.table_name));
      return data.map(t => t.table_name);
    } catch (e) {
      console.error('Error getting tables from information_schema:', e);
      return [];
    }
  }
};

export const admissionsService = {
  // Get all admission applications with optional filters
  getAdmissions: async (filters = {}) => {
    console.group('📂 getAdmissions');
    try {
      console.log('🔍 Initializing fetch with filters:', filters);
      
      // List of possible table names to try (in order of likelihood)
      const possibleTableNames = [
        'admission_applications',
        'admissions',
        'applications',
        'student_applications',
        'admission_applicants',
        'student_admissions'
      ];

      let lastError = null;
      
      for (const tableName of possibleTableNames) {
        console.group(`🔄 Trying table: ${tableName}`);
        try {
          console.log('🔧 Building query...');
          
          // Start building the query
          let query = supabase
            .from(tableName)
            .select('*', { count: 'exact', head: false });

          // Apply status filter if provided and not 'all'
          if (filters.status && filters.status !== 'all') {
            const status = filters.status.charAt(0).toUpperCase() + filters.status.slice(1).toLowerCase();
            console.log(`   🔎 Applying status filter: "${status}"`);
            query = query.eq('status', status);
          } else {
            console.log('   ℹ️ No status filter applied or showing all statuses');
          }
          
          // Apply search filter if search term is provided
          if (filters.search && filters.search.trim() !== '') {
            const searchTerm = `%${filters.search}%`;
            console.log(`   🔍 Applying search filter: "${filters.search}"`);
            query = query.or(
              `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`
            );
          }

          // Add pagination
          const page = Math.max(1, parseInt(filters.page) || 1);
          const pageSize = Math.max(1, parseInt(filters.pageSize) || 10);
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;

          console.log(`   📊 Pagination - Page: ${page}, Size: ${pageSize}, Range: ${from}-${to}`);

          // Log the final query for debugging
          console.log('   🚀 Executing query...');
          
          // Execute the query with ordering and pagination
          const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

          // Handle query errors
          if (error) {
            console.error(`   ❌ Error querying table "${tableName}":`, error);
            lastError = error;
            console.groupEnd(); // End table group
            continue; // Try next table
          }

          console.log(`   ✅ Success - Found ${data?.length || 0} records (Total: ${count || 0})`);
          
          // If we got data, return it
          if (data && data.length > 0) {
            console.log(`   🎉 Data found in table: "${tableName}"`);
            console.log('   📝 First record sample:', {
              id: data[0].id,
              name: `${data[0].first_name || ''} ${data[0].last_name || ''}`.trim(),
              status: data[0].status,
              created_at: data[0].created_at,
              // Include other relevant fields for debugging
              email: data[0].email,
              phone: data[0].phone
            });
            
            console.groupEnd(); // End table group
            console.groupEnd(); // End main group
            
            return { 
              data: data || [], 
              count: count || 0,
              page,
              pageSize,
              totalPages: Math.ceil((count || 0) / pageSize)
            };
          } else if (count > 0) {
            console.log(`   ℹ️ Table "${tableName}" exists but returned no results with current filters`);
            console.groupEnd(); // End table group
            console.groupEnd(); // End main group
            
            return { 
              data: [], 
              count: 0,
              page,
              pageSize,
              totalPages: 0
            };
          } else {
            console.log(`   ⚠️ Table "${tableName}" exists but is empty or no matching records found`);
          }
          
          console.groupEnd(); // End table group
        } catch (error) {
          console.error(`   ❌ Error with table "${tableName}":`, error);
          lastError = error;
          console.groupEnd(); // End table group
        }
      }
      
      // If we get here, no table worked
      console.error('❌ Could not find or access any application tables');
      await listAllTables(); // Log available tables for debugging
      
      if (lastError) {
        throw new Error(`Failed to fetch applications: ${lastError.message}`);
      } else {
        throw new Error('No application data found in any known table');
      }
    } catch (error) {
      console.error('❌ Unexpected error in getAdmissions:', error);
      throw error;
    } finally {
      console.groupEnd(); // End main group
    }
  },

  // Get a single admission application by ID
  getAdmissionById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('admission_applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Application not found');
      
      return data;
    } catch (error) {
      console.error('Error fetching admission application:', error);
      throw error;
    }
  },

  // Create a new admission application
  createAdmission: async (applicationData) => {
    try {
      const { data, error } = await supabase
        .from('admission_applications')
        .insert([{
          first_name: applicationData.firstName,
          last_name: applicationData.lastName,
          email: applicationData.email,
          phone: applicationData.phone,
          date_of_birth: applicationData.dateOfBirth,
          gender: applicationData.gender,
          address: applicationData.address,
          city: applicationData.city,
          state: applicationData.state,
          country: applicationData.country,
          pincode: applicationData.pincode,
          course_id: applicationData.courseId,
          admission_cycle_id: applicationData.admissionCycleId,
          status: 'submitted',
          // Add other fields as needed
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating admission application:', error);
      throw error;
    }
  },

  // Update an existing admission application
  updateAdmission: async (id, admissionData) => {
    try {
      const { data, error } = await supabase
        .from('admission_applications')
        .update(admissionData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating admission application:', error);
      throw error;
    }
  },

  // Delete an admission application
  deleteAdmission: async (id) => {
    try {
      const { error } = await supabase
        .from('admission_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting admission application:', error);
      throw error;
    }
  },

  // Upload admission documents
  uploadDocument: async (applicationId, file, documentType) => {
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicationId}_${documentType}_${Date.now()}.${fileExt}`;
      const filePath = `admissions/${applicationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('admission-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('admission-documents')
        .getPublicUrl(filePath);

      // Save document record
      const { data, error } = await supabase
        .from('admission_documents')
        .insert([{
          application_id: applicationId,
          document_type: documentType,
          document_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Get admission statistics
  getAdmissionStats: async () => {
    try {
      // Get all stats from the admission_stats view
      const { data: stats, error } = await supabase
        .from('admission_stats')
        .select('*');

      if (error) throw error;

      if (!stats || stats.length === 0) {
        return {
          statusCounts: {},
          courseStats: [],
          monthlyStats: []
        };
      }

      // Process the stats from the view
      const statusCounts = stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {});

      // Get unique course stats
      const courseStatsMap = new Map();
      stats.forEach(stat => {
        if (stat.course_id) {
          const key = `${stat.course_id}-${stat.course_name || 'Unknown'}`;
          if (!courseStatsMap.has(key)) {
            courseStatsMap.set(key, {
              courseId: stat.course_id,
              courseName: stat.course_name || 'Unknown',
              count: 0
            });
          }
          const courseStat = courseStatsMap.get(key);
          courseStat.count += parseInt(stat.count);
        }
      });

      // Convert map to array
      const courseStats = Array.from(courseStatsMap.values());

      // Get current year for monthly stats
      const currentYear = new Date().getFullYear();
      let monthlyStats = [];
      
      // Only fetch monthly stats if needed
      if (stats.some(stat => stat.status === 'approved')) {
        const { data, error: monthlyError } = await supabase
          .rpc('get_monthly_applications', { year_param: currentYear });
        
        if (!monthlyError) {
          monthlyStats = data || [];
        }
      }

      return {
        statusCounts,
        courseStats,
        monthlyStats
      };
    } catch (error) {
      console.error('Error fetching admission statistics:', error);
      throw error;
    }
  },

  // Update admission status
  updateAdmissionStatus: async (id, status, remarks = null) => {
    try {
      const updates = { status };
      
      if (status === 'approved' || status === 'rejected') {
        updates.reviewed_at = new Date().toISOString();
        const { data: userData } = await supabase.auth.getUser();
        updates.reviewed_by = userData.user ? userData.user.id : null;
        updates.remarks = remarks;
      }

      const { data, error } = await supabase
        .from('admission_applications')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating admission status:', error);
      throw error;
    }
  },

  // Get admission statistics by course
  getAdmissionStatsByCourse: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_admission_stats');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching admission statistics by course:', error);
      throw error;
    }
  },

  // Get active admission cycles
  getActiveAdmissionCycles: async () => {
    try {
      const { data, error } = await supabase
        .from('admission_cycles')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching admission cycles:', error);
      throw error;
    }
  }
};
