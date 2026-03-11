// This file is deprecated - use database.js instead
const { database } = require('./config/database');

module.exports = { 
  // Legacy compatibility wrapper
  supabase: {
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: () => database.fetchById(table, value),
          then: (resolve) => resolve({ data: database.fetchAll(table), error: null })
        }),
        then: (resolve) => resolve({ data: database.fetchAll(table), error: null })
      }),
      insert: (data) => ({
        select: () => ({
          single: () => database.insert(table, Array.isArray(data) ? data[0] : data),
          then: (resolve) => resolve({ data: database.insert(table, Array.isArray(data) ? data[0] : data), error: null })
        })
      }),
      update: (updates) => ({
        eq: (column, value) => ({
          select: () => ({
            single: () => database.update(table, value, updates),
            then: (resolve) => resolve({ data: database.update(table, value, updates), error: null })
          })
        })
      }),
      delete: () => ({
        eq: (column, value) => ({
          then: (resolve) => resolve({ error: database.delete(table, value) ? null : { message: 'Delete failed' } })
        })
      })
    })
  },
  supabaseAdmin: {
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: () => database.fetchById(table, value),
          then: (resolve) => resolve({ data: database.fetchAll(table), error: null })
        }),
        then: (resolve) => resolve({ data: database.fetchAll(table), error: null })
      }),
      insert: (data) => ({
        select: () => ({
          single: () => database.insert(table, Array.isArray(data) ? data[0] : data),
          then: (resolve) => resolve({ data: database.insert(table, Array.isArray(data) ? data[0] : data), error: null })
        })
      }),
      update: (updates) => ({
        eq: (column, value) => ({
          select: () => ({
            single: () => database.update(table, value, updates),
            then: (resolve) => resolve({ data: database.update(table, value, updates), error: null })
          })
        })
      }),
      delete: () => ({
        eq: (column, value) => ({
          then: (resolve) => resolve({ error: database.delete(table, value) ? null : { message: 'Delete failed' } })
        })
      })
    })
  }
};
