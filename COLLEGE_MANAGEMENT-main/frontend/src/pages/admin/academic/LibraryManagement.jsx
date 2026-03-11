import React from 'react';
import { Routes, Route, Link, useLocation, Outlet } from 'react-router-dom';
import LibraryCatalog from './library/LibraryCatalog';
import LibraryLoans from './library/LibraryLoans';
import LibraryFines from './library/LibraryFines';
import LibraryMembers from './library/LibraryMembers';
import LibraryReservations from './library/LibraryReservations';

const LibraryManagement = () => {
  const location = useLocation();
  const path = location.pathname.split('/').pop() || 'catalog';

  const tabs = [
    { id: 'catalog', name: 'Catalog', component: <LibraryCatalog /> },
    { id: 'loans', name: 'Loans', component: <LibraryLoans /> },
    { id: 'reservations', name: 'Reservations', component: <LibraryReservations /> },
    { id: 'fines', name: 'Fines', component: <LibraryFines /> },
    { id: 'members', name: 'Members', component: <LibraryMembers /> },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Library Management</h1>
            <p className="text-gray-600">Manage library resources, track loans, and handle reservations</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={`/admin/academic/library/${tab.id}`}
                className={`px-6 py-4 text-sm font-medium ${
                  path === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <Routes>
            <Route path="/" element={<LibraryCatalog />} />
            <Route path="catalog" element={<LibraryCatalog />} />
            <Route path="loans" element={<LibraryLoans />} />
            <Route path="reservations" element={<LibraryReservations />} />
            <Route path="fines" element={<LibraryFines />} />
            <Route path="members" element={<LibraryMembers />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default LibraryManagement;
