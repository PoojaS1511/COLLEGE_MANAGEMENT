import ApiService from './api';
import { supabase } from '../lib/supabase';

const POLLS_TABLE = 'polls';
const POLL_OPTIONS_TABLE = 'poll_options';

export const pollService = {
  // Polls
  getPolls: async () => {
    const { data, error } = await supabase
      .from(POLLS_TABLE)
      .select(`
        *,
        options:${POLL_OPTIONS_TABLE}(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Log meal values for debugging
    if (data && data.length > 0) {
      console.log('Existing polls with meal values:', data.map(poll => ({
        id: poll.id,
        title: poll.title,
        meal: poll.meal,
        day: poll.day
      })));
    }
    
    return data || [];
  },

  getPoll: async (id) => {
    const { data, error } = await supabase
      .from(POLLS_TABLE)
      .select(`
        *,
        options:${POLL_OPTIONS_TABLE}(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  createPoll: async (pollData) => {
    // First, create the poll
    const { data: poll, error: pollError } = await supabase
      .from(POLLS_TABLE)
      .insert({
        title: pollData.title,
        day: pollData.day,
        meal: pollData.meal,
        is_active: pollData.is_active,
        is_approved: pollData.is_approved,
        total_votes: 0
      })
      .select()
      .single();
    
    if (pollError) throw pollError;
    
    // Then create the options in the poll_options table
    if (pollData.options && pollData.options.length > 0) {
      const optionsToInsert = pollData.options.map(option => ({
        poll_id: poll.id,
        name: option.name || option, // Handle both object and string formats
        votes: option.votes || 0
      }));
      
      const { error: optionsError } = await supabase
        .from(POLL_OPTIONS_TABLE)
        .insert(optionsToInsert);
      
      if (optionsError) throw optionsError;
    }
    
    // Return the created poll with its options
    const { data: createdPoll } = await supabase
      .from(POLLS_TABLE)
      .select(`
        *,
        options:${POLL_OPTIONS_TABLE}(*)
      `)
      .eq('id', poll.id)
      .single();
    
    return createdPoll;
  },

  updatePoll: async (id, pollData) => {
    // Update the poll
    const { data: poll, error: pollError } = await supabase
      .from(POLLS_TABLE)
      .update({
        title: pollData.title,
        day: pollData.day,
        meal: pollData.meal,
        is_active: pollData.is_active,
        is_approved: pollData.is_approved
      })
      .eq('id', id)
      .select()
      .single();
    
    if (pollError) throw pollError;
    
    // Delete existing options
    const { error: deleteError } = await supabase
      .from(POLL_OPTIONS_TABLE)
      .delete()
      .eq('poll_id', id);
    
    if (deleteError) throw deleteError;
    
    // Add new options if any
    if (pollData.options && pollData.options.length > 0) {
      const optionsToInsert = pollData.options.map(option => ({
        poll_id: id,
        name: option.name || option, // Handle both object and string formats
        votes: option.votes || 0
      }));
      
      const { error: optionsError } = await supabase
        .from(POLL_OPTIONS_TABLE)
        .insert(optionsToInsert);
      
      if (optionsError) throw optionsError;
    }
    
    // Return the updated poll with its options
    const { data: updatedPoll } = await supabase
      .from(POLLS_TABLE)
      .select(`
        *,
        options:${POLL_OPTIONS_TABLE}(*)
      `)
      .eq('id', id)
      .single();
    
    return updatedPoll;
  },

  deletePoll: async (id) => {
    // First delete related options
    await supabase
      .from(POLL_OPTIONS_TABLE)
      .delete()
      .eq('poll_id', id);
    
    // Then delete the poll
    const { error } = await supabase
      .from(POLLS_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Poll Options
  getPollOptions: async (pollId) => {
    const { data, error } = await supabase
      .from(POLL_OPTIONS_TABLE)
      .select('*')
      .eq('poll_id', pollId);
    
    if (error) throw error;
    return data || [];
  },

  addPollOption: async (pollId, optionData) => {
    const { data, error } = await supabase
      .from(POLL_OPTIONS_TABLE)
      .insert([{ ...optionData, poll_id: pollId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updatePollOption: async (optionId, optionData) => {
    const { data, error } = await supabase
      .from(POLL_OPTIONS_TABLE)
      .update(optionData)
      .eq('id', optionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deletePollOption: async (optionId) => {
    const { error } = await supabase
      .from(POLL_OPTIONS_TABLE)
      .delete()
      .eq('id', optionId);
    
    if (error) throw error;
  },

  // Poll Actions
  voteOnPoll: async (pollId, optionId) => {
    // First increment the vote count for the option
    const { data: option, error: voteError } = await supabase.rpc('increment_vote', {
      option_id: optionId
    });
    
    if (voteError) throw voteError;
    
    // Then increment the total votes for the poll
    const { error: pollError } = await supabase.rpc('increment_poll_votes', {
      poll_id: pollId
    });
    
    if (pollError) throw pollError;
    
    return option;
  },

  togglePollStatus: async (pollId, statusType) => {
    // statusType can be 'is_active' or 'is_approved' or 'is_closed'
    if (!['is_active', 'is_approved', 'is_closed'].includes(statusType)) {
      throw new Error('Invalid status type');
    }
    
    // Get current status
    const { data: poll, error: fetchError } = await supabase
      .from(POLLS_TABLE)
      .select(statusType)
      .eq('id', pollId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Toggle the status
    const { data, error } = await supabase
      .from(POLLS_TABLE)
      .update({ [statusType]: !poll[statusType] })
      .eq('id', pollId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
