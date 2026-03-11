import React, { createContext, useContext, useState, useCallback } from 'react';
import TransportService from '../services/transportService';
import { toast } from 'react-hot-toast';

const TransportContext = createContext();

export const useTransport = () => {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransport must be used within TransportProvider');
  }
  return context;
};

export const TransportProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dashboard
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const result = await TransportService.getDashboardMetrics();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      toast.error('Failed to fetch dashboard metrics');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Students
  const fetchStudents = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const result = await TransportService.getTransportStudents(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      setStudents(result.data);
      return result.data;
    } catch (error) {
      toast.error('Failed to fetch students');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = useCallback(async (studentData) => {
    try {
      setLoading(true);
      const result = await TransportService.addTransportStudent(studentData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Student added successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to add student');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStudent = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      const result = await TransportService.updateTransportStudent(id, updates);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Student updated successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to update student');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(async (id) => {
    try {
      setLoading(true);
      const result = await TransportService.deleteTransportStudent(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Student deleted successfully');
    } catch (error) {
      toast.error('Failed to delete student');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Faculty
  const fetchFaculty = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const result = await TransportService.getTransportFaculty(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      setFaculty(result.data);
      return result.data;
    } catch (error) {
      toast.error('Failed to fetch faculty');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addFaculty = useCallback(async (facultyData) => {
    try {
      setLoading(true);
      const result = await TransportService.addTransportFaculty(facultyData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Faculty added successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to add faculty');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFaculty = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      const result = await TransportService.updateTransportFaculty(id, updates);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Faculty updated successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to update faculty');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFaculty = useCallback(async (id) => {
    try {
      setLoading(true);
      const result = await TransportService.deleteTransportFaculty(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Faculty deleted successfully');
    } catch (error) {
      toast.error('Failed to delete faculty');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buses
  const fetchBuses = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const result = await TransportService.getBuses(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      setBuses(result.data);
      return result.data;
    } catch (error) {
      toast.error('Failed to fetch buses');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addBus = useCallback(async (busData) => {
    try {
      setLoading(true);
      const result = await TransportService.addBus(busData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Bus added successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to add bus');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBus = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      const result = await TransportService.updateBus(id, updates);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Bus updated successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to update bus');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBus = useCallback(async (id) => {
    try {
      setLoading(true);
      const result = await TransportService.deleteBus(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Bus deleted successfully');
    } catch (error) {
      toast.error('Failed to delete bus');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Drivers
  const fetchDrivers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const result = await TransportService.getDrivers(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      setDrivers(result.data);
      return result.data;
    } catch (error) {
      toast.error('Failed to fetch drivers');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addDriver = useCallback(async (driverData) => {
    try {
      setLoading(true);
      const result = await TransportService.addDriver(driverData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Driver added successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to add driver');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDriver = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      const result = await TransportService.updateDriver(id, updates);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Driver updated successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to update driver');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDriver = useCallback(async (id) => {
    try {
      setLoading(true);
      const result = await TransportService.deleteDriver(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Driver deleted successfully');
    } catch (error) {
      toast.error('Failed to delete driver');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Routes
  const fetchRoutes = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const result = await TransportService.getRoutes(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      setRoutes(result.data);
      return result.data;
    } catch (error) {
      toast.error('Failed to fetch routes');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addRoute = useCallback(async (routeData) => {
    try {
      setLoading(true);
      const result = await TransportService.addRoute(routeData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Route added successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to add route');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRoute = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      const result = await TransportService.updateRoute(id, updates);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Route updated successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to update route');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRoute = useCallback(async (id) => {
    try {
      setLoading(true);
      const result = await TransportService.deleteRoute(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Route deleted successfully');
    } catch (error) {
      toast.error('Failed to delete route');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fees
  const fetchFees = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const result = await TransportService.getTransportFees(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      setFees(result.data);
      return result.data;
    } catch (error) {
      toast.error('Failed to fetch fees');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordPayment = useCallback(async (paymentData) => {
    try {
      setLoading(true);
      const result = await TransportService.recordPayment(paymentData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Payment recorded successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to record payment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Attendance
  const fetchAttendance = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const result = await TransportService.getAttendance(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      setAttendance(result.data);
      return result.data;
    } catch (error) {
      toast.error('Failed to fetch attendance');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAttendance = useCallback(async (attendanceData) => {
    try {
      setLoading(true);
      const result = await TransportService.markAttendance(attendanceData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Attendance marked successfully');
      return result.data;
    } catch (error) {
      toast.error('Failed to mark attendance');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    students,
    faculty,
    buses,
    drivers,
    routes,
    fees,
    attendance,
    loading,
    
    // Dashboard
    fetchDashboardMetrics,
    
    // Students
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    
    // Faculty
    fetchFaculty,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    
    // Buses
    fetchBuses,
    addBus,
    updateBus,
    deleteBus,
    
    // Drivers
    fetchDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
    
    // Routes
    fetchRoutes,
    addRoute,
    updateRoute,
    deleteRoute,
    
    // Fees
    fetchFees,
    recordPayment,
    
    // Attendance
    fetchAttendance,
    markAttendance,
  };

  return (
    <TransportContext.Provider value={value}>
      {children}
    </TransportContext.Provider>
  );
};

export default TransportContext;