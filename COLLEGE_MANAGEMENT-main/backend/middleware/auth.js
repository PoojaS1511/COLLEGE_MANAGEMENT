const { createClient } = require('@supabase/supabase-js');
const { TABLES } = require('../config/database');
const { logError } = require('../utils/logger');

// Create Supabase Admin Client
const supabaseAdmin = createClient(
  'https://qkaaoeismqnhjyikgkme.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw' // REQUIRED
);

// ==========================================
// PROTECT ROUTES (SUPABASE AUTH)
// ==========================================
exports.protect = async (req, res, next) => {
  try {
    // Allow preflight requests to pass without auth
    if (req.method === 'OPTIONS') return next();

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // 🔐 Verify Supabase JWT
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token.'
      });
    }

    const authUser = data.user;

    // 🔎 Fetch app user from DB
    const { data: user, error: userError } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('auth_id', authUser.id) // IMPORTANT: Supabase auth user id
      .single();

    if (userError || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not registered in application.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'User account is deactivated.'
      });
    }

    // Attach user
    req.user = user;
    req.authUser = authUser;

    next();
  } catch (error) {
    logError(error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed.'
    });
  }
};

// ==========================================
// ROLE AUTHORIZATION
// ==========================================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'User role not authorized.'
      });
    }
    next();
  };
};

// ==========================================
// OWNERSHIP CHECK
// ==========================================
exports.checkOwnership = (table, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin') return next();

      const resourceId = req.params[paramName];

      const { data: resource, error } = await supabaseAdmin
        .from(table)
        .select('user_id')
        .eq('id', resourceId)
        .single();

      if (error || !resource) {
        return res.status(404).json({
          status: 'error',
          message: 'Resource not found.'
        });
      }

      if (resource.user_id !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied.'
        });
      }

      next();
    } catch (error) {
      logError(error);
      res.status(500).json({
        status: 'error',
        message: 'Authorization check failed.'
      });
    }
  };
};
