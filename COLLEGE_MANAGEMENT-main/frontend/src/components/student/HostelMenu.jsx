import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const HostelMenu = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        console.log('Fetching hostel menu...');
        
        // Directly fetch from weekly_menu table
        const { data, error, status, statusText } = await supabase
          .from('weekly_menu')
          .select('*')
          .order('day', { ascending: true });

        console.log('Weekly menu data:', data);
        
        if (error) {
          console.error('Supabase error:', error);
          if (error.code === '42P01') { // Table does not exist
            throw new Error('The weekly menu table does not exist in the database.');
          } else if (error.code === '42501') { // Permission denied
            throw new Error('You do not have permission to access the weekly menu.');
          }
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn('No menu data found in weekly_menu table');
          setMenu([]);
          return;
        }
        
        setMenu(data);
        
      } catch (err) {
        console.error('Error fetching menu:', {
          message: err.message,
          name: err.name,
          code: err.code,
          stack: err.stack
        });
        
        setError(`Failed to load menu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Weekly Hostel Menu</h1>
        
        {menu.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No menu available</h3>
            <p className="mt-1 text-sm text-gray-500">The weekly menu has not been published yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breakfast</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning Snack</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lunch</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evening Snack</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dinner</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menu.map((item) => (
                  <tr key={item.day} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{item.day}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{item.breakfast}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{item.morning}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{item.lunch}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{item.evening}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{item.dinner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelMenu;
