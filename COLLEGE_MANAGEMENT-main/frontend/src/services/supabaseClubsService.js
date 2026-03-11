import { BaseService } from './baseService';

export class ClubService extends BaseService {
  constructor() {
    super('clubs');
  }

  async getClubs() {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        category:club_categories(*),
        advisor:profiles(*)
      `)
      .order('name');
    
    if (error) throw error;
    return data;
  }

  async getClubWithDetails(clubId) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        category:club_categories(*),
        advisor:profiles(*),
        members:club_members(
          *,
          student:profiles(*)
        ),
        events:club_events(*),
        awards:club_awards(*)
      `)
      .eq('id', clubId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Club Members
  async getClubMembers(clubId) {
    const { data, error } = await this.supabase
      .from('club_members')
      .select(`
        *,
        student:profiles(*)
      `)
      .eq('club_id', clubId);
    
    if (error) throw error;
    return data;
  }

  async addClubMember(clubId, userId, role = 'member') {
    const { data, error } = await this.supabase
      .from('club_members')
      .insert([{
        club_id: clubId,
        user_id: userId,
        role,
        status: 'active'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateMemberRole(memberId, role) {
    const { data, error } = await this.supabase
      .from('club_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Club Events
  async getClubEvents(clubId) {
    const { data, error } = await this.supabase
      .from('club_events')
      .select('*')
      .eq('club_id', clubId)
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async createEvent(eventData) {
    const { data, error } = await this.supabase
      .from('club_events')
      .insert([eventData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Club Awards
  async getClubAwards(clubId) {
    const { data, error } = await this.supabase
      .from('club_awards')
      .select(`
        *,
        recipient:profiles(*)
      `)
      .eq('club_id', clubId)
      .order('awarded_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createAward(awardData) {
    const { data, error } = await this.supabase
      .from('club_awards')
      .insert([awardData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Club Categories
  async getClubCategories() {
    const { data, error } = await this.supabase
      .from('club_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }
}

export const clubService = new ClubService();
export default clubService;
