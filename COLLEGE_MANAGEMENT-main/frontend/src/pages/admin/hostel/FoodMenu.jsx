import React, { useState, useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import HostelService from '../../../services/hostelService';

const FoodMenu = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState(null);
  const [form, setForm] = useState({
    morning: '',
    breakfast: '',
    lunch: '',
    evening: '',
    dinner: ''
  });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      // Initialize menu if empty
      await HostelService.initializeWeeklyMenu();
      // Fetch the menu
      const data = await HostelService.getWeeklyMenu();
      setMenu(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      // Remove message.error if you're not using antd, or import it at the top
      // message.error('Failed to load food menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleEdit = (day) => {
    const dayMenu = menu.find(item => item.day === day) || {};
    setEditingDay(day);
    setForm({
      morning: dayMenu.morning || '',
      breakfast: dayMenu.breakfast || '',
      lunch: dayMenu.lunch || '',
      evening: dayMenu.evening || '',
      dinner: dayMenu.dinner || ''
    });
    setIsModalVisible(true);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      await HostelService.updateDailyMenu(editingDay, form);
      await fetchMenu(); // Refresh the menu
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error updating menu:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Ensure all days are shown, even if not in the database yet
  const fullMenu = daysOfWeek.map(day => {
    const existingDay = menu.find(item => item.day === day);
    return existingDay || {
      day,
      morning: '',
      breakfast: '',
      lunch: '',
      evening: '',
      dinner: ''
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Weekly Food Menu</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Morning
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Breakfast
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lunch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evening
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dinner
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fullMenu.map((item) => (
                <tr key={item.day} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.day}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                    {item.morning || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                    {item.breakfast || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                    {item.lunch || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                    {item.evening || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                    {item.dinner || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item.day)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Menu - {editingDay}
              </h3>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}>
                {['morning', 'breakfast', 'lunch', 'evening', 'dinner'].map((meal) => (
                  <div key={meal} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {meal}
                    </label>
                    <textarea
                      name={meal}
                      value={form[meal] || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      required
                    />
                  </div>
                ))}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalVisible(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodMenu;
