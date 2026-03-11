import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

const ITEMS_PER_PAGE = 10;

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    period: '1',
    subject: '',
    status: 'present',
    examType: 'class_test'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, fetch the attendance records with student data
      let { data: attendanceData, error } = await supabase
        .from('student_attendance')
        .select(`
          *,
          students!student_attendance_student_id_fkey (
            id,
            full_name,
            register_number,
            roll_no
          ),
          subjects:subject_id (*)
        `, { count: 'exact' })
        .order('attendance_date', { ascending: false });

      if (error) throw error;

      // If no data, set empty array and return
      if (!attendanceData || attendanceData.length === 0) {
        setAttendance([]);
        setTotalRecords(0);
        return;
      }

      // Get all unique faculty IDs from the attendance records (filter out null/undefined)
      const facultyIds = [...new Set(attendanceData
        .map(record => record.faculty_id)
        .filter(Boolean)
      )];
      
      let facultyMap = {};
      
      // Only fetch faculty data if we have faculty IDs
      if (facultyIds.length > 0) {
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculties')
          .select('id, full_name, employee_id')
          .in('id', facultyIds);

        if (facultyError) throw facultyError;

        // Create a map of faculty ID to faculty data for quick lookup
        facultyData?.forEach(faculty => {
          facultyMap[faculty.id] = faculty;
        });
      }

      // Combine the data and ensure faculty data is properly attached
      const combinedData = attendanceData.map(record => {
        // Find the faculty for this record
        const faculty = record.faculty_id ? facultyMap[record.faculty_id] : null;
        
        return {
          ...record,
          faculty: faculty || null
        };
      });

      // Apply date filter if selected
      let filteredData = combinedData;
      if (selectedDate) {
        filteredData = combinedData.filter(record => 
          record.attendance_date === selectedDate
        );
      }
      // Apply additional filters
      if (attendanceStatus !== 'all') {
        filteredData = filteredData.filter(record => record.status === attendanceStatus);
      }
      if (selectedSubject) {
        filteredData = filteredData.filter(record => record.subject_id === selectedSubject);
      }
      if (selectedFaculty) {
        filteredData = filteredData.filter(record => record.faculty_id === selectedFaculty);
      }

      // Apply pagination
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      // Update state with paginated data
      setAttendance(paginatedData);
      setTotalRecords(filteredData.length);
    } catch (err) {
      console.error('Error in fetchAttendance:', err);
      setError(err.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedDate, attendanceStatus, selectedSubject, selectedFaculty]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .order('name');
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('id, name, email')
        .order('name');
      
      if (error) throw error;
      setFaculty(data || []);
    } catch (err) {
      console.error('Error fetching faculty:', err);
    }
  };

  // Mark attendance for students
  const markAttendance = async (attendanceId, status) => {
    try {
      const { error } = await supabase
        .from('student_attendance')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', attendanceId);

      if (error) throw error;
      
      // Refresh the attendance data
      fetchAttendance();
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance');
    }
  };

  // Initial fetch and refetch when dependencies change
  useEffect(() => {
    fetchAttendance();
    fetchSubjects();
    fetchFaculty();
  }, [fetchAttendance]);

  const resetFilters = () => {
    setSelectedDate('');
    setAttendanceStatus('all');
    setSelectedSubject('');
    setSelectedFaculty('');
    setCurrentPage(0);
  };

  const handleSubmitAttendance = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      // TODO: implement bulk attendance marking from the modal
      setShowMarkAttendanceModal(false);
      await fetchAttendance();
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setError(err?.message || 'Failed to save attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={attendanceStatus}
            onChange={(e) => setAttendanceStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="present">Present</MenuItem>
            <MenuItem value="absent">Absent</MenuItem>
            <MenuItem value="late">Late</MenuItem>
            <MenuItem value="excused">Excused</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Subject</InputLabel>
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            label="Subject"
          >
            <MenuItem value="">All Subjects</MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Faculty</InputLabel>
          <Select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            label="Faculty"
          >
            <MenuItem value="">All Faculty</MenuItem>
            {faculty.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button 
          variant="outlined" 
          onClick={() => {
            setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
            setAttendanceStatus('all');
            setSelectedSubject('');
            setSelectedFaculty('');
          }}
        >
          Reset Filters
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowMarkAttendanceModal(true)}
          sx={{ ml: 'auto' }}
        >
          Mark Attendance
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Attendance Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Admission No.</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              attendance.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{record.students?.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    {record.students?.register_number ??
                      record.students?.roll_no ??
                      'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box 
                      sx={{
                        display: 'inline-block',
                        color: record.status === 'present' ? 'success.main' : 
                               record.status === 'absent' ? 'error.main' : 'warning.main',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                        px: 1,
                        borderRadius: 1,
                        bgcolor: record.status === 'present' ? 'success.50' : 
                                record.status === 'absent' ? 'error.50' : 'warning.50'
                      }}
                    >
                      {record.status}
                    </Box>
                  </TableCell>
                  <TableCell>{record.subjects?.name || 'N/A'}</TableCell>
                  <TableCell>{record.faculty?.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    {format(parseISO(record.attendance_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        markAttendance(
                          record.id,
                          record.status === 'present' ? 'absent' : 'present'
                        )
                      }
                      disabled={isSubmitting}
                    >
                      Toggle Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[ITEMS_PER_PAGE]}
        component="div"
        count={totalRecords}
        rowsPerPage={ITEMS_PER_PAGE}
        page={currentPage}
        onPageChange={(e, newPage) => setCurrentPage(newPage)}
      />

      {/* Mark Attendance Modal */}
      <Dialog
        open={showMarkAttendanceModal}
        onClose={() => !isSubmitting && setShowMarkAttendanceModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={isSubmitting}
            />
            <FormControl fullWidth margin="normal" disabled={isSubmitting}>
              <InputLabel>Subject</InputLabel>
              <Select
                name="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                label="Subject"
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" disabled={isSubmitting}>
              <InputLabel>Period</InputLabel>
              <Select
                name="period"
                value={formData.period}
                onChange={(e) => setFormData({...formData, period: e.target.value})}
                label="Period"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                  <MenuItem key={period} value={period}>
                    Period {period}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" disabled={isSubmitting}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="late">Late</MenuItem>
                <MenuItem value="excused">Excused</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => !isSubmitting && setShowMarkAttendanceModal(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitAttendance}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Saving...' : 'Save Attendance'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceManagement;