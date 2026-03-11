import React, { useState, useEffect } from 'react';
import { 
  ComputerDesktopIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { addDays, format, isWithinInterval, parseISO, startOfToday, isBefore, isAfter, isToday } from 'date-fns';

const ComputerLabs = () => {
  // Mock data for computer labs
  const [labs, setLabs] = useState([
    { 
      id: 1, 
      name: 'Computer Lab A', 
      building: 'Science Building', 
      room: 'A101', 
      capacity: 30, 
      availableComputers: 25,
      status: 'Operational',
      reservations: [
        {
          id: 1,
          title: 'CS101 - Intro to Programming',
          instructor: 'Dr. Smith',
          courseCode: 'CS101',
          date: '2025-10-20',
          startTime: '09:00',
          endTime: '11:00',
          recurring: 'weekly',
          recurringEndDate: '2025-12-15',
          status: 'approved',
          requestedBy: 'jsmith@university.edu',
          requestedAt: '2025-10-10T14:30:00Z'
        },
        {
          id: 2,
          title: 'CS201 - Data Structures',
          instructor: 'Dr. Johnson',
          courseCode: 'CS201',
          date: '2025-10-21',
          startTime: '13:00',
          endTime: '15:00',
          recurring: 'biweekly',
          recurringEndDate: '2025-12-16',
          status: 'approved',
          requestedBy: 'jjohnson@university.edu',
          requestedAt: '2025-10-11T09:15:00Z'
        },
        {
          id: 3,
          title: 'CS301 - Algorithms',
          instructor: 'Dr. Williams',
          courseCode: 'CS301',
          date: '2025-10-22',
          startTime: '10:00',
          endTime: '12:00',
          recurring: 'monthly',
          recurringEndDate: '2026-01-22',
          status: 'pending',
          requestedBy: 'wwilliams@university.edu',
          requestedAt: '2025-10-12T16:45:00Z'
        },
        {
          id: 4,
          title: 'CS401 - AI & Machine Learning',
          instructor: 'Dr. Brown',
          courseCode: 'CS401',
          date: '2025-10-23',
          startTime: '14:00',
          endTime: '16:00',
          recurring: 'none',
          status: 'approved',
          requestedBy: 'bbrown@university.edu',
          requestedAt: '2025-10-13T11:20:00Z'
        },
        {
          id: 5,
          title: 'CS501 - Capstone Project',
          instructor: 'Dr. Davis',
          courseCode: 'CS501',
          date: '2025-10-24',
          startTime: '09:00',
          endTime: '17:00',
          recurring: 'none',
          status: 'rejected',
          reason: 'Lab maintenance scheduled',
          requestedBy: 'ddavis@university.edu',
          requestedAt: '2025-10-14T10:30:00Z'
        }
      ]
    },
    { 
      id: 2, 
      name: 'Computer Lab B', 
      building: 'Engineering Building', 
      room: 'B205', 
      capacity: 40, 
      availableComputers: 38,
      status: 'Operational',
      reservations: []
    },
    { 
      id: 3, 
      name: 'Multimedia Lab', 
      building: 'Arts Building', 
      room: 'C312', 
      capacity: 20, 
      availableComputers: 18,
      status: 'Maintenance',
      maintenanceNotes: 'Hardware upgrades in progress. Expected completion: 2025-10-25',
      reservations: []
    },
    { 
      id: 4, 
      name: 'Research Lab', 
      building: 'Science Building', 
      room: 'A215', 
      capacity: 15, 
      availableComputers: 10,
      status: 'Limited Access',
      notes: 'Restricted to graduate students and faculty',
      reservations: []
    }
  ]);

  // State for the calendar view
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [showNewLab, setShowNewLab] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'pending', 'all'
  const [newReservation, setNewReservation] = useState({
    title: '',
    instructor: '',
    courseCode: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    recurring: 'none',
    recurringEndDate: '',
    labId: '',
    notes: ''
  });
  const [newLab, setNewLab] = useState({
    name: '',
    building: '',
    room: '',
    capacity: '',
    availableComputers: '',
    status: 'Operational',
    notes: ''
  });

  // Get the current week's dates
  const getWeekDates = () => {
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return date;
    });
  };

  const weekDays = getWeekDates();
  const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate to previous/next week
  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentDate(newDate);
  };

  // Get reservations for a specific lab and date
  const getReservationsForDate = (labId, date) => {
    const lab = labs.find(lab => lab.id === labId);
    if (!lab) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    return lab.reservations.filter(reservation => {
      // Check if this is a recurring reservation that should appear on this date
      if (reservation.recurring === 'weekly') {
        const reservationDay = new Date(reservation.date).getDay();
        return (
          reservationDay === dayOfWeek &&
          isWithinInterval(date, {
            start: parseISO(reservation.date),
            end: parseISO(reservation.recurringEndDate || '2100-01-01')
          })
        );
      } else if (reservation.recurring === 'biweekly') {
        const reservationDate = parseISO(reservation.date);
        const reservationDay = reservationDate.getDay();
        const weeksDiff = Math.floor((date - reservationDate) / (7 * 24 * 60 * 60 * 1000));
        
        return (
          reservationDay === dayOfWeek &&
          weeksDiff >= 0 &&
          weeksDiff % 2 === 0 &&
          isWithinInterval(date, {
            start: reservationDate,
            end: parseISO(reservation.recurringEndDate || '2100-01-01')
          })
        );
      } else if (reservation.recurring === 'monthly') {
        const reservationDate = parseISO(reservation.date);
        return (
          date.getDate() === reservationDate.getDate() &&
          isWithinInterval(date, {
            start: reservationDate,
            end: parseISO(reservation.recurringEndDate || '2100-01-01')
          })
        );
      }
      
      // Non-recurring reservation
      return reservation.date === dateStr;
    });
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (labId, date, startTime, endTime, excludeReservationId = null) => {
    const reservations = getReservationsForDate(labId, date);
    
    // Convert times to minutes since midnight for easier comparison
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const slotStart = startHour * 60 + startMinute;
    const slotEnd = endHour * 60 + endMinute;
    
    // Check for conflicts with existing reservations
    return !reservations.some(reservation => {
      if (reservation.id === excludeReservationId) return false;
      if (reservation.status === 'rejected') return false;
      
      const [resStartHour, resStartMinute] = reservation.startTime.split(':').map(Number);
      const [resEndHour, resEndMinute] = reservation.endTime.split(':').map(Number);
      const resStart = resStartHour * 60 + resStartMinute;
      const resEnd = resEndHour * 60 + resEndMinute;
      
      // Check for overlap
      return (slotStart < resEnd && slotEnd > resStart);
    });
  };

  // Handle reservation submission
  const handleReservationSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newReservation.labId) {
      alert('Please select a lab');
      return;
    }
    
    if (!newReservation.title || !newReservation.instructor) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Check if the time slot is available
    const isAvailable = isTimeSlotAvailable(
      parseInt(newReservation.labId),
      parseISO(newReservation.date),
      newReservation.startTime,
      newReservation.endTime
    );
    
    if (!isAvailable) {
      alert('The selected time slot is not available. Please choose a different time.');
      return;
    }
    
    // Create the reservation
    const reservation = {
      id: Math.max(0, ...labs.flatMap(lab => lab.reservations.map(r => r.id))) + 1,
      title: newReservation.title,
      instructor: newReservation.instructor,
      courseCode: newReservation.courseCode,
      date: newReservation.date,
      startTime: newReservation.startTime,
      endTime: newReservation.endTime,
      recurring: newReservation.recurring,
      recurringEndDate: newReservation.recurring === 'none' ? undefined : newReservation.recurringEndDate,
      status: 'pending',
      requestedBy: 'admin@university.edu',
      requestedAt: new Date().toISOString(),
      notes: newReservation.notes
    };
    
    // Add the reservation to the lab
    setLabs(labs.map(lab => {
      if (lab.id === parseInt(newReservation.labId)) {
        return {
          ...lab,
          reservations: [...lab.reservations, reservation]
        };
      }
      return lab;
    }));
    
    // Reset the form
    setNewReservation({
      title: '',
      instructor: '',
      courseCode: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      recurring: 'none',
      recurringEndDate: '',
      labId: '',
      notes: ''
    });
    
    setShowNewReservation(false);
  };

  // Handle lab submission
  const handleLabSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newLab.name || !newLab.building || !newLab.room || !newLab.capacity) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create the new lab
    const lab = {
      id: Math.max(0, ...labs.map(lab => lab.id)) + 1,
      name: newLab.name,
      building: newLab.building,
      room: newLab.room,
      capacity: parseInt(newLab.capacity),
      availableComputers: parseInt(newLab.availableComputers || newLab.capacity),
      status: newLab.status,
      notes: newLab.notes,
      reservations: []
    };
    
    // Add the new lab
    setLabs([...labs, lab]);
    
    // Reset the form
    setNewLab({
      name: '',
      building: '',
      room: '',
      capacity: '',
      availableComputers: '',
      status: 'Operational',
      notes: ''
    });
    
    setShowNewLab(false);
  };

  // Update reservation status
  const updateReservationStatus = (labId, reservationId, status, reason = '') => {
    setLabs(labs.map(lab => {
      if (lab.id === labId) {
        return {
          ...lab,
          reservations: lab.reservations.map(reservation => {
            if (reservation.id === reservationId) {
              return {
                ...reservation,
                status,
                ...(reason && { reason })
              };
            }
            return reservation;
          })
        };
      }
      return lab;
    }));
  };

  // Delete a lab
  const deleteLab = (labId) => {
    if (window.confirm('Are you sure you want to delete this lab? This action cannot be undone.')) {
      setLabs(labs.filter(lab => lab.id !== labId));
    }
  };

  // Get all reservations (for list view)
  const getAllReservations = () => {
    return labs.flatMap(lab => 
      lab.reservations.map(reservation => ({
        ...reservation,
        labName: lab.name,
        labId: lab.id
      }))
    );
  };

  // Filter reservations based on active tab
  const getFilteredReservations = () => {
    const allReservations = getAllReservations();
    const today = new Date();
    
    return allReservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      
      // Filter by status
      if (activeTab === 'pending') {
        return reservation.status === 'pending';
      } else if (activeTab === 'upcoming') {
        return reservation.status === 'approved' && 
               (reservationDate >= today || 
                (reservation.recurring && 
                 (!reservation.recurringEndDate || new Date(reservation.recurringEndDate) >= today)));
      } else if (activeTab === 'past') {
        return reservation.status === 'approved' && 
               reservationDate < today && 
               (!reservation.recurring || 
                (reservation.recurringEndDate && new Date(reservation.recurringEndDate) < today));
      } else if (activeTab === 'rejected') {
        return reservation.status === 'rejected';
      }
      
      return true; // 'all' tab
    });
  };

  // Check if a lab is available for a given time slot
  const isLabAvailable = (lab, date, startTime, endTime) => {
    if (lab.status !== 'Operational') return false;
    
    // Check if there are enough available computers
    if (lab.availableComputers <= 0) return false;
    
    // Check for time conflicts
    return isTimeSlotAvailable(lab.id, date, startTime, endTime);
  };

  // Get the status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get the lab status badge class
  const getLabStatusBadgeClass = (status) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-red-100 text-red-800';
      case 'Limited Access':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get the next available time slot
  const getNextAvailableSlot = (labId, date, durationMinutes = 60) => {
    const lab = labs.find(lab => lab.id === labId);
    if (!lab || lab.status !== 'Operational' || lab.availableComputers <= 0) {
      return null;
    }
    
    const startOfDay = new Date(date);
    startOfDay.setHours(8, 0, 0, 0); // 8:00 AM
    
    const endOfDay = new Date(date);
    endOfDay.setHours(22, 0, 0, 0); // 10:00 PM
    
    let currentTime = new Date(Math.max(startOfDay, new Date()));
    
    // If it's today, start from the next hour
    if (isToday(currentTime)) {
      currentTime.setHours(currentTime.getHours() + 1, 0, 0, 0);
    }
    
    // Check in 30-minute increments
    while (currentTime <= endOfDay) {
      const endTime = new Date(currentTime);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);
      
      // Skip if it's outside working hours
      if (endTime.getHours() >= 22) {
        currentTime.setDate(currentTime.getDate() + 1);
        currentTime.setHours(8, 0, 0, 0);
        continue;
      }
      
      // Check if this slot is available
      const startTimeStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
      const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
      
      if (isTimeSlotAvailable(labId, currentTime, startTimeStr, endTimeStr)) {
        return {
          date: format(currentTime, 'yyyy-MM-dd'),
          startTime: startTimeStr,
          endTime: endTimeStr
        };
      }
      
      // Move to the next 30-minute slot
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    
    return null; // No available slots found
  };

  // Filter labs based on search term
  const filteredLabs = labs.filter(lab => 
    lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get all buildings for the filter
  const buildings = [...new Set(labs.map(lab => lab.building))];

  return (
    <div className="space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Computer Lab Reservations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage computer lab reservations and availability
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {view === 'list' ? 'Calendar View' : 'List View'}
          </button>
          <button
            onClick={() => setShowNewReservation(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Reservation
          </button>
          <button
            onClick={() => setShowNewLab(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Lab
          </button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search labs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              defaultValue=""
            >
              <option value="">All Buildings</option>
              {buildings.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </select>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              defaultValue=""
            >
              <option value="">All Statuses</option>
              <option value="Operational">Operational</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Closed">Closed</option>
              <option value="Limited Access">Limited Access</option>
            </select>
          </div>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`${
                  activeTab === 'upcoming'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
              >
                Upcoming Reservations
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
              >
                Pending Approval
                {getFilteredReservations().filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {getFilteredReservations().filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`${
                  activeTab === 'past'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
              >
                Past Reservations
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`${
                  activeTab === 'rejected'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
              >
                Rejected
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
              >
                All Reservations
              </button>
            </nav>
          </div>
          
          {/* Reservations List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-b-lg">
            <ul className="divide-y divide-gray-200">
              {getFilteredReservations().length > 0 ? (
                getFilteredReservations().map((reservation) => (
                  <li key={`${reservation.id}-${reservation.date}`} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.title} {reservation.courseCode && `(${reservation.courseCode})`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.instructor} • {reservation.labName}
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              {new Date(reservation.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })} • {reservation.startTime} - {reservation.endTime}
                              {reservation.recurring && (
                                <span className="ml-2 text-xs text-gray-400">
                                  ({reservation.recurring})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(reservation.status)}`}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end space-x-3">
                        {reservation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateReservationStatus(reservation.labId, reservation.id, 'approved')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircleIcon className="-ml-1 mr-1 h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Please enter the reason for rejection:');
                                if (reason) {
                                  updateReservationStatus(reservation.labId, reservation.id, 'rejected', reason);
                                }
                              }}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <XMarkIcon className="-ml-1 mr-1 h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            const lab = labs.find(l => l.id === reservation.labId);
                            if (lab) {
                              setSelectedLab(lab);
                              setSelectedReservation(reservation);
                            }
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <PencilIcon className="-ml-1 mr-1 h-4 w-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-12 text-center text-gray-500">
                  {activeTab === 'pending' 
                    ? 'No pending reservations.' 
                    : activeTab === 'upcoming'
                    ? 'No upcoming reservations.'
                    : activeTab === 'past'
                    ? 'No past reservations.'
                    : 'No reservations found.'}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center
            
            space-x-4">
              <button
                type="button"
                onClick={() => navigateWeek('prev')}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Previous week</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <h2 className="text-lg font-medium text-gray-900">
                {format(weekDays[0], 'MMMM d')} - {format(weekDays[6], 'd, yyyy')}
              </h2>
              <button
                type="button"
                onClick={() => navigateWeek('next')}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Next week</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(startOfToday())}
                className="ml-2 px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Today
              </button>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                <span className="text-sm text-gray-500">Available</span>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
                <span className="text-sm text-gray-500">Limited</span>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                <span className="text-sm text-gray-500">Unavailable</span>
              </div>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 border-b border-gray-200">
                {weekDays.map((day, index) => (
                  <div key={index} className="bg-gray-50 py-2 px-3 text-center text-sm font-medium text-gray-500">
                    <div className="flex flex-col items-center">
                      <span className={isToday(day) ? 'flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white' : ''}>
                        {format(day, 'EEE')}
                      </span>
                      <span className={isToday(day) ? 'mt-1 flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white' : 'mt-1 text-gray-900'}>
                        {format(day, 'd')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Labs Rows */}
              <div className="bg-gray-200">
                {filteredLabs.map((lab) => (
                  <div key={lab.id} className="divide-y divide-gray-200">
                    {/* Lab Header */}
                    <div className="bg-white">
                      <div className="flex items-center px-3 py-2 border-b border-gray-200">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{lab.name}</h3>
                          <p className="text-xs text-gray-500">
                            {lab.building} • {lab.room} • {lab.availableComputers}/{lab.capacity} computers available
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLabStatusBadgeClass(lab.status)}`}>
                            {lab.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Lab Schedule */}
                    <div className="grid grid-cols-7 gap-px bg-gray-200">
                      {weekDays.map((day, dayIndex) => {
                        const reservations = getReservationsForDate(lab.id, day);
                        const isLabAvailableToday = lab.status === 'Operational' && lab.availableComputers > 0;
                        
                        return (
                          <div 
                            key={dayIndex} 
                            className={`bg-white min-h-24 p-1 ${isToday(day) ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                              if (isLabAvailableToday) {
                                const nextSlot = getNextAvailableSlot(lab.id, day);
                                setNewReservation({
                                  ...newReservation,
                                  labId: lab.id,
                                  date: format(day, 'yyyy-MM-dd'),
                                  ...(nextSlot && {
                                    startTime: nextSlot.startTime,
                                    endTime: nextSlot.endTime
                                  })
                                });
                                setShowNewReservation(true);
                              }
                            }}
                          >
                            {reservations.map((reservation) => (
                              <div 
                                key={reservation.id} 
                                className={`p-1 mb-1 rounded text-xs ${
                                  reservation.status === 'approved' 
                                    ? 'bg-green-100 border-l-4 border-green-500' 
                                    : reservation.status === 'pending'
                                    ? 'bg-yellow-100 border-l-4 border-yellow-500'
                                    : 'bg-red-100 border-l-4 border-red-500'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLab(lab);
                                  setSelectedReservation(reservation);
                                }}
                              >
                                <div className="font-medium truncate">
                                  {reservation.title} {reservation.courseCode && `(${reservation.courseCode})`}
                                </div>
                                <div className="text-gray-600">
                                  {reservation.startTime} - {reservation.endTime}
                                </div>
                                <div className="text-gray-500 truncate">
                                  {reservation.instructor}
                                </div>
                                {reservation.status === 'rejected' && reservation.reason && (
                                  <div className="text-red-500 text-xs italic truncate" title={reservation.reason}>
                                    {reservation.reason}
                                  </div>
                                )}
                              </div>
                            ))}
                            {isLabAvailableToday && reservations.length === 0 && (
                              <div className="text-center text-xs text-gray-400 mt-2">
                                Click to add reservation
                              </div>
                            )}
                            {!isLabAvailableToday && (
                              <div className="text-center text-xs text-gray-400 mt-2">
                                {lab.status === 'Maintenance' 
                                  ? lab.maintenanceNotes || 'Under maintenance'
                                  : lab.availableComputers <= 0 
                                    ? 'No computers available'
                                    : 'Not available'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {filteredLabs.length === 0 && (
                  <div className="bg-white p-8 text-center">
                    <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No labs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No labs match your search criteria.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setShowNewLab(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add New Lab
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lab Details Modal */}
      {selectedLab && selectedReservation && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedReservation.title} {selectedReservation.courseCode && `(${selectedReservation.courseCode})`}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedLab.name} • {selectedLab.building} {selectedLab.room}
                    </p>
                  </div>
                  <div className="ml-3 h-7 flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedReservation.status)}`}>
                      {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Instructor</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedReservation.instructor}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(selectedReservation.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Time</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedReservation.startTime} - {selectedReservation.endTime}
                      </dd>
                    </div>
                    {selectedReservation.recurring && selectedReservation.recurring !== 'none' && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Recurring</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {selectedReservation.recurring.charAt(0).toUpperCase() + selectedReservation.recurring.slice(1)}
                          {selectedReservation.recurringEndDate && (
                            <span className="text-gray-500"> until {new Date(selectedReservation.recurringEndDate).toLocaleDateString()}</span>
                          )}
                        </dd>
                      </div>
                    )}
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Requested By</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedReservation.requestedBy}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Requested On</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(selectedReservation.requestedAt).toLocaleString()}
                      </dd>
                    </div>
                    {(selectedReservation.notes || selectedReservation.reason) && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">
                          {selectedReservation.status === 'rejected' ? 'Reason for Rejection' : 'Notes'}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {selectedReservation.reason || selectedReservation.notes || 'N/A'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-3 sm:gap-3 sm:grid-flow-row-dense">
                {selectedReservation.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                      onClick={() => {
                        updateReservationStatus(selectedLab.id, selectedReservation.id, 'approved');
                        setSelectedReservation({
                          ...selectedReservation,
                          status: 'approved'
                        });
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:col-start-3 sm:text-sm"
                      onClick={() => {
                        const reason = prompt('Please enter the reason for rejection:');
                        if (reason) {
                          updateReservationStatus(selectedLab.id, selectedReservation.id, 'rejected', reason);
                          setSelectedReservation({
                            ...selectedReservation,
                            status: 'rejected',
                            reason
                          });
                        }
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    setSelectedLab(null);
                    setSelectedReservation(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {showNewReservation && (
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
                    New Lab Reservation
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleReservationSubmit}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label htmlFor="labId" className="block text-sm font-medium text-gray-700 text-left">
                              Lab <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="labId"
                              name="labId"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newReservation.labId}
                              onChange={(e) => setNewReservation({...newReservation, labId: e.target.value})}
                            >
                              <option value="">Select a lab</option>
                              {labs.filter(lab => lab.status === 'Operational' && lab.availableComputers > 0).map((lab) => (
                                <option key={lab.id} value={lab.id}>
                                  {lab.name} ({lab.building} {lab.room}) - {lab.availableComputers} available
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 text-left">
                              Event Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="title"
                              id="title"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newReservation.title}
                              onChange={(e) => setNewReservation({...newReservation, title: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 text-left">
                              Instructor <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="instructor"
                              id="instructor"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newReservation.instructor}
                              onChange={(e) => setNewReservation({...newReservation, instructor: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 text-left">
                              Course Code
                            </label>
                            <input
                              type="text"
                              name="courseCode"
                              id="courseCode"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newReservation.courseCode}
                              onChange={(e) => setNewReservation({...newReservation, courseCode: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 text-left">
                              Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              name="date"
                              id="date"
                              required
                              min={format(new Date(), 'yyyy-MM-dd')}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newReservation.date}
                              onChange={(e) => setNewReservation({...newReservation, date: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 text-left">
                                Start Time <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="time"
                                name="startTime"
                                id="startTime"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newReservation.startTime}
                                onChange={(e) => setNewReservation({...newReservation, startTime: e.target.value})}
                              />
                            </div>
                            <div>
                              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 text-left">
                                End Time <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="time"
                                name="endTime"
                                id="endTime"
                                required
                                min={newReservation.startTime}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newReservation.endTime}
                                onChange={(e) => setNewReservation({...newReservation, endTime: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="recurring" className="block text-sm font-medium text-gray-700 text-left">
                              Recurring
                            </label>
                            <select
                              id="recurring"
                              name="recurring"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newReservation.recurring}
                              onChange={(e) => setNewReservation({
                                ...newReservation, 
                                recurring: e.target.value,
                                recurringEndDate: e.target.value === 'none' ? '' : newReservation.recurringEndDate
                              })}
                            >
                              <option value="none">Does not repeat</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          
                          {newReservation.recurring !== 'none' && (
                            <div>
                              <label htmlFor="recurringEndDate" className="block text-sm font-medium text-gray-700 text-left">
                                End Date
                              </label>
                              <input
                                type="date"
                                name="recurringEndDate"
                                id="recurringEndDate"
                                min={newReservation.date}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newReservation.recurringEndDate}
                                onChange={(e) => setNewReservation({...newReservation, recurringEndDate: e.target.value})}
                              />
                            </div>
                          )}
                          
                          <div className="sm:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 text-left">
                              Notes
                            </label>
                            <textarea
                              id="notes"
                              name="notes"
                              rows="3"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Any additional information about the reservation..."
                              value={newReservation.notes}
                              onChange={(e) => setNewReservation({...newReservation, notes: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                        >
                          Create Reservation
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => setShowNewReservation(false)}
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

      {/* New Lab Modal */}
      {showNewLab && (
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
                    Add New Computer Lab
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleLabSubmit}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-left">
                              Lab Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newLab.name}
                              onChange={(e) => setNewLab({...newLab, name: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="building" className="block text-sm font-medium text-gray-700 text-left">
                              Building <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="building"
                              id="building"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newLab.building}
                              onChange={(e) => setNewLab({...newLab, building: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="room" className="block text-sm font-medium text-gray-700 text-left">
                              Room Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="room"
                              id="room"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newLab.room}
                              onChange={(e) => setNewLab({...newLab, room: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 text-left">
                              Total Capacity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="capacity"
                              id="capacity"
                              required
                              min="1"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newLab.capacity}
                              onChange={(e) => setNewLab({...newLab, capacity: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="availableComputers" className="block text-sm font-medium text-gray-700 text-left">
                              Available Computers
                            </label>
                            <input
                              type="number"
                              name="availableComputers"
                              id="availableComputers"
                              min="0"
                              max={newLab.capacity || ''}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newLab.availableComputers}
                              onChange={(e) => setNewLab({...newLab, availableComputers: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 text-left">
                              Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newLab.status}
                              onChange={(e) => setNewLab({...newLab, status: e.target.value})}
                            >
                              <option value="Operational">Operational</option>
                              <option value="Maintenance">Maintenance</option>
                              <option value="Closed">Closed</option>
                              <option value="Limited Access">Limited Access</option>
                            </select>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 text-left">
                              Notes
                            </label>
                            <textarea
                              id="notes"
                              name="notes"
                              rows="3"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Any additional information about the lab..."
                              value={newLab.notes}
                              onChange={(e) => setNewLab({...newLab, notes: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                        >
                          Add Lab
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => setShowNewLab(false)}
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

export default ComputerLabs;
