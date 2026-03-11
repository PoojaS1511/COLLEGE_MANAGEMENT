import { supabase } from '../lib/supabase';

export const checkDatabaseSchema = async () => {
  try {
    console.log('Checking database schema...');
    
    // Try to access the polls table directly
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .limit(1);
    
    // If we get here, the polls table exists
    if (!error) {
      return {
        hasAllTables: true,
        missingTables: [],
        message: 'All required tables exist'
      };
    }

    // If there's an error, check if it's because the table doesn't exist
    if (error.code === '42P01') { // 42P01 is the code for "undefined table"
      return {
        hasAllTables: false,
        missingTables: ['polls', 'poll_options', 'votes'],
        message: 'Required tables do not exist. Please run database migrations.'
      };
    }

    // For other errors, throw them
    throw error;
    
  } catch (error) {
    console.error('Error checking database schema:', error);
    return {
      hasAllTables: false,
      missingTables: [],
      message: `Error checking schema: ${error.message}`
    };
  }
};

export const getPolls = async () => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        options: poll_options(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching polls:', error);
    return { data: null, error };
  }
};

export const submitVote = async (pollId, optionId, userId) => {
  try {
    // First, check if the user has already voted for this poll
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingVote) {
      // Update existing vote
      const { data, error } = await supabase
        .from('votes')
        .update({ option_id: optionId })
        .eq('id', existingVote.id)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } else {
      // Insert new vote
      const { data, error } = await supabase
        .from('votes')
        .insert([
          { 
            poll_id: pollId,
            option_id: optionId,
            user_id: userId
          }
        ])
        .select();

      if (error) throw error;
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error submitting vote:', error);
    return { data: null, error };
  }
};
