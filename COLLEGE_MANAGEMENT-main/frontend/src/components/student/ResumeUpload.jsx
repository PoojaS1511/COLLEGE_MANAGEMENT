import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
    },
  });

  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: 'Please select a file first', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploading(true);
      setMessage({ text: '', type: '' });
      
      // Replace with your actual API endpoint
      const response = await axios.post('/api/student/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add your auth token if needed
          // 'Authorization': `Bearer ${yourAuthToken}`
        }
      });

      setMessage({ 
        text: 'Resume uploaded successfully!', 
        type: 'success' 
      });
      setFile(null);
    } catch (error) {
      console.error('Error uploading resume:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to upload resume', 
        type: 'error' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Upload Your Resume
      </Typography>
      
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: 'primary.main',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          mb: 2,
          minHeight: 150,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography>
          {isDragActive
            ? 'Drop the resume here...'
            : file
            ? file.name
            : 'Drag and drop your resume here, or click to select files'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Supported formats: PDF, DOC, DOCX
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!file || uploading}
        fullWidth
        sx={{ mb: 2 }}
      >
        {uploading ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            Uploading...
          </>
        ) : (
          'Upload Resume'
        )}
      </Button>

      {message.text && (
        <Typography 
          color={message.type === 'error' ? 'error' : 'success'}
          sx={{ mt: 1 }}
        >
          {message.text}
        </Typography>
      )}
    </Box>
  );
};

export default ResumeUpload;