import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Typography, 
  Box, CircularProgress, Alert, IconButton, 
  Tooltip, Chip
} from '@mui/material';
import { Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import voteService from '../../../services/voteService';

const VotesManagement = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voteService.getAllVotes();
      setVotes(data);
    } catch (err) {
      console.error('Failed to fetch votes:', err);
      setError('Failed to load votes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, []);

  const handleDeleteVote = async (voteId) => {
    if (window.confirm('Are you sure you want to delete this vote?')) {
      try {
        await voteService.deleteVote(voteId);
        setVotes(votes.filter(vote => vote.id !== voteId));
      } catch (err) {
        console.error('Failed to delete vote:', err);
        setError('Failed to delete vote. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Box mt={1}>
          <IconButton size="small" onClick={fetchVotes}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">Votes Management</Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchVotes} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {votes.length === 0 ? (
        <Alert severity="info">No votes found.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vote ID</TableCell>
                <TableCell>Poll</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Option</TableCell>
                <TableCell>Voted At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {votes.map((vote) => (
                <TableRow key={vote.id}>
                  <TableCell>
                    <Chip 
                      label={vote.id.substring(0, 8) + '...'} 
                      size="small"
                      title={vote.id}
                    />
                  </TableCell>
                  <TableCell>
                    {vote.polls?.title || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {vote.users?.email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {vote.options?.option_text || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {vote.created_at ? format(new Date(vote.created_at), 'PPpp') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete Vote">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteVote(vote.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default VotesManagement;
