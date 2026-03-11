import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../../services/api';
import { getSupabase } from '../../lib/supabase';

const supabase = getSupabase();
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon as StarIconOutline,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const MenuItemsManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    day: '',
    meal: 'breakfast',
    time: '',
    items: [{ name: '', type: 'veg' }],
    is_weekly_default: false,
    is_special: false
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

  const fetchMenuItems = async () => {
    try {
      console.log('Fetching menu items...');
      const response = await apiService.getMenuItems();
      console.log('API Response:', response);
      
      if (response && response.success) {
        console.log('Menu items data:', response.data);
        setMenuItems(response.data || []);
      } else {
        const errorMessage = response?.message || 'Failed to load menu items';
        console.error('Error in fetchMenuItems:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Unexpected error in fetchMenuItems:', error);
      toast.error('An unexpected error occurred while fetching menu items');
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Supabase query error:', error);
        toast.error(`Database error: ${error.message}`);
        return false;
      }
      
      console.log('Supabase connection successful. First item:', data[0]);
      toast.success(`Successfully connected to the database. Found ${data.length} menu items.`);
      return true;
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
      toast.error(`Failed to connect to database: ${error.message}`);
      return false;
    }
  };

  const addTestMenuItem = async () => {
    try {
      const testItem = {
        day: 'Monday',
        meal: 'lunch',
        time: '12:30 PM',
        items: [
          { name: 'Pasta', type: 'veg' },
          { name: 'Salad', type: 'veg' }
        ],
        is_approved: true,
        is_weekly_default: false,
        is_special: false
      };

      const response = await apiService.createMenuItem(testItem);
      
      if (response && response.success) {
        console.log('Test menu item added:', response.data);
        toast.success('Test menu item added successfully');
        fetchMenuItems();
      } else {
        throw new Error(response?.message || 'Failed to add test item');
      }
    } catch (error) {
      console.error('Error adding test menu item:', error);
      toast.error('Failed to add test menu item');
    }
  };

  useEffect(() => {
    testSupabaseConnection();
    fetchMenuItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', type: 'veg' }]
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = [...formData.items];
      updatedItems.splice(index, 1);
      setFormData((prev) => ({ ...prev, items: updatedItems }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.updateMenuItem(editingId, formData);
        toast.success('Menu item updated successfully');
      } else {
        await apiService.createMenuItem(formData);
        toast.success('Menu item added successfully');
      }
      setEditingId(null);
      setFormData({
        day: '',
        meal: 'breakfast',
        time: '',
        items: [{ name: '', type: 'veg' }],
        is_weekly_default: false,
        is_special: false
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error(`Failed to ${editingId ? 'update' : 'add'} menu item`);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      day: item.day,
      meal: item.meal,
      time: item.time,
      items: item.items,
      is_weekly_default: item.is_weekly_default,
      is_special: item.is_special
    });
    document.getElementById('menu-item-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await apiService.deleteMenuItem(id);
        toast.success('Menu item deleted successfully');
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.error('Failed to delete menu item');
      }
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      await apiService.updateMenuItem(id, { is_approved: !currentStatus });
      toast.success(`Menu item ${!currentStatus ? 'approved' : 'unapproved'}`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating approval status:', error);
      toast.error('Failed to update approval status');
    }
  };

  const toggleWeeklyDefault = async (id, currentStatus) => {
    try {
      await apiService.updateMenuItem(id, { is_weekly_default: !currentStatus });
      toast.success(`Menu item ${!currentStatus ? 'set as' : 'removed from'} weekly default`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating weekly default status:', error);
      toast.error('Failed to update weekly default status');
    }
  };

  const toggleSpecial = async (id, currentStatus) => {
    try {
      await apiService.updateMenuItem(id, { is_special: !currentStatus });
      toast.success(`Menu item marked as ${!currentStatus ? 'special' : 'regular'}`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating special status:', error);
      toast.error('Failed to update special status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Menu Items Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage the hostel menu items, including daily specials and weekly defaults.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({
                day: '',
                meal: 'breakfast',
                time: '',
                items: [{ name: '', type: 'veg' }],
                is_weekly_default: false,
                is_special: false
              });
              document.getElementById('menu-item-form').scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Day
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Meal
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Items
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {menuItems.length > 0 ? (
                    menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {item.day}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                          {item.meal}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.time}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="space-y-1">
                            {item.items.map((menuItem, idx) => (
                              <div
                                key={idx}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  menuItem.type === 'veg'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                } mr-2 mb-1`}
                              >
                                {menuItem.name}
                                <span className="ml-1">
                                  {menuItem.type === 'veg' ? '🌱' : '🍗'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.is_approved
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {item.is_approved ? 'Approved' : 'Pending'}
                            </span>
                            {item.is_weekly_default && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Weekly Default
                              </span>
                            )}
                            {item.is_special && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Special
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center space-x-2 justify-end">
                            <button
                              onClick={() => toggleApproval(item.id, item.is_approved)}
                              className="text-gray-400 hover:text-gray-500"
                              title={item.is_approved ? 'Unapprove' : 'Approve'}
                            >
                              {item.is_approved ? (
                                <XCircleIcon className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              )}
                            </button>

                            <button
                              onClick={() => toggleWeeklyDefault(item.id, item.is_weekly_default)}
                              className="text-gray-400 hover:text-yellow-500"
                              title={
                                item.is_weekly_default
                                  ? 'Remove from weekly default'
                                  : 'Set as weekly default'
                              }
                            >
                              {item.is_weekly_default ? (
                                <StarIconSolid className="h-5 w-5 text-yellow-400" />
                              ) : (
                                <StarIconOutline className="h-5 w-5 text-gray-400" />
                              )}
                            </button>

                            <button
                              onClick={() => toggleSpecial(item.id, item.is_special)}
                              className="text-gray-400 hover:text-purple-500"
                              title={item.is_special ? 'Mark as regular' : 'Mark as special'}
                            >
                              {item.is_special ? (
                                <StarIconSolid className="h-5 w-5 text-purple-500" />
                              ) : (
                                <StarIconOutline className="h-5 w-5 text-gray-400" />
                              )}
                            </button>

                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-3 py-4 text-sm text-gray-500 text-center">
                        No menu items found. Add your first menu item to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div id="menu-item-form" className="mt-10">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {editingId
                  ? 'Update the menu item details below.'
                  : 'Fill in the details to add a new menu item.'}
              </p>
            </div>
          </div>

          <div className="mt-5 md:col-span-2 md:mt-0">
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                        Day
                      </label>
                      <select
                        id="day"
                        name="day"
                        value={formData.day}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Select a day</option>
                        {days.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="meal" className="block text-sm font-medium text-gray-700">
                        Meal Type
                      </label>
                      <select
                        id="meal"
                        name="meal"
                        value={formData.meal}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        required
                      >
                        {mealTypes.map((meal) => (
                          <option key={meal} value={meal}>
                            {meal.charAt(0).toUpperCase() + meal.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                        Time
                      </label>
                      <input
                        type="time"
                        name="time"
                        id="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <div className="flex items-center mt-6">
                        <input
                          id="is_weekly_default"
                          name="is_weekly_default"
                          type="checkbox"
                          checked={formData.is_weekly_default}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="is_weekly_default"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Set as weekly default
                        </label>
                      </div>

                      <div className="flex items-center mt-2">
                        <input
                          id="is_special"
                          name="is_special"
                          type="checkbox"
                          checked={formData.is_special}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label
                          htmlFor="is_special"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Mark as special
                        </label>
                      </div>
                    </div>

                    <div className="col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Menu Items</label>
                      <div className="mt-1 space-y-2">
                        {formData.items.map((item, index) => (
                          <div key={index} className="flex space-x-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              placeholder="Item name"
                              className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                              required
                            />
                            <select
                              value={item.type}
                              onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                              className="rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="veg">Veg</option>
                              <option value="non-veg">Non-Veg</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeItemRow(index)}
                              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addItemRow}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <PlusIcon className="-ml-1 mr-1 h-4 w-4" />
                          Add Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          day: '',
                          meal: 'breakfast',
                          time: '',
                          items: [{ name: '', type: 'veg' }],
                          is_weekly_default: false,
                          is_special: false
                        });
                      }}
                      className="mr-3 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {editingId ? 'Update' : 'Save'} Menu Item
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemsManagement;