import { supabase } from '../lib/supabase';

// Base service for common academic support operations
class BaseAcademicSupportService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Common methods for all academic support services
  async getAll(filters = {}) {
    let query = supabase.from(this.tableName).select('*');
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object' && value.operator) {
          query = query.filter(key, value.operator, value.value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getById(id, relations = '') {
    const query = supabase
      .from(this.tableName)
      .select(relations || '*')
      .eq('id', id);
      
    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  }

  async create(item) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// Tutoring Services
export const tutoringService = {
  ...new BaseAcademicSupportService('tutoring_services'),

  async getTutoringServicesWithDetails(filters = {}) {
    let query = supabase
      .from('tutoring_services')
      .select(`
        *,
        service:academic_support_services(*),
        course:courses(*)
      `);

    // Apply filters
    if (filters.subject_area) {
      query = query.ilike('subject_area', `%${filters.subject_area}%`);
    }
    if (filters.course_id) {
      query = query.eq('course_id', filters.course_id);
    }
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getUpcomingSessions(serviceId, filters = {}) {
    let query = supabase
      .from('tutoring_sessions')
      .select(`
        *,
        tutor:tutors(
          id,
          profile:profiles(id, first_name, last_name, avatar_url)
        ),
        location:locations(*)
      `)
      .eq('tutoring_service_id', serviceId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (filters.tutor_id) {
      query = query.eq('tutor_id', filters.tutor_id);
    }
    if (filters.status) {
      query = query.in('status', Array.isArray(filters.status) ? filters.status : [filters.status]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async bookSession(sessionId, studentId) {
    // Check if session has available spots
    const { data: session, error: sessionError } = await supabase
      .from('tutoring_sessions')
      .select('max_capacity, current_enrollment')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;
    
    if (session.max_capacity && session.current_enrollment >= session.max_capacity) {
      throw new Error('This session has reached its maximum capacity');
    }

    // Add participant
    const { data, error } = await supabase
      .from('tutoring_session_participants')
      .insert([{
        session_id: sessionId,
        student_id: studentId,
        status: 'confirmed'
      }])
      .select()
      .single();

    if (error) throw error;

    // Update enrollment count
    await supabase
      .from('tutoring_sessions')
      .update({ current_enrollment: session.current_enrollment + 1 })
      .eq('id', sessionId);

    return data;
  },

  async getTutorSchedule(tutorId, startDate, endDate) {
    const { data, error } = await supabase
      .from('tutoring_sessions')
      .select(`
        id,
        title,
        start_time,
        end_time,
        location:locations(name, room_number),
        tutoring_service:academic_support_services(service_name)
      `)
      .eq('tutor_id', tutorId)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time');

    if (error) throw error;
    return data || [];
  }
};

// Workshop Services
export const workshopService = {
  ...new BaseAcademicSupportService('academic_workshops'),

  async getUpcomingWorkshops(filters = {}) {
    let query = supabase
      .from('academic_workshops')
      .select(`
        *,
        facilitator:profiles(id, first_name, last_name, avatar_url),
        location:locations(*)
      `)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (filters.workshop_type) {
      query = query.eq('workshop_type', filters.workshop_type);
    }
    if (filters.facilitator_id) {
      query = query.eq('facilitator_id', filters.facilitator_id);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async registerForWorkshop(workshopId, studentId) {
    // Check if workshop has available spots
    const { data: workshop, error: workshopError } = await supabase
      .from('academic_workshops')
      .select('max_participants, current_participants, registration_deadline')
      .eq('id', workshopId)
      .single();

    if (workshopError) throw workshopError;
    
    if (workshop.max_participants && workshop.current_participants >= workshop.max_participants) {
      throw new Error('This workshop has reached its maximum capacity');
    }

    if (new Date(workshop.registration_deadline) < new Date()) {
      throw new Error('The registration deadline for this workshop has passed');
    }

    // Register student
    const { data, error } = await supabase
      .from('workshop_registrations')
      .insert([{
        workshop_id: workshopId,
        student_id: studentId,
        registration_date: new Date().toISOString(),
        status: 'registered'
      }])
      .select()
      .single();

    if (error) throw error;

    // Update participant count
    await supabase
      .from('academic_workshops')
      .update({ current_participants: workshop.current_participants + 1 })
      .eq('id', workshopId);

    return data;
  },

  async getWorkshopMaterials(workshopId) {
    const { data, error } = await supabase
      .from('workshop_materials')
      .select('*')
      .eq('workshop_id', workshopId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Resource Management
export const resourceService = {
  ...new BaseAcademicSupportService('academic_resources'),

  async getResourcesByCategory(categoryId, filters = {}) {
    let query = supabase
      .from('academic_resources')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_approved', true)
      .order('title');

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getResourceCategories() {
    const { data, error } = await supabase
      .from('resource_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async uploadResource(resourceData) {
    // First upload the file to storage if present
    if (resourceData.file) {
      const fileExt = resourceData.file.name.split('.').pop();
      const fileName = `${resourceData.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${fileExt}`;
      const filePath = `academic-resources/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('academic-resources')
        .upload(filePath, resourceData.file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('academic-resources')
        .getPublicUrl(filePath);

      // Update resource data with file info
      resourceData.file_url = publicUrl;
      resourceData.file_name = resourceData.file.name;
      resourceData.file_size = resourceData.file.size;
      resourceData.file_type = resourceData.file.type;
    }

    // Save resource metadata to database
    const { data, error } = await supabase
      .from('academic_resources')
      .insert([{
        title: resourceData.title,
        description: resourceData.description,
        category_id: resourceData.category_id,
        resource_type: resourceData.resource_type,
        file_url: resourceData.file_url,
        file_name: resourceData.file_name,
        file_size: resourceData.file_size,
        file_type: resourceData.file_type,
        external_url: resourceData.external_url,
        is_approved: false, // Requires admin approval
        uploaded_by: resourceData.uploaded_by
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Academic Advising
export const advisingService = {
  ...new BaseAcademicSupportService('advising_appointments'),

  async getAvailableTimeSlots(advisorId, date) {
    // Get advisor's working hours and existing appointments
    const [
      { data: advisor },
      { data: existingAppointments }
    ] = await Promise.all([
      supabase
        .from('advisors')
        .select('working_hours')
        .eq('id', advisorId)
        .single(),
      
      supabase
        .from('advising_appointments')
        .select('start_time, end_time')
        .eq('advisor_id', advisorId)
        .gte('start_time', new Date(date.setHours(0, 0, 0, 0)).toISOString())
        .lt('start_time', new Date(date.setHours(23, 59, 59, 999)).toISOString())
    ]);

    // Generate available time slots based on working hours and existing appointments
    // This is a simplified example - you'd want to implement more complex logic
    // based on your specific scheduling requirements
    
    const workingHours = advisor?.working_hours || {
      start: '09:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5] // Monday to Friday
    };

    // Implementation of time slot generation would go here
    // This is a placeholder for the actual implementation
    return [];
  },

  async scheduleAppointment(appointmentData) {
    const { data, error } = await supabase
      .from('advising_appointments')
      .insert([{
        ...appointmentData,
        status: 'scheduled'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStudentAppointments(studentId, status = null) {
    let query = supabase
      .from('advising_appointments')
      .select(`
        *,
        advisor:profiles(id, first_name, last_name, avatar_url, title)
      `)
      .eq('student_id', studentId)
      .order('start_time', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async cancelAppointment(appointmentId) {
    const { data, error } = await supabase
      .from('advising_appointments')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Lab Management Services
export const labService = {
  ...new BaseAcademicSupportService('labs'),

  // Get all labs with equipment count
  async getLabsWithEquipment() {
    const { data, error } = await supabase
      .from('labs')
      .select(`
        *,
        equipment:lab_equipment(count)
      `);
    
    if (error) throw error;
    return data || [];
  },

  // Get available time slots for lab reservation
  async getAvailableLabSlots(labId, date) {
    // Get lab schedule (assuming 9 AM to 5 PM if not specified)
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(17, 0, 0, 0);
    
    // Get existing reservations
    const { data: reservations, error } = await supabase
      .from('lab_reservations')
      .select('start_time, end_time')
      .eq('lab_id', labId)
      .gte('start_time', startTime.toISOString())
      .lte('end_time', endTime.toISOString())
      .order('start_time');
    
    if (error) throw error;
    
    // Generate available time slots (1-hour slots)
    const slots = [];
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + 60 * 60000); // 1 hour slots
      
      // Check if slot is available
      const isBooked = reservations.some(res => {
        const resStart = new Date(res.start_time);
        const resEnd = new Date(res.end_time);
        return (currentTime >= resStart && currentTime < resEnd) || 
               (slotEnd > resStart && slotEnd <= resEnd) ||
               (currentTime <= resStart && slotEnd >= resEnd);
      });
      
      if (!isBooked) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd)
        });
      }
      
      currentTime = new Date(slotEnd);
    }
    
    return slots;
  },

  // Reserve lab equipment
  async reserveLab(reservationData) {
    const { data, error } = await supabase
      .from('lab_reservations')
      .insert([{
        lab_id: reservationData.lab_id,
        equipment_id: reservationData.equipment_id,
        reserved_by: reservationData.user_id,
        start_time: reservationData.start_time,
        end_time: reservationData.end_time,
        purpose: reservationData.purpose,
        status: 'scheduled'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user's lab reservations
  async getUserReservations(userId) {
    const { data, error } = await supabase
      .from('lab_reservations')
      .select(`
        *,
        lab:labs(*),
        equipment:lab_equipment(*)
      `)
      .eq('reserved_by', userId)
      .order('start_time', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Cancel a lab reservation
  async cancelReservation(reservationId) {
    const { data, error } = await supabase
      .from('lab_reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Library Management Services
export const libraryService = {
  ...new BaseAcademicSupportService('library_books'),

  // Search library books
  async searchBooks(query) {
    const { data, error } = await supabase
      .from('library_books')
      .select('*')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%,isbn.eq.${query}`)
      .order('title');
    
    if (error) throw error;
    return data || [];
  },

  // Check out a book
  async checkoutBook(bookId, userId) {
    // Use Supabase RPC to handle the checkout process
    const { data, error } = await supabase.rpc('checkout_book', {
      p_book_id: bookId,
      p_user_id: userId
    });
    
    if (error) throw error;
    return data;
  },

  // Return a book
  async returnBook(bookId, userId) {
    const { data, error } = await supabase.rpc('return_book', {
      p_book_id: bookId,
      p_user_id: userId
    });
    
    if (error) throw error;
    return data;
  },

  // Get user's checked out books
  async getUserCheckedOutBooks(userId) {
    const { data, error } = await supabase
      .from('book_checkouts')
      .select(`
        *,
        book:library_books(*)
      `)
      .eq('user_id', userId)
      .is('return_date', null);
    
    if (error) throw error;
    return data || [];
  },

  // Get book availability
  async getBookAvailability(bookId) {
    const { data, error } = await supabase
      .from('library_books')
      .select('available_copies, total_copies')
      .eq('id', bookId)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Research Management Services
export const researchService = {
  ...new BaseAcademicSupportService('research_projects'),

  // Get research projects for a user
  async getUserResearchProjects(userId) {
    const { data, error } = await supabase
      .from('research_team_members')
      .select(`
        role,
        is_principal_investigator,
        project:research_projects(*)
      `)
      .eq('member_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  // Create a new research project
  async createResearchProject(projectData) {
    const { data, error } = await supabase.rpc('create_research_project', {
      p_title: projectData.title,
      p_description: projectData.description,
      p_start_date: projectData.start_date,
      p_end_date: projectData.end_date,
      p_funding_amount: projectData.funding_amount,
      p_funding_agency: projectData.funding_agency,
      p_created_by: projectData.created_by
    });
    
    if (error) throw error;
    return data;
  },

  // Add team member to research project
  async addTeamMember(projectId, memberId, role) {
    const { data, error } = await supabase
      .from('research_team_members')
      .insert([{
        project_id: projectId,
        member_id: memberId,
        role: role,
        is_principal_investigator: role === 'Principal Investigator'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get project details with team members
  async getProjectDetails(projectId) {
    const { data, error } = await supabase
      .from('research_projects')
      .select(`
        *,
        team:research_team_members(
          role,
          is_principal_investigator,
          member:profiles(id, first_name, last_name, email, avatar_url)
        )
      `)
      .eq('id', projectId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update project status
  async updateProjectStatus(projectId, status) {
    const { data, error } = await supabase
      .from('research_projects')
      .update({ status: status })
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Export all services
export default {
  tutoring: tutoringService,
  workshop: workshopService,
  resource: resourceService,
  advising: advisingService,
  lab: labService,
  library: libraryService,
  research: researchService
};
