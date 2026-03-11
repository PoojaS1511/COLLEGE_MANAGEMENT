import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  UserCircleIcon, 
  ClockIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { medicalService } from '../../../services/healthSafetyService';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const HealthCenter = () => {
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('appointments');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    studentId: '',
    studentName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    reason: '',
    status: 'scheduled'
  });

  // Fetch health data
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch today's appointments
        const today = format(new Date(), 'yyyy-MM-dd');
        console.log('Fetching appointments for date:', today);
        
        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('medical_appointments')
          .select('*')
          .eq('appointment_date', today)
          .or('status.eq.scheduled,status.eq.completed')
          .order('appointment_date', { ascending: true });

        if (appointmentsError) throw appointmentsError;
        
        console.log('Appointments data:', appointmentsData);
        
        // Fetch active medical cases
        const { data: activeCases, error: casesError } = await supabase
          .from('medical_emergencies')
          .select('*')
          .or('status.eq.active,status.eq.under_investigation')
          .order('emergency_date', { ascending: false })
          .limit(10);
          
        if (casesError) throw casesError;
        
        console.log('Active cases data:', activeCases);
        
        // Update state with fetched data
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        setMedicalRecords(Array.isArray(activeCases) ? activeCases : []);
        
      } catch (err) {
        console.error('Error fetching health data:', err);
        setError('Failed to load health data: ' + (err.message || 'Unknown error'));
        toast.error('Failed to load health data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthData();
    
    // Set up real-time subscription for appointments
    const subscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'medical_appointments' 
        }, 
        (payload) => {
          console.log('Appointment change received!', payload);
          if (payload.eventType === 'INSERT') {
            setAppointments(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAppointments(prev => 
              prev.map(apt => apt.id === payload.new.id ? payload.new : apt)
            );
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
          }
        }
      )
      .subscribe();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle appointment status update
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await medicalService.updateAppointment(appointmentId, { status: newStatus });
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );
      
      toast.success('Appointment updated successfully');
    } catch (err) {
      console.error('Error updating appointment status:', err);
      toast.error('Failed to update appointment');
    }
  };

  // Handle new appointment form submission
  const handleNewAppointment = async (e) => {
    e.preventDefault();
    try {
      const { data: newAppt } = await medicalService.createAppointment({
        ...newAppointment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      setAppointments(prev => [newAppt, ...prev]);
      setNewAppointment({
        studentId: '',
        studentName: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        reason: '',
        status: 'scheduled'
      });
      setShowNewAppointment(false);
      
      toast.success('Appointment scheduled successfully');
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast.error('Failed to schedule appointment');
    }
  };

  // Handle input change for new appointment form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XMarkIcon className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const markAsCompleted = (id) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'completed' } : apt
    ));
  };

  const cancelAppointment = (id) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`${activeTab === 'appointments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`${activeTab === 'records' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Medical Records
          </button>
        </nav>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
            <button
              onClick={() => setShowNewAppointment(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + New Appointment
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{appointment.studentName}</div>
                          <div className="text-sm text-gray-500">ID: {appointment.studentId}</div>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {appointment.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => markAsCompleted(appointment.id)}
                              className="mr-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Mark as Done
                            </button>
                            <button
                              onClick={() => cancelAppointment(appointment.id)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === 'completed' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          {appointment.date}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          {appointment.time}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span>Reason: {appointment.reason}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Medical Records Tab */}
      {activeTab === 'records' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Medical Records</h3>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">New Appointment</h3>
                  <div className="mt-4">
                    <form onSubmit={handleNewAppointment} className="space-y-4">
                      <div>
                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 text-left">
                          Student ID
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          id="studentId"
                          value={newAppointment.studentId}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter student ID"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 text-left">
                          Student Name
                        </label>
                        <input
                          type="text"
                          name="studentName"
                          id="studentName"
                          value={newAppointment.studentName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter student name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 text-left">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={newAppointment.date}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 text-left">
                          Time
                        </label>
                        <input
                          type="time"
                          name="time"
                          id="time"
                          value={newAppointment.time}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 text-left">
                          Reason for Visit
                        </label>
                        <textarea
                          name="reason"
                          id="reason"
                          rows="3"
                          value={newAppointment.reason}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Briefly describe the reason for the appointment"
                          required
                        ></textarea>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                        >
                          Schedule
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => setShowNewAppointment(false)}
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

export default HealthCenter;
