import React, { useState, useEffect } from 'react';
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import HostelService from '../../services/hostelService';

const StatusManagement = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    meal_type: '',
    status: 'active'
  });

  const fetchStatuses = async () => {
    try {
      const response = await HostelService.getMessStatuses();
      setStatuses(response);
    } catch (error) {
      console.error('Error fetching statuses:', error);
      toast.error('Failed to load statuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (status) => {
    setEditingId(status.id);
    setFormData({
      meal_type: status.meal_type,
      status: status.status
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      meal_type: '',
      status: 'active'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const statusData = {
        meal_type: formData.meal_type,
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      if (editingId) {
        await HostelService.updateMessStatus(editingId, statusData);
        toast.success('Status updated successfully');
      } else {
        await HostelService.createMessStatus(statusData);
        toast.success('Status added successfully');
      }
      
      setEditingId(null);
      setFormData({ meal_type: '', status: 'active' });
      await fetchStatuses();
    } catch (error) {
      console.error('Error saving status:', error);
      toast.error(`Failed to ${editingId ? 'update' : 'add'} status: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this status?')) {
      try {
        await HostelService.deleteMessStatus(id);
        toast.success('Status deleted successfully');
        await fetchStatuses();
      } catch (error) {
        console.error('Error deleting status:', error);
        toast.error(`Failed to delete status: ${error.message}`);
      }
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Mess Status Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage meal statuses for the hostel mess
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="meal_type" className="block text-sm font-medium text-gray-700">
                  Meal Type
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="meal_type"
                    id="meal_type"
                    required
                    value={formData.meal_type}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Breakfast, Lunch, Dinner"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingId ? (
                    <>
                      <CheckIcon className="-ml-1 mr-2 h-5 w-5" />
                      Update
                    </>
                  ) : (
                    <>
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      Add
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <XMarkIcon className="-ml-1 mr-2 h-5 w-5" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Current Statuses</h2>
        </div>

        {loading ? (
          <div className="px-6 py-4 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Meal Type
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Last Updated
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {statuses.length > 0 ? (
                  statuses.map((status) => (
                    <tr key={status.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {status.meal_type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status.status === 'active' ? 'bg-green-100 text-green-800' :
                          status.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                          status.status === 'delayed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {status.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(status.updated_at).toLocaleString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(status)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(status.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key="no-statuses">
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No statuses found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusManagement;