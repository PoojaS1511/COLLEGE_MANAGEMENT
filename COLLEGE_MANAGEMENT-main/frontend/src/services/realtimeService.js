import { supabase } from './supabaseClient';

const realtimeService = {
  /**
   * Subscribe to real-time updates
   * @param {string} event - Event name to subscribe to
   * @param {Function} callback - Callback function to execute on event
   * @returns {Function} Unsubscribe function
   */
  subscribe: (event, callback) => {
    const subscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
      }, (payload) => {
        console.log('Change received!', payload);
        callback(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },

  /**
   * Subscribe to specific table changes
   * @param {string} table - Table name to watch
   * @param {string} event - Database event ('INSERT', 'UPDATE', 'DELETE', '*')
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribeToTable: (table, event = '*', callback) => {
    const subscription = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
        },
        (payload) => {
          console.log(`Change in ${table}:`, payload);
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },

  /**
   * Subscribe to a custom channel
   * @param {string} channelName - Name of the channel
   * @param {Object} config - Channel configuration
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribeToChannel: (channelName, config, callback) => {
    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', config, (payload) => {
        console.log(`Change in ${channelName}:`, payload);
        callback(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
};

export default realtimeService;