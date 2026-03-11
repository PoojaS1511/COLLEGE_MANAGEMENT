import React, { useState } from 'react';
import { 
  ClockIcon, 
  UserCircleIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  PlusIcon, 
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const LostFound = () => {
  // Mock data for lost items
  const [lostItems, setLostItems] = useState([
    {
      id: 1,
      itemName: 'Laptop Bag',
      description: 'Black Lenovo laptop bag with a blue water bottle in the side pocket',
      locationFound: 'Main Library - 2nd Floor',
      dateFound: '2025-10-17',
      timeFound: '14:30',
      foundBy: 'Custodian - Maria Garcia',
      status: 'unclaimed',
      claimedBy: null,
      claimedDate: null
    },
    {
      id: 2,
      itemName: 'Wireless Earbuds',
      description: 'White Apple AirPods in a black case',
      locationFound: 'Student Center - Cafeteria',
      dateFound: '2025-10-18',
      timeFound: '12:15',
      foundBy: 'Staff - John Smith',
      status: 'claimed',
      claimedBy: 'S2023001 - John Doe',
      claimedDate: '2025-10-18 15:30'
    },
  ]);

  // Mock data for found items
  const [foundItems, setFoundItems] = useState([
    {
      id: 1,
      itemName: 'Student ID Card',
      description: 'Student ID for Jane Smith (S2023002)',
      locationLost: 'Science Building - Room 203',
      dateReported: '2025-10-18',
      reportedBy: 'Jane Smith (S2023002)',
      contactInfo: 'jane.smith@university.edu',
      status: 'reported',
      resolved: false
    },
    {
      id: 2,
      itemName: 'Textbook - Biology 101',
      description: 'Hardcover, 5th edition, with notes in margins',
      locationLost: 'Library - Study Area B',
      dateReported: '2025-10-17',
      reportedBy: 'Robert Johnson (S2023003)',
      contactInfo: 'robert.j@university.edu',
      status: 'resolved',
      resolved: true,
      resolvedDate: '2025-10-17 16:45',
      resolvedBy: 'Librarian - Sarah Williams'
    },
  ]);

  const [activeTab, setActiveTab] = useState('found');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewItem, setShowNewItem] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(null);

  const markAsClaimed = (id, claimedBy) => {
    const now = new Date();
    setLostItems(lostItems.map(item => 
      item.id === id 
        ? { 
            ...item, 
            status: 'claimed', 
            claimedBy,
            claimedDate: now.toISOString()
          } 
        : item
    ));
    setShowClaimForm(null);
  };

  const markAsResolved = (id) => {
    const now = new Date();
    setFoundItems(foundItems.map(item => 
      item.id === id 
        ? { 
            ...item, 
            status: 'resolved',
            resolved: true,
            resolvedDate: now.toISOString(),
            resolvedBy: 'Admin User' // This would be the logged-in user in a real app
          } 
        : item
    ));
  };

  const addNewItem = (newItem) => {
    if (activeTab === 'found') {
      setLostItems([{
        ...newItem,
        id: Math.max(0, ...lostItems.map(i => i.id)) + 1,
        status: 'unclaimed',
        dateFound: new Date().toISOString().split('T')[0],
        timeFound: new Date().toTimeString().substring(0, 5)
      }, ...lostItems]);
    } else {
      setFoundItems([{
        ...newItem,
        id: Math.max(0, ...foundItems.map(i => i.id)) + 1,
        status: 'reported',
        dateReported: new Date().toISOString().split('T')[0],
        resolved: false
      }, ...foundItems]);
    }
    setShowNewItem(false);
  };

  const filteredLostItems = lostItems.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.claimedBy && item.claimedBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredFoundItems = foundItems.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative rounded-md shadow-sm w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowNewItem(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {activeTab === 'found' ? 'Add Found Item' : 'Report Lost Item'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('found')}
            className={`${activeTab === 'found' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Found Items
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`${activeTab === 'lost' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Lost Items
          </button>
        </nav>
      </div>

      {/* Found Items Tab */}
      {activeTab === 'found' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredLostItems.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No found items</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new found item.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredLostItems.map((item) => (
                <li key={item.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                          <div className="text-sm text-gray-500">
                            Found on {item.dateFound} at {item.timeFound}
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {item.status === 'unclaimed' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Unclaimed
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Claimed by {item.claimedBy}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Description:</span> {item.description}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Found at:</span> {item.locationFound}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Found by:</span> {item.foundBy}
                      </p>
                      {item.status === 'claimed' && (
                        <p className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Claimed on:</span> {new Date(item.claimedDate).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {item.status === 'unclaimed' && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => setShowClaimForm(item.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Mark as Claimed
                        </button>
                      </div>
                    )}
                    {showClaimForm === item.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <div className="flex">
                          <div className="flex-1">
                            <label htmlFor={`claimant-${item.id}`} className="block text-sm font-medium text-gray-700">
                              Claimant Information
                            </label>
                            <input
                              type="text"
                              id={`claimant-${item.id}`}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Enter name and ID (e.g., John Doe - S2023001)"
                            />
                          </div>
                          <div className="ml-2 flex items-end">
                            <button
                              onClick={() => {
                                const claimant = document.getElementById(`claimant-${item.id}`).value;
                                if (claimant.trim()) {
                                  markAsClaimed(item.id, claimant);
                                }
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-l-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircleIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowClaimForm(null)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-r-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <XMarkIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Lost Items Tab */}
      {activeTab === 'lost' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredFoundItems.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No lost items reported</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by reporting a lost item.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredFoundItems.map((item) => (
                <li key={item.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-red-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                          <div className="text-sm text-gray-500">
                            Reported by {item.reportedBy} on {item.dateReported}
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {item.resolved ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Resolved
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Description:</span> {item.description}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Lost at:</span> {item.locationLost}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Contact:</span> {item.contactInfo}
                      </p>
                      {item.resolved && (
                        <div className="mt-2 p-2 bg-green-50 rounded-md">
                          <p className="text-sm text-green-700">
                            <span className="font-medium">Resolved on {new Date(item.resolvedDate).toLocaleDateString()}</span> by {item.resolvedBy}
                          </p>
                        </div>
                      )}
                    </div>
                    {!item.resolved && (
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={() => markAsResolved(item.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircleIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
                          Mark as Resolved
                        </button>
                        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Contact Reporter
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* New Item Modal */}
      {showNewItem && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {activeTab === 'found' ? 'Add Found Item' : 'Report Lost Item'}
                  </h3>
                  <div className="mt-4">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 text-left">
                          Item Name
                        </label>
                        <input
                          type="text"
                          name="itemName"
                          id="itemName"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="e.g., Laptop, Wallet, Keys, etc."
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-left">
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows="3"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Provide a detailed description of the item"
                        ></textarea>
                      </div>
                      {activeTab === 'found' ? (
                        <>
                          <div className="sm:col-span-4">
                            <label htmlFor="locationFound" className="block text-sm font-medium text-gray-700 text-left">
                              Where was it found?
                            </label>
                            <input
                              type="text"
                              name="locationFound"
                              id="locationFound"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="e.g., Main Library - 2nd Floor, Room 203"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label htmlFor="foundBy" className="block text-sm font-medium text-gray-700 text-left">
                              Found by
                            </label>
                            <input
                              type="text"
                              name="foundBy"
                              id="foundBy"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Your name"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="sm:col-span-4">
                            <label htmlFor="locationLost" className="block text-sm font-medium text-gray-700 text-left">
                              Where was it lost?
                            </label>
                            <input
                              type="text"
                              name="locationLost"
                              id="locationLost"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="e.g., Science Building - Room 203"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label htmlFor="reportedBy" className="block text-sm font-medium text-gray-700 text-left">
                              Your Name
                            </label>
                            <input
                              type="text"
                              name="reportedBy"
                              id="reportedBy"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Your name"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 text-left">
                              Contact Information
                            </label>
                            <input
                              type="text"
                              name="contactInfo"
                              id="contactInfo"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Email or phone number"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  onClick={() => {
                    const formData = {
                      itemName: document.getElementById('itemName').value,
                      description: document.getElementById('description').value,
                      ...(activeTab === 'found' 
                        ? {
                            locationFound: document.getElementById('locationFound').value,
                            foundBy: document.getElementById('foundBy').value
                          }
                        : {
                            locationLost: document.getElementById('locationLost').value,
                            reportedBy: document.getElementById('reportedBy').value,
                            contactInfo: document.getElementById('contactInfo').value
                          }
                      )
                    };
                    addNewItem(formData);
                  }}
                >
                  {activeTab === 'found' ? 'Add Found Item' : 'Report Lost Item'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowNewItem(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFound;
