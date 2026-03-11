import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  TextField,
  Container,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Clearance = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [faculty, setFaculty] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    syllabus_completed: false,
    internal_marks_uploaded: false,
    lab_records_submitted: false,
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Get faculty profile
      const { data: profile, error: profileError } = await supabase
        .from('faculties')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setFaculty(profile);

      // Get most recent request
      const { data: requests, error: reqError } = await supabase
        .from('relieving_requests')
        .select('id, status')
        .eq('faculty_id', profile.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (reqError) throw reqError;

      if (requests && requests.length > 0) {
        setRequestId(requests[0].id);
        
        // Fetch existing clearance
        const { data: existing, error: clearanceError } = await supabase
          .from('academic_clearance')
          .select('*')
          .eq('request_id', requests[0].id)
          .maybeSingle();

        if (clearanceError) throw clearanceError;

        if (existing) {
          setFormData(prev => ({
            syllabus_completed: existing.syllabus_completed || false,
            internal_marks_uploaded: existing.internal_marks_uploaded || false,
            lab_records_submitted: existing.lab_records_submitted || false,
            remarks: existing.remarks || ''
          }));
          setSubmitted(existing.status === 'APPROVED');
        }
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestId) {
      alert("Please submit a Relieving Request first!");
      return;
    }

    if (!formData.syllabus_completed || !formData.internal_marks_uploaded || !formData.lab_records_submitted) {
      alert("Please acknowledge all requirements before submitting.");
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('academic_clearance')
        .upsert({
          faculty_id: faculty.id,
          request_id: requestId,
          ...formData,
          status: 'SUBMITTED',
          created_at: new Date().toISOString()
        }, { onConflict: 'request_id' });

      if (error) throw error;
      
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error submitting clearance: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!faculty) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error">Unable to load faculty data.</Alert>
      </Box>
    );
  }

  if (!requestId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No Relieving Request Found
          </Typography>
          <Typography color="text.secondary" paragraph>
            You need to submit a relieving request before you can complete the academic clearance.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/faculty/relieving-request')}
          >
            Submit Relieving Request
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Academic Clearance
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Please complete the following academic clearance requirements before proceeding.
        </Typography>

        {submitted ? (
          <Box
            sx={{
              textAlign: 'center',
              p: 4,
              backgroundColor: 'success.light',
              borderRadius: 1,
              my: 3
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Clearance Submitted Successfully
            </Typography>
            <Typography color="text.secondary">
              Your academic clearance has been submitted and is under review.
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Checkbox
                  checked={formData.syllabus_completed}
                  onChange={(e) => setFormData({...formData, syllabus_completed: e.target.checked})}
                  color="primary"
                />
                <Box>
                  <Typography variant="subtitle1">Syllabus Completion</Typography>
                  <Typography variant="body2" color="text.secondary">
                    I confirm that I have completed 100% of the assigned syllabus for all my courses.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Checkbox
                  checked={formData.internal_marks_uploaded}
                  onChange={(e) => setFormData({...formData, internal_marks_uploaded: e.target.checked})}
                  color="primary"
                />
                <Box>
                  <Typography variant="subtitle1">Internal Marks</Typography>
                  <Typography variant="body2" color="text.secondary">
                    I have uploaded all internal assessment marks to the examination portal.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Checkbox
                  checked={formData.lab_records_submitted}
                  onChange={(e) => setFormData({...formData, lab_records_submitted: e.target.checked})}
                  color="primary"
                />
                <Box>
                  <Typography variant="subtitle1">Lab Records</Typography>
                  <Typography variant="body2" color="text.secondary">
                    I have submitted all lab records and returned any department property in my possession.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Additional Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Any additional information or notes regarding the clearance process..."
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={submitting}
              fullWidth
            >
              {submitting ? 'Submitting...' : 'Submit Clearance'}
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default Clearance;
