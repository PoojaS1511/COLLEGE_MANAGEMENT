import React from 'react';

const LibraryReservations = () => {
  // Mock data for reservations
  const reservations = [
    {
      id: 1,
      bookTitle: 'Design Patterns',
      bookAuthor: 'Erich Gamma',
      bookIsbn: '978-0201633610',
      reservedBy: 'Carol White',
      userId: 'S2023003',
      reservationDate: '2025-10-18',
      expiryDate: '2025-10-25',
      status: 'Pending'
    },
    {
      id: 2,
      bookTitle: 'The Pragmatic Programmer',
      bookAuthor: 'Andrew Hunt',
      bookIsbn: '978-0201616224',
      reservedBy: 'David Wilson',
      userId: 'S2023004',
      reservationDate: '2025-10-17',
      expiryDate: '2025-10-24',
      status: 'Ready for Pickup'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Book Reservations</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            New Reservation
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.bookTitle}</div>
                    <div className="text-sm text-gray-500">{reservation.bookAuthor}</div>
                    <div className="text-xs text-gray-400">ISBN: {reservation.bookIsbn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.reservedBy}</div>
                    <div className="text-sm text-gray-500">{reservation.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.reservationDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      reservation.status === 'Expired' ? 'text-red-600 font-medium' : 'text-gray-900'
                    }`}>
                      {reservation.expiryDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reservation.status === 'Ready for Pickup' 
                        ? 'bg-green-100 text-green-800' 
                        : reservation.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {reservation.status === 'Ready for Pickup' && (
                      <button className="text-green-600 hover:text-green-900 mr-4">Check Out</button>
                    )}
                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LibraryReservations;
