import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/realtime-js';

// Base service for common IT operations with real-time support
class BaseITService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Common methods for all IT services
  async getAll(filters = {}, realtimeCallback = null) {
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

    // Subscribe to real-time updates if callback provided
    if (realtimeCallback) {
      const subscription = supabase
        .channel(`public:${this.tableName}`)
        .on('postgres_changes', 
          { 
            event: '*',
            schema: 'public',
            table: this.tableName
          }, 
          (payload) => {
            // Only call the callback if it's a function
            if (typeof realtimeCallback === 'function') {
              realtimeCallback(payload);
            }
          }
        )
        .subscribe();

      // Return unsubscribe function
      return {
        subscription,
        data: (await query).data || []
      };
    }

    // Regular query without subscription
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getById(id, relations = '', realtimeCallback = null) {
    const query = supabase
      .from(this.tableName)
      .select(relations || '*')
      .eq('id', id);
    
    // Subscribe to real-time updates for this specific record if callback provided
    if (realtimeCallback) {
      const subscription = supabase
        .channel(`public:${this.tableName}:id=eq.${id}`)
        .on('postgres_changes', 
          { 
            event: '*',
            schema: 'public',
            table: this.tableName,
            filter: `id=eq.${id}`
          }, 
          (payload) => {
            if (typeof realtimeCallback === 'function') {
              realtimeCallback(payload);
            }
          }
        )
        .subscribe();

      // Return both the data and unsubscribe function
      return {
        subscription,
        data: (await query.single()).data
      };
    }
    
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
    
    // The real-time subscription will automatically pick up the insert
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
    
    // The real-time subscription will automatically pick up the update
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    
    // The real-time subscription will automatically pick up the delete
    return true;
  }
}

// IT Asset Management
export const assetService = {
  ...new BaseITService('it_assets'),

  async getAssetsWithDetails(filters = {}) {
    let query = supabase
      .from('it_assets')
      .select(`
        *,
        location:locations(*),
        assigned_user:profiles!it_assets_assigned_to_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url
        ),
        maintenance_logs:asset_maintenance_logs!asset_id(*)
      `);

    // Apply filters
    if (filters.asset_type) {
      query = query.eq('asset_type', filters.asset_type);
    }
    if (filters.status) {
      query = query.in('status', Array.isArray(filters.status) ? filters.status : [filters.status]);
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters.location_id) {
      query = query.eq('location_id', filters.location_id);
    }
    if (filters.search) {
      query = query.or(
        `asset_name.ilike.%${filters.search}%,` +
        `asset_tag.ilike.%${filters.search}%,` +
        `serial_number.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async assignAsset(assetId, assignTo, assignedBy, notes = '') {
    // Check if asset exists and is available
    const { data: asset, error: assetError } = await this.getById(assetId);
    if (assetError) throw assetError;
    
    if (asset.status !== 'Available') {
      throw new Error(`Asset is not available for assignment. Current status: ${asset.status}`);
    }

    // Update asset assignment
    const { data, error } = await this.update(assetId, {
      assigned_to: assignTo,
      assigned_date: new Date().toISOString(),
      status: 'Assigned',
      updated_at: new Date().toISOString()
    });

    if (error) throw error;
    
    // Log the assignment
    await this.logMaintenance({
      asset_id: assetId,
      maintenance_type: 'Assignment',
      title: 'Asset Assigned',
      description: `Asset assigned to user ${assignTo}`,
      maintenance_date: new Date().toISOString(),
      status: 'Completed',
      notes: notes,
      created_by: assignedBy
    });

    return data;
  },

  async logMaintenance(logData) {
    const { data, error } = await supabase
      .from('asset_maintenance_logs')
      .insert([logData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMaintenanceHistory(assetId) {
    const { data, error } = await supabase
      .from('asset_maintenance_logs')
      .select('*')
      .eq('asset_id', assetId)
      .order('maintenance_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Software License Management
export const licenseService = {
  ...new BaseITService('software_licenses'),

  async getLicensesWithUsage(filters = {}) {
    let query = supabase
      .from('software_licenses')
      .select(`
        *,
        assignments:software_license_assignments!license_id(
          *,
          assigned_user:profiles!software_license_assignments_assigned_to_fkey(
            id,
            first_name,
            last_name,
            email
          )
        )
      `);

    // Apply filters
    if (filters.software_name) {
      query = query.ilike('software_name', `%${filters.software_name}%`);
    }
    if (filters.license_type) {
      query = query.eq('license_type', filters.license_type);
    }
    if (filters.expiring_soon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query.lte('expiry_date', thirtyDaysFromNow.toISOString())
                   .gte('expiry_date', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async assignLicense(licenseId, assignTo, assignedBy, expiryDate = null) {
    // Check license availability
    const { data: license, error: licenseError } = await this.getById(licenseId);
    if (licenseError) throw licenseError;

    if (license.used_licenses >= license.total_licenses) {
      throw new Error('No available licenses');
    }

    // Check if user already has this license
    const { data: existingAssignment, error: checkError } = await supabase
      .from('software_license_assignments')
      .select('*')
      .eq('license_id', licenseId)
      .eq('assigned_to', assignTo)
      .eq('is_active', true)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingAssignment) {
      throw new Error('User already has an active license assignment');
    }

    // Create assignment
    const { data: assignment, error: assignError } = await supabase
      .from('software_license_assignments')
      .insert([{
        license_id: licenseId,
        assigned_to: assignTo,
        assigned_by: assignedBy,
        expiry_date: expiryDate,
        is_active: true
      }])
      .select()
      .single();

    if (assignError) throw assignError;

    // Update license usage count
    await this.update(licenseId, {
      used_licenses: license.used_licenses + 1
    });

    return assignment;
  },

  async revokeLicense(assignmentId, revokedBy) {
    // Get assignment
    const { data: assignment, error: getError } = await supabase
      .from('software_license_assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (getError) throw getError;

    if (!assignment.is_active) {
      throw new Error('License assignment is not active');
    }

    // Update assignment
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('software_license_assignments')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: revokedBy
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update license usage count
    await supabase.rpc('decrement_license_usage', {
      license_id: assignment.license_id
    });

    return updatedAssignment;
  }
};

// Helpdesk Ticket Management
export const helpdeskService = {
  ...new BaseITService('helpdesk_tickets'),

  async createTicket(ticketData) {
    const { data, error } = await supabase
      .from('helpdesk_tickets')
      .insert([{
        ...ticketData,
        status: 'Open',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTickets(filters = {}) {
    let query = supabase
      .from('helpdesk_tickets')
      .select(`
        *,
        reporter:profiles!helpdesk_tickets_reported_by_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url
        ),
        assignee:profiles!helpdesk_tickets_assigned_to_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url
        ),
        department:departments(*),
        location:locations(*)
      `);

    // Apply filters
    if (filters.status) {
      query = query.in('status', Array.isArray(filters.status) ? filters.status : [filters.status]);
    }
    if (filters.priority) {
      query = query.in('priority', Array.isArray(filters.priority) ? filters.priority : [filters.priority]);
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters.reported_by) {
      query = query.eq('reported_by', filters.reported_by);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,` +
        `description.ilike.%${filters.search}%`
      );
    }

    // Sorting
    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    // Pagination
    if (filters.page && filters.pageSize) {
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateTicketStatus(ticketId, status, updatedBy, notes = '') {
    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'Resolved' || status === 'Closed') {
      updates.resolved_date = new Date().toISOString();
      updates.resolution_notes = notes;
    }

    const { data, error } = await this.update(ticketId, updates);
    if (error) throw error;

    // Log the status change
    await this.addTicketComment(ticketId, {
      comment: `Status changed to ${status}: ${notes}`,
      is_system: true,
      created_by: updatedBy
    });

    return data;
  },

  async assignTicket(ticketId, assigneeId, assignedBy) {
    const { data, error } = await this.update(ticketId, {
      assigned_to: assigneeId,
      assigned_date: new Date().toISOString(),
      status: 'In Progress',
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    // Log the assignment
    const assignee = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', assigneeId)
      .single();

    const assigner = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', assignedBy)
      .single();

    await this.addTicketComment(ticketId, {
      comment: `Ticket assigned to ${assignee.data.first_name} ${assignee.data.last_name} by ${assigner.data.first_name} ${assigner.data.last_name}`,
      is_system: true,
      created_by: assignedBy
    });

    return data;
  },

  async addTicketComment(ticketId, commentData) {
    const { data, error } = await supabase
      .from('ticket_comments')
      .insert([{
        ticket_id: ticketId,
        ...commentData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Update ticket's updated_at timestamp
    await this.update(ticketId, {
      updated_at: new Date().toISOString()
    });

    return data;
  },

  async getTicketComments(ticketId) {
    const { data, error } = await supabase
      .from('ticket_comments')
      .select(`
        *,
        author:profiles!ticket_comments_created_by_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};

// Digital Services Management
export const digitalService = {
  ...new BaseITService('digital_services'),

  async getAvailableServices(userId = null) {
    let query = supabase
      .from('digital_services')
      .select(`
        *,
        categories:digital_service_categories(*)
      `)
      .eq('is_active', true)
      .order('service_name');

    // If user ID is provided, include subscription status
    if (userId) {
      query = query.select(`, 
        my_subscription:digital_service_subscriptions!inner(
          id,
          status,
          subscription_type,
          start_date,
          end_date
        )
      `);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async subscribeToService(serviceId, userId, subscriptionData) {
    // Check if service exists and is active
    const { data: service, error: serviceError } = await this.getById(serviceId);
    if (serviceError) throw serviceError;

    if (!service.is_active) {
      throw new Error('This service is not currently available for subscription');
    }

    // Check if user already has an active subscription
    const { data: existingSubscription, error: checkError } = await supabase
      .from('digital_service_subscriptions')
      .select('*')
      .eq('service_id', serviceId)
      .eq('subscriber_id', userId)
      .eq('status', 'Active')
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingSubscription) {
      throw new Error('You already have an active subscription to this service');
    }

    // Calculate end date based on subscription type
    const startDate = new Date();
    let endDate = new Date();
    
    switch (subscriptionData.subscription_type) {
      case 'Monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'Semester':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'Annual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create subscription
    const { data, error } = await supabase
      .from('digital_service_subscriptions')
      .insert([{
        service_id: serviceId,
        subscriber_id: userId,
        subscription_type: subscriptionData.subscription_type,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'Active',
        payment_status: 'Paid', // In a real app, this would come from payment processing
        payment_reference: subscriptionData.payment_reference,
        notes: subscriptionData.notes
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserSubscriptions(userId, status = 'Active') {
    const { data, error } = await supabase
      .from('digital_service_subscriptions')
      .select(`
        *,
        service:digital_services!inner(*)
      `)
      .eq('subscriber_id', userId)
      .eq('status', status)
      .order('end_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async cancelSubscription(subscriptionId, userId) {
    // Verify ownership
    const { data: subscription, error: checkError } = await supabase
      .from('digital_service_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('subscriber_id', userId)
      .single();

    if (checkError) throw checkError;

    // Update subscription status
    const { data, error } = await supabase
      .from('digital_service_subscriptions')
      .update({
        status: 'Cancelled',
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Export all services
export default {
  assets: assetService,
  licenses: licenseService,
  helpdesk: helpdeskService,
  digital: digitalService
};
