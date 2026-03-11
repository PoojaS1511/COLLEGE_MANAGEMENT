import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const FacultyCertificates = () => {
  const [request, setRequest] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

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
      if (!profile) throw new Error('Faculty profile not found');
      
      setFaculty(profile);

      // Get most recent request for the faculty
      const { data: requests, error: reqError } = await supabase
        .from('relieving_requests')
        .select('*')
        .eq('faculty_id', profile.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (reqError) {
        console.error('Error fetching relieving request:', reqError);
        throw reqError;
      }
      
      // If no request found, set empty object
      if (!requests || requests.length === 0) {
        console.log('No relieving request found for faculty:', profile.id);
        setRequest({});
      } else {
        setRequest(requests[0]);
      }
    } catch (err) {
      console.error("Error:", err);
      setSnackbar({
        open: true,
        message: 'Failed to load documents. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (docType, action = 'download') => {
    if (!faculty) return;

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-GB');
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("UNIVERSITY OF EXCELLENCE", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Official Administrative Portal - Documents Division", 105, 27, { align: "center" });
    doc.line(20, 32, 190, 32);
    
    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(docType.toUpperCase(), 105, 45, { align: "center" });
    
    // Details
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${today}`, 20, 60);
    doc.text(`Ref: UNIV/${faculty.employee_id}/${new Date().getFullYear()}`, 20, 67);
    
    // Body Text
    doc.setFontSize(12);
    let body = docType === 'Experience Certificate' 
      ? `This is to certify that ${faculty.full_name} (ID: ${faculty.employee_id}) served in the ${faculty.department} department until ${request?.proposed_last_working_day}. During their tenure, they demonstrated excellence in their field.` 
      : `With reference to the resignation request, ${faculty.full_name} is hereby relieved of duties effective ${request?.proposed_last_working_day}. All dues have been cleared.`;
    
    doc.text(doc.splitTextToSize(body, 170), 20, 85);
    
    doc.text("Authorized Signatory", 140, 150);
    doc.text("Registrar Office", 140, 157);

    if (action === 'view') {
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`${docType.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
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
        <Alert severity="error">
          {loading ? 'Loading...' : 'Unable to load faculty data. Please try again.'}
        </Alert>
      </Box>
    );
  }

  // Handle case when no relieving request exists
  if (Object.keys(request || {}).length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box textAlign="center" py={10}>
          <LockIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Relieving Request Found
          </Typography>
          <Typography color="text.secondary" paragraph>
            You don't have any active relieving requests. Please submit a relieving request to access your certificates.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/faculty/relieving-request')}
            sx={{ mt: 2 }}
          >
            Submit Relieving Request
          </Button>
        </Box>
      </Container>
    );
  }

  const docs = [
    { 
      id: 'relieving', 
      title: 'Relieving Letter', 
      isReady: request?.relieving_letter_ready,
      description: 'Official document confirming the end of your employment.'
    },
    { 
      id: 'experience', 
      title: 'Experience Certificate', 
      isReady: request?.experience_cert_ready,
      description: 'Certificate detailing your work experience and tenure.'
    },
    { 
      id: 'service', 
      title: 'Service Certificate', 
      isReady: request?.service_cert_ready,
      description: 'Document confirming your service period and role.'
    },
    { 
      id: 'settlement', 
      title: 'Settlement Statement', 
      isReady: request?.settlement_ready,
      description: 'Final settlement details including dues and clearances.'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Official Documents
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Access and download your verified institutional certificates
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: 3,
        width: '100%'
      }}>
        {docs.map((doc) => (
          <Box key={doc.id} sx={{ width: '100%', display: 'flex' }}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip
                    label={doc.isReady ? 'READY' : 'PENDING'}
                    color={doc.isReady ? 'success' : 'default'}
                    size="small"
                    sx={{ 
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {doc.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {doc.description}
                </Typography>
                <Typography variant="caption" color={doc.isReady ? 'success.main' : 'text.secondary'} display="flex" alignItems="center">
                  {doc.isReady ? (
                    <>
                      <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                      Verified and signed by Registrar
                    </>
                  ) : (
                    <>
                      <ErrorIcon color="disabled" fontSize="small" sx={{ mr: 0.5 }} />
                      Under process by administration
                    </>
                  )}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                {doc.isReady ? (
                  <>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => generatePDF(doc.title, 'view')}
                      variant="outlined"
                      fullWidth
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => generatePDF(doc.title, 'download')}
                      variant="contained"
                      fullWidth
                    >
                      Download
                    </Button>
                  </>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled
                    startIcon={<LockIcon />}
                    sx={{ 
                      color: 'text.disabled',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'divider',
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    Locked
                  </Button>
                )}
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FacultyCertificates;
