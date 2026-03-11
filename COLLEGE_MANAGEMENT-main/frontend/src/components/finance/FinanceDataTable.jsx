import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import { Edit, Trash2, Search } from 'lucide-react';

const FinanceDataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  searchable = true,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCellValue = (value, column) => {
    if (column.format) {
      return column.format(value);
    }
    
    if (column.type === 'currency') {
      return `₹${Number(value).toLocaleString('en-IN')}`;
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('en-IN');
    }
    
    if (column.type === 'status') {
      const statusColors = {
        paid: 'success',
        pending: 'warning',
        overdue: 'error',
        partial: 'info',
        active: 'success',
        exceeded: 'error',
        warning: 'warning',
        resolved: 'success',
        'in progress': 'info',
        cancelled: 'default',
      };
      
      const color = statusColors[value?.toLowerCase()] || 'default';
      
      return (
        <Chip 
          label={value} 
          color={color} 
          size="small"
          className="font-medium"
        />
      );
    }
    
    return value;
  };

  const filteredData = searchable
    ? data.filter((row) =>
        Object.values(row).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data;

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper className="w-full overflow-hidden">
      {searchable && (
        <Box className="p-4 border-b">
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  className="font-semibold text-gray-700"
                >
                  {column.label}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell align="right" className="font-semibold text-gray-700">
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  <Typography variant="body2" color="text.secondary" className="py-8">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow 
                  hover 
                  key={row.id || index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      {formatCellValue(row[column.id], column)}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {onEdit && (
                          <IconButton
                            size="small"
                            onClick={() => onEdit(row)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit size={18} />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            size="small"
                            onClick={() => onDelete(row)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default FinanceDataTable;