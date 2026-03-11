import { supabase } from './supabase';

const ClubService = {
  // Student Operations
  getStudent: async (studentId) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
    if (error) throw error;
    return data;
  },

  // Club Operations
  getClubs: async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select(`
        *,
        created_by:students(name, email)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getClub: async (clubId) => {
    const { data, error } = await supabase
      .from('clubs')
      .select(`
        *,
        created_by:students(name, email)
      `)
      .eq('id', clubId)
      .single();
    if (error) throw error;
    return data;
  },

  createClub: async (clubData) => {
    const { data, error } = await supabase
      .from('clubs')
      .insert([clubData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateClub: async (clubId, updates) => {
    const { data, error } = await supabase
      .from('clubs')
      .update(updates)
      .eq('id', clubId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteClub: async (clubId) => {
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', clubId);
    if (error) throw error;
  },

  // Club Members Operations
  getClubMembers: async (clubId) => {
    const { data, error } = await supabase
      .from('club_members')
      .select(`
        *,
        student:students(*)
      `)
      .eq('club_id', clubId);
    if (error) throw error;
    return data;
  },

  addClubMember: async (clubId, studentId, role = 'Member') => {
    const { data, error } = await supabase
      .from('club_members')
      .insert([{
        club_id: clubId,
        student_id: studentId,
        role,
        status: 'Approved'
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateMemberRole: async (memberId, updates) => {
    const { data, error } = await supabase
      .from('club_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  removeClubMember: async (memberId) => {
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('id', memberId);
    if (error) throw error;
  },

  // Club Events Operations
  getClubEvents: async (clubId) => {
    const { data, error } = await supabase
      .from('club_events')
      .select('*')
      .eq('club_id', clubId)
      .order('start_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  createEvent: async (eventData) => {
    const { data, error } = await supabase
      .from('club_events')
      .insert([eventData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Event Participants Operations
  getEventParticipants: async (eventId) => {
    const { data, error } = await supabase
      .from('club_event_participants')
      .select(`
        *,
        student:students(*)
      `)
      .eq('event_id', eventId);
    if (error) throw error;
    return data;
  },

  // Event Attendance Operations
  markAttendance: async (attendanceData) => {
    const { data, error } = await supabase
      .from('event_attendance')
      .upsert(attendanceData, { onConflict: 'event_id,student_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Club Awards Operations
  getClubAwards: async (clubId) => {
    const { data, error } = await supabase
      .from('club_awards')
      .select(`
        *,
        student:students(name, profile_pic),
        event:club_events(title)
      `)
      .eq('club_id', clubId);
    if (error) throw error;
    return data;
  },

  createAward: async (awardData) => {
    const { data, error } = await supabase
      .from('club_awards')
      .insert([awardData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Event Gallery Operations
  getEventGallery: async (eventId) => {
    const { data, error } = await supabase
      .from('event_gallery')
      .select('*')
      .eq('event_id', eventId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  uploadToGallery: async (fileData) => {
    const { data, error } = await supabase
      .from('event_gallery')
      .insert([fileData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export default ClubService;
