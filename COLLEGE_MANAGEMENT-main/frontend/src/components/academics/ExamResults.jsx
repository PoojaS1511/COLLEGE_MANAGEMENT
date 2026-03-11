import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, TablePagination
} from '@mui/material';
import { supabase } from '../../lib/supabase';

const ExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      
      // Fetch exam results with related exam and subject data
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          *,
          exam:exam_id (id, name, exam_type, total_marks, start_date),
          subject:subject_id (id, name, code)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching exam results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamResults();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  // Calculate grade based on marks
  const calculateGrade = (marksObtained, maxMarks) => {
    const percentage = (marksObtained / maxMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  };

  if (loading) {
    return <Typography>Loading exam results...</Typography>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Exam Results
      </Typography>
      
      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 2 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Exam Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Exam Type</TableCell>
                <TableCell>Max Marks</TableCell>
                <TableCell>Marks Obtained</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((result) => (
                  <TableRow key={result.id} hover>
                    <TableCell>{result.exam?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {result.subject?.name || 'N/A'} 
                      {result.subject?.code ? ` (${result.subject.code})` : ''}
                    </TableCell>
                    <TableCell>{result.exam?.exam_type?.toUpperCase() || 'N/A'}</TableCell>
                    <TableCell>{result.exam?.total_marks || 'N/A'}</TableCell>
                    <TableCell>{result.marks_obtained || 'N/A'}</TableCell>
                    <TableCell>
                      {calculateGrade(
                        result.marks_obtained, 
                        result.exam?.total_marks || 100
                      )}
                    </TableCell>
                    <TableCell>{formatDate(result.exam?.start_date)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={results.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ExamResults;
