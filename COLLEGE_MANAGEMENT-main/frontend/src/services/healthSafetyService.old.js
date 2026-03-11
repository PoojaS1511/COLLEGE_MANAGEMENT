import { supabase } from '../lib/supabase';

// Base service for common health and safety operations
class BaseHealthSafetyService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Common methods for all health and safety services
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

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}

// Incident Management Service
export const incidentService = {
  ...new BaseHealthSafetyService('incidents'),
  
  async reportIncident(incidentData) {
    const { data, error } = await supabase
      .from('incidents')
      .insert([{
        ...incidentData,
        status: 'reported',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async getIncidentDetails(incidentId) {
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        reported_by:profiles!incidents_reported_by_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        assigned_to:profiles!incidents_assigned_to_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        updates:incident_updates!incident_id(
          id,
          status,
          description,
          created_at,
          created_by:profiles!incident_updates_created_by_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', incidentId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateIncidentStatus(incidentId, status, resolutionDetails = null) {
    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (resolutionDetails) {
      updates.resolution_details = resolutionDetails;
      updates.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', incidentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addIncidentUpdate(incidentId, updateData) {
    const { data, error } = await supabase
      .from('incident_updates')
      .insert([{
        incident_id: incidentId,
        ...updateData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getIncidentCategories() {
    // This would typically come from a database table
    return [
      'Medical Emergency',
      'Security Breach',
      'Facility Issue',
      'Safety Hazard',
      'Other'
    ];
        status: 'Scheduled'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getInspectionsByInspector(inspectorId, status = null) {
    let query = supabase
      .from('safety_inspections')
      .select('*')
      .eq('inspector_id', inspectorId)
      .order('scheduled_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async completeInspection(inspectionId, findings, inspectorId) {
    const { data, error } = await supabase
      .from('safety_inspections')
      .update({
        status: 'Completed',
        inspection_date: new Date().toISOString(),
        findings: JSON.stringify(findings),
        inspected_by: inspectorId
      })
      .eq('id', inspectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getInspectionTemplates() {
    const { data, error } = await supabase
      .from('inspection_templates')
      .select('*')
      .eq('is_active', true)
      .order('template_name');

    if (error) throw error;
    return data || [];
  }
};

// First Aid Management Service
export const firstAidService = {
  ...new BaseHealthSafetyService('first_aid_kits'),

  async getKitInventory(kitId) {
    const { data, error } = await supabase
      .from('first_aid_kit_items')
      .select('*')
      .eq('kit_id', kitId)
      .order('item_name');

    if (error) throw error;
    return data || [];
  },

  async updateKitItem(kitId, itemId, updates) {
    const { data, error } = await supabase
      .from('first_aid_kit_items')
      .update(updates)
      .eq('id', itemId)
      .eq('kit_id', kitId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async logItemUsage(kitId, itemId, quantityUsed, usedBy, notes = '') {
    // Get current quantity
    const { data: item, error: itemError } = await supabase
      .from('first_aid_kit_items')
      .select('quantity')
      .eq('id', itemId)
      .single();

    if (itemError) throw itemError;

    if (item.quantity < quantityUsed) {
      throw new Error('Insufficient quantity available');
    }

    // Update quantity
    const { data: updatedItem, error: updateError } = await supabase
      .from('first_aid_kit_items')
      .update({ 
        quantity: item.quantity - quantityUsed,
        last_restocked: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log usage
    const { data: usageLog, error: logError } = await supabase
      .from('first_aid_usage_logs')
      .insert([{
        kit_id: kitId,
        item_id: itemId,
        quantity_used: quantityUsed,
        used_by: usedBy,
        notes: notes,
        usage_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (logError) throw logError;

    return {
      ...updatedItem,
      usage_log: usageLog
    };
  },

  async checkRestockNeeds(threshold = 5) {
    const { data, error } = await supabase
      .from('first_aid_kit_items')
      .select('*, kit:first_aid_kits(kit_number, location)')
      .lte('quantity', threshold)
      .order('quantity', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};

// Export all services
export default {
  incidents: incidentService,
  medical: medicalService,
  inspections: inspectionService,
  firstAid: firstAidService
};
