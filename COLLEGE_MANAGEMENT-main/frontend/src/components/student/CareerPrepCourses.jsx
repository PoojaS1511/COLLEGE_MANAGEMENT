import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  CardActions,
  Link,
  Divider
} from '@mui/material';
import { 
  School, 
  OpenInNew, 
  Refresh, 
  Error as ErrorIcon, 
  YouTube,
  Code,
  School as SchoolIcon,
  Computer,
  Star,
  StarHalf,
  StarBorder
} from '@mui/icons-material';

// Sample courses data
const SAMPLE_COURSES = [
  {
    id: 1,
    title: 'Python Programming - Full Course',
    platform: 'youtube',
    thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg',
    description: 'Learn Python from scratch with this comprehensive tutorial covering all the basics and more.',
    level: 'Beginner',
    duration: '4.5 hours',
    externalUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    source: 'YouTube',
    rating: 4.8
  },
  {
    id: 2,
    title: 'Web Development - HTML, CSS, JavaScript',
    platform: 'youtube',
    thumbnail: 'https://img.youtube.com/vi/PkZNo7MFNFg/maxresdefault.jpg',
    description: 'Full stack web development course covering modern web technologies including HTML, CSS, and JavaScript.',
    level: 'Beginner',
    duration: '6.5 hours',
    externalUrl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    source: 'YouTube',
    rating: 4.7
  },
  {
    id: 3,
    title: 'Machine Learning Specialization',
    platform: 'coursera',
    thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://d3c5s1hmka2e2b.cloudfront.net/uploads/topic/thumbnail/279/eb3c4e9f-4d8e-4e0e-b3e3-5c9c7f6c5a0a.png',
    description: 'Learn machine learning concepts and practical applications from industry experts.',
    level: 'Intermediate',
    duration: '3 months',
    externalUrl: 'https://www.coursera.org/learn/machine-learning',
    source: 'Coursera',
    rating: 4.9
  },
  {
    id: 4,
    title: 'Introduction to Computer Science',
    platform: 'mit',
    thumbnail: 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-programming-in-python-fall-2016/7c5b5b5b5b5b5b5b5b5b5b5b5b5b5b/6-0001f16.jpg',
    description: 'MIT OpenCourseWare - Introduction to Computer Science and Programming in Python',
    level: 'Beginner',
    duration: '9 weeks',
    externalUrl: 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-programming-in-python-fall-2016/',
    source: 'MIT OpenCourseWare',
    rating: 4.8
  },
  {
    id: 5,
    title: 'CS50: Introduction to Computer Science',
    platform: 'harvard',
    thumbnail: 'https://cs50.harvard.edu/college/2023/fall/weeks/0/notes/cs50.png',
    description: 'Harvard\'s introduction to computer science and programming. Learn algorithms, data structures, and more.',
    level: 'Beginner',
    duration: '11 weeks',
    externalUrl: 'https://cs50.harvard.edu/college/2023/fall/weeks/0/',
    source: 'Harvard CS50',
    rating: 4.9
  },
  {
    id: 6,
    title: 'Responsive Web Design',
    platform: 'freecodecamp',
    thumbnail: 'https://www.freecodecamp.org/news/content/images/size/w2000/2022/03/desktop-preview.jpg',
    description: 'Learn the languages that developers use to build webpages: HTML, CSS, and JavaScript.',
    level: 'Beginner',
    duration: '300 hours',
    externalUrl: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    source: 'freeCodeCamp',
    rating: 4.7
  }
];

const PlatformIcon = ({ platform }) => {
  switch(platform) {
    case 'youtube':
      return <YouTube color="error" />;
    case 'coursera':
      return <SchoolIcon color="primary" />;
    case 'mit':
    case 'harvard':
      return <School color="secondary" />;
    case 'freecodecamp':
      return <Code color="info" />;
    default:
      return <Computer />;
  }
};

const RatingStars = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<Star key={i} color="warning" fontSize="small" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<StarHalf key={i} color="warning" fontSize="small" />);
    } else {
      stars.push(<StarBorder key={i} color="warning" fontSize="small" />);
    }
  }
  
  return (
    <Box display="flex" alignItems="center">
      <Box display="flex" sx={{ '& .MuiSvgIcon-root': { fontSize: '1rem' } }}>
        {stars}
      </Box>
      {rating && (
        <Typography variant="caption" color="text.secondary" ml={0.5}>
          {rating.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};

const CareerPrepCourses = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  // Load courses
  const loadCourses = useCallback(async () => {
    console.log('[CareerPrepCourses] Loading courses...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use sample data directly
      console.log('[CareerPrepCourses] Using sample course data');
      setCourses(SAMPLE_COURSES);
      setSnackbarMessage('Courses loaded successfully');
      setSnackbarOpen(true);
      
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses. Please try again.');
      setSnackbarMessage('Failed to load courses');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    console.log('[CareerPrepCourses] Component mounted, loading courses');
    loadCourses();
  }, [loadCourses]);

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleRetry = () => {
    loadCourses();
  };

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} color="primary" />
        <Typography variant="h6" mt={2} color="textSecondary">
          Loading career resources...
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={2} textAlign="center">
          Please wait while we load the latest courses...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Alert 
          severity="error" 
          icon={<ErrorIcon fontSize="inherit" />}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<Refresh />}
          onClick={handleRetry}
          size="large"
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: '600' }}>
            Career Resources
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Free courses to enhance your skills and boost your career
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          size="small"
          color="primary"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to Top
        </Button>
      </Box>

      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: 2,
        mt: 2
      }}>
        {courses.slice(0, 12).map((course) => (
          <Card 
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
              border: '1px solid #f0f0f0',
              borderRadius: 1
            }}
          >
            <Box sx={{
              position: 'relative',
              paddingTop: '52%',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    border: 'none',
                  }}
                />
              ) : (
                <Typography>Preview not available</Typography>
              )}
            </Box>
            <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <CardActionArea 
                component="a" 
                href={course.externalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'stretch',
                  p: 1
                }}
              >
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Box sx={{ lineHeight: 0 }}>
                    <PlatformIcon platform={course.platform} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" ml={0.5} noWrap>
                    {course.source}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" component="h3" sx={{ 
                  fontWeight: '600',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 0.5,
                  lineHeight: 1.3,
                  fontSize: '0.9rem'
                }}>
                  {course.title}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.3,
                    fontSize: '0.75rem'
                  }}
                >
                  {course.description}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Chip 
                      label={course.level} 
                      size="small" 
                      color={course.level === 'Beginner' ? 'primary' : 'secondary'}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                    <Box display="flex" alignItems="center">
                      <RatingStars rating={course.rating} />
                      <Typography variant="caption" color="text.secondary" ml={0.5} sx={{ whiteSpace: 'nowrap' }}>
                        • {course.duration}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardActionArea>
              <Divider sx={{ my: 0.5 }} />
              <CardActions sx={{ p: '4px !important', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  color="primary"
                  endIcon={<OpenInNew sx={{ fontSize: '1rem' }} />}
                  href={course.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    fontSize: '0.7rem',
                    py: 0.25,
                    '& .MuiButton-endIcon': { ml: 0.25 }
                  }}
                >
                  View
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        ))}
      </Box>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {Math.min(courses.length, 12)} of {courses.length} courses
        </Typography>
        {courses.length > 12 && (
          <Button 
            variant="outlined" 
            size="small"
            color="primary"
            sx={{ mt: 1 }}
          >
            Load More Courses
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default CareerPrepCourses;