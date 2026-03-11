import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const Rules = () => {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        console.log('Fetching hostel rules...');
        
        const { data, error } = await supabase
          .from('hostel_rules')
          .select('*')
          .single();  // Using single() since we expect one row with all rules

        if (error) throw error;

        if (!data) {
          console.warn('No rules data found');
          return;
        }

        console.log('Fetched rules data:', data);
        setRules(data);
        
      } catch (err) {
        console.error('Error fetching rules:', err);
        setError(`Failed to load rules: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const renderJsonSection = (title, data) => {
    if (!data) return null;

    const formatJsonData = (data) => {
      if (Array.isArray(data)) {
        return (
          <ul className="list-disc pl-5 space-y-2">
            {data.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        );
      }

      // Handle common JSON structures
      if (title === "Mess Timings") {
        return (
          <div className="space-y-2">
            {data.breakfast && <p>🍳 <span className="font-medium">Breakfast:</span> {data.breakfast}</p>}
            {data.lunch && <p>🍲 <span className="font-medium">Lunch:</span> {data.lunch}</p>}
            {data.dinner && <p>🍽️ <span className="font-medium">Dinner:</span> {data.dinner}</p>}
          </div>
        );
      }

      if (title === "Gate Timings") {
        return (
          <div className="space-y-2">
            {data.in_time && <p>🚪 <span className="font-medium">In Time:</span> {data.in_time}</p>}
            {data.late_permission && <p>⏰ <span className="font-medium">Late Permission:</span> {data.late_permission}</p>}
          </div>
        );
      }

      // Default JSON display
      return (
        <div className="bg-gray-50 p-4 rounded-md">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    };

    return (
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
        {formatJsonData(data)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Hostel Rules & Regulations</h1>
        
        {!rules ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rules available</h3>
            <p className="mt-1 text-sm text-gray-500">The hostel rules have not been published yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {rules.general_rules && renderJsonSection("General Rules", rules.general_rules)}
            {rules.mess_timings && renderJsonSection("Mess Timings", rules.mess_timings)}
            {rules.gate_timings && renderJsonSection("Gate Timings", rules.gate_timings)}
            {rules.prohibited_items && renderJsonSection("Prohibited Items", rules.prohibited_items)}
            {rules.consequences && renderJsonSection("Consequences of Violations", rules.consequences)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rules;
