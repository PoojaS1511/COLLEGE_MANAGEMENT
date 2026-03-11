import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      student_id,
      fee_structure_id,
      amount,
      payment_date,
      payment_method,
      transaction_id,
      fee_type,
      academic_year,
      semester,
      status,
      notes,
    } = req.body;

    // Insert the payment record into the database
    const { data, error } = await supabase
      .from('fee_payments')
      .insert([
        {
          student_id,
          fee_structure_id,
          amount: parseFloat(amount),
          payment_date: payment_date || new Date().toISOString(),
          payment_method: payment_method || 'cash',
          transaction_id: transaction_id || `TXN-${Date.now()}`,
          fee_type: fee_type || 'Tuition',
          academic_year: academic_year || new Date().getFullYear().toString(),
          semester: semester || '1',
          status: status || 'paid',
          notes: notes || '',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(400).json({
        error: 'Failed to record payment',
        details: error.message,
      });
    }

    return res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
