import { supabase } from './supabaseClient';

const VoteService = {
  // Fetch all votes with related data
  async getAllVotes() {
    try {
      // First, fetch votes with poll and option details
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select(`
          *,
          polls: poll_id (*),
          options: option_id (*)
        `)
        .order('created_at', { ascending: false });

      if (votesError) throw votesError;
      if (!votesData || votesData.length === 0) return [];

      // Extract unique user IDs
      const userIds = [...new Set(votesData.map(vote => vote.user_id))];

      // Fetch student information in a single query
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('user_id, full_name, email, roll_no')
        .in('user_id', userIds);

      if (studentsError) throw studentsError;

      // Create a map of user IDs to student data
      const studentsMap = new Map(studentsData.map(student => [student.user_id, student]));

      // Combine the data
      return votesData.map(vote => {
        const student = studentsMap.get(vote.user_id) || { 
          user_id: vote.user_id,
          full_name: 'Unknown User',
          email: 'N/A',
          roll_no: 'N/A'
        };
        
        return {
          ...vote,
          users: {
            id: student.user_id,
            full_name: student.full_name,
            email: student.email,
            roll_no: student.roll_no
          }
        };
      });

    } catch (error) {
      console.error('Error in getAllVotes:', error);
      throw error;
    }
  },

  // Fetch votes for a specific poll
  async getVotesByPoll(pollId) {
    try {
      // First, fetch votes with option details
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select(`
          *,
          options: option_id (*)
        `)
        .eq('poll_id', pollId)
        .order('created_at', { ascending: false });

      if (votesError) throw votesError;
      if (!votesData || votesData.length === 0) return [];

      // Extract unique user IDs
      const userIds = [...new Set(votesData.map(vote => vote.user_id))];

      // Fetch student information in a single query
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('user_id, full_name, email, roll_no')
        .in('user_id', userIds);

      if (studentsError) throw studentsError;

      // Create a map of user IDs to student data
      const studentsMap = new Map(studentsData.map(student => [student.user_id, student]));

      // Combine the data
      return votesData.map(vote => {
        const student = studentsMap.get(vote.user_id) || { 
          user_id: vote.user_id,
          full_name: 'Unknown User',
          email: 'N/A',
          roll_no: 'N/A'
        };
        
        return {
          ...vote,
          users: {
            id: student.user_id,
            full_name: student.full_name,
            email: student.email,
            roll_no: student.roll_no
          }
        };
      });

    } catch (error) {
      console.error(`Error in getVotesByPoll for poll ${pollId}:`, error);
      throw error;
    }
  },

  // Add a new vote
  async addVote(voteData) {
    try {
      const { data, error } = await supabase
        .from('votes')
        .insert([voteData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error adding vote:', error);
      throw error;
    }
  },

  // Delete a vote
  async deleteVote(voteId) {
    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', voteId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting vote ${voteId}:`, error);
      throw error;
    }
  }
};

export default VoteService;
