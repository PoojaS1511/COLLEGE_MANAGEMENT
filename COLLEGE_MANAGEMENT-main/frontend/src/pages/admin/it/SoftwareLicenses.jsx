import React, { useState } from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const SoftwareLicenses = () => {
  // Mock data for software licenses
  const [licenses, setLicenses] = useState([
    {
      id: 1,
      name: 'Adobe Creative Cloud',
      version: '2025',
      type: 'Subscription',
      totalSeats: 50,
      usedSeats: 48,
      expiryDate: '2025-12-31',
      status: 'active',
      vendor: 'Adobe Inc.',
      cost: 2500,
      renewalDate: '2025-12-01'
    },
    {
      id: 2,
      name: 'Microsoft Office 365',
      version: '2025',
      type: 'Subscription',
      totalSeats: 200,
      usedSeats: 187,
      expiryDate: '2025-06-30',
      status: 'active',
      vendor: 'Microsoft',
      cost: 5000,
      renewalDate: '2025-06-01'
    },
    {
      id: 3,
      name: 'MATLAB',
      version: '2025a',
      type: 'Perpetual',
      totalSeats: 30,
      usedSeats: 22,
      expiryDate: '2026-01-15',
      status: 'active',
      vendor: 'MathWorks',
      cost: 3500,
      renewalDate: '2025-12-15'
    },
    {
      id: 4,
      name: 'AutoCAD',
      version: '2025',
      type: 'Subscription',
      totalSeats: 20,
      usedSeats: 20,
      expiryDate: '2025-03-15',
      status: 'warning',
      vendor: 'Autodesk',
      cost: 1800,
      renewalDate: '2025-03-01'
    },
    {
      id: 5,
      name: 'Tableau Desktop',
      version: '2024.1',
      type: 'Subscription',
      totalSeats: 15,
      usedSeats: 10,
      expiryDate: '2024-12-31',
      status: 'expired',
      vendor: 'Tableau',
      cost: 1500,
      renewalDate: '2024-12-01'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddLicense, setShowAddLicense] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [newLicense, setNewLicense] = useState({
    name: '',
    version: '',
    type: 'Perpetual',
    totalSeats: 1,
    expiryDate: '',
    vendor: '',
    cost: 0,
    renewalDate: '',
    notes: ''
  });

  const filteredLicenses = licenses.filter(license => 
    license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.version.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLicense = (e) => {
    e.preventDefault();
    const newId = Math.max(...licenses.map(l => l.id), 0) + 1;
    const licenseToAdd = {
      ...newLicense,
      id: newId,
      usedSeats: 0,
      status: new Date(newLicense.expiryDate) > new Date() ? 'active' : 'expired'
    };
    setLicenses([...licenses, licenseToAdd]);
    setShowAddLicense(false);
    setNewLicense({
      name: '',
      version: '',
      type: 'Perpetual',
      totalSeats: 1,
      expiryDate: '',
      vendor: '',
      cost: 0,
      renewalDate: '',
      notes: ''
    });
  };

  const handleUpdateLicense = (e) => {
    e.preventDefault();
    setLicenses(licenses.map(license => 
      license.id === editingLicense.id ? { ...editingLicense } : license
    ));
    setEditingLicense(null);
  };

  const handleDeleteLicense = (id) => {
    if (window.confirm('Are you sure you want to delete this license?')) {
      setLicenses(licenses.filter(license => license.id !== id));
    }
  };

  const handleEditClick = (license) => {
    setEditingLicense({...license});
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSeatUsage = (used, total) => {
    const percentage = (used / total) * 100;
    let color = 'bg-green-500';
    if (percentage > 90) color = 'bg-red-500';
    else if (percentage > 70) color = 'bg-yellow-500';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${color}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="relative rounded-md shadow-sm w-full sm:max-w-xs mb-4 sm:mb-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search licenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setShowAddLicense(true)}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add License
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Software
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seats
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLicenses.map((license) => (
                <tr key={license.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-md">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{license.name}</div>
                        <div className="text-sm text-gray-500">v{license.version}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {license.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {license.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {license.usedSeats} / {license.totalSeats}
                    </div>
                    <div className="mt-1 w-32">
                      {getSeatUsage(license.usedSeats, license.totalSeats)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(license.expiryDate).toLocaleDateString()}
                    <div className="text-xs text-gray-400">
                      {license.renewalDate ? `Renews: ${new Date(license.renewalDate).toLocaleDateString()}` : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(license.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(license)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLicense(license.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add License Modal */}
      {showAddLicense && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Software License</h3>
                  <div className="mt-4">
                    <form onSubmit={handleAddLicense}>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Software Name</label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLicense.name}
                            onChange={(e) => setNewLicense({...newLicense, name: e.target.value})}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Vendor</label>
                          <input
                            type="text"
                            name="vendor"
                            id="vendor"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLicense.vendor}
                            onChange={(e) => setNewLicense({...newLicense, vendor: e.target.value})}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="version" className="block text-sm font-medium text-gray-700">Version</label>
                          <input
                            type="text"
                            name="version"
                            id="version"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLicense.version}
                            onChange={(e) => setNewLicense({...newLicense, version: e.target.value})}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">License Type</label>
                          <select
                            id="type"
                            name="type"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={newLicense.type}
                            onChange={(e) => setNewLicense({...newLicense, type: e.target.value})}
                          >
                            <option value="Perpetual">Perpetual</option>
                            <option value="Subscription">Subscription</option>
                            <option value="Annual">Annual</option>
                            <option value="Free">Free/Open Source</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="totalSeats" className="block text-sm font-medium text-gray-700">Total Seats</label>
                          <input
                            type="number"
                            name="totalSeats"
                            id="totalSeats"
                            min="1"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLicense.totalSeats}
                            onChange={(e) => setNewLicense({...newLicense, totalSeats: parseInt(e.target.value) || 1})}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                          <input
                            type="date"
                            name="expiryDate"
                            id="expiryDate"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLicense.expiryDate}
                            onChange={(e) => setNewLicense({...newLicense, expiryDate: e.target.value})}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="renewalDate" className="block text-sm font-medium text-gray-700">Renewal Date</label>
                          <input
                            type="date"
                            name="renewalDate"
                            id="renewalDate"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLicense.renewalDate}
                            onChange={(e) => setNewLicense({...newLicense, renewalDate: e.target.value})}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Cost (USD)</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              name="cost"
                              id="cost"
                              min="0"
                              step="0.01"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              value={newLicense.cost}
                              onChange={(e) => setNewLicense({...newLicense, cost: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-6">
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLicense.notes}
                            onChange={(e) => setNewLicense({...newLicense, notes: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                        >
                          Add License
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => setShowAddLicense(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit License Modal */}
      {editingLicense && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Software License</h3>
                  <div className="mt-4">
                    <form onSubmit={handleUpdateLicense}>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Software Name</label>
                          <input
                            type="text"
                            name="edit-name"
                            id="edit-name"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={editingLicense.name}
                            onChange={(e) => setEditingLicense({...editingLicense, name: e.target.value})}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="edit-vendor" className="block text-sm font-medium text-gray-700">Vendor</label>
                          <input
                            type="text"
                            name="edit-vendor"
                            id="edit-vendor"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={editingLicense.vendor}
                            onChange={(e) => setEditingLicense({...editingLicense, vendor: e.target.value})}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="edit-version" className="block text-sm font-medium text-gray-700">Version</label>
                          <input
                            type="text"
                            name="edit-version"
                            id="edit-version"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={editingLicense.version}
                            onChange={(e) => setEditingLicense({...editingLicense, version: e.target.value})}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700">License Type</label>
                          <select
                            id="edit-type"
                            name="edit-type"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={editingLicense.type}
                            onChange={(e) => setEditingLicense({...editingLicense, type: e.target.value})}
                          >
                            <option value="Perpetual">Perpetual</option>
                            <option value="Subscription">Subscription</option>
                            <option value="Annual">Annual</option>
                            <option value="Free">Free/Open Source</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="edit-totalSeats" className="block text-sm font-medium text-gray-700">Total Seats</label>
                          <input
                            type="number"
                            name="edit-totalSeats"
                            id="edit-totalSeats"
                            min="1"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={editingLicense.totalSeats}
                            onChange={(e) => setEditingLicense({...editingLicense, totalSeats: parseInt(e.target.value) || 1})}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="edit-usedSeats" className="block text-sm font-medium text-gray-700">Used Seats</label>
                          <input
                            type="number"
                            name="edit-usedSeats"
                            id="edit-usedSeats"
                            min="0"
                            max={editingLicense.totalSeats}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={editingLicense.usedSeats}
                            onChange={(e) => {
                              const usedSeats = Math.min(parseInt(e.target.value) || 0, editingLicense.totalSeats);
                              setEditingLicense({...editingLicense, usedSeats});
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="edit-expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                          <input
                            type="date"
                            name="edit-expiryDate"
                            id="edit-expiryDate"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={editingLicense.expiryDate}
                            onChange={(e) => setEditingLicense({
                              ...editingLicense, 
                              expiryDate: e.target.value,
                              status: new Date(e.target.value) > new Date() ? 'active' : 'expired'
                            })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="edit-renewalDate" className="block text-sm font-medium text-gray-700">Renewal Date</label>
                          <input
                            type="date"
                            name="edit-renewalDate"
                            id="edit-renewalDate"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={editingLicense.renewalDate || ''}
                            onChange={(e) => setEditingLicense({...editingLicense, renewalDate: e.target.value})}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="edit-cost" className="block text-sm font-medium text-gray-700">Cost (USD)</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              name="edit-cost"
                              id="edit-cost"
                              min="0"
                              step="0.01"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              value={editingLicense.cost}
                              onChange={(e) => setEditingLicense({...editingLicense, cost: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">Status</label>
                          <select
                            id="edit-status"
                            name="edit-status"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={editingLicense.status}
                            onChange={(e) => setEditingLicense({...editingLicense, status: e.target.value})}
                          >
                            <option value="active">Active</option>
                            <option value="warning">Warning</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => setEditingLicense(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoftwareLicenses;
