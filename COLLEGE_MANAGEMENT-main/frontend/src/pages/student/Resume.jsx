import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { supabase } from '../../lib/supabase';
import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import { API_URL } from '../../config';
import { useStudent } from '../../contexts/StudentContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Resume = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  // Use StudentContext to get student data
  const { student, loading: studentLoading } = useStudent();
  const studentId = student?.id;

  const checkExistingResume = async () => {
    try {
      if (!studentId) return;

      const response = await apiService.getStudentResume(studentId);
      if (response.success && response.uploaded) {
        setHasResume(true);
        setResumeUrl(response.data.file_url || '');
        setResumeData(response.data); // Store full resume data including analysis
      }
    } catch (error) {
      console.error('Error checking for existing resume:', error);
    }
  };

  useEffect(() => {
    if (studentId) {
      checkExistingResume();
    }
  }, [studentId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type on the frontend
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
      
      // Check MIME type
      const isValidType = allowedTypes.includes(selectedFile.type);
      
      // Check file extension as fallback
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension);
      
      console.log('File validation:', {
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        fileExtension: fileExtension,
        isValidType: isValidType,
        isValidExtension: isValidExtension
      });
      
      if (!isValidType && !isValidExtension) {
        toast.error('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.');
        // Clear the file input
        e.target.value = '';
        setFile(null);
        return;
      }
      
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        toast.error('File size too large. Please select a file smaller than 5MB.');
        e.target.value = '';
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (studentLoading) {
      toast.error('Please wait while we load your profile information...');
      return;
    }

    if (!studentId) {
      toast.error('Student profile not found. Please contact support.');
      console.error('Student ID not available:', { student, studentId });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('Uploading resume for student ID:', studentId);

      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('student_id', studentId);

      // Upload the file
      setAnalysisProgress(20);
      const uploadResponse = await axios({
        method: 'post',
        url: `${API_URL}/resume/upload`,
        data: formData,
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(uploadProgress);
          setAnalysisProgress(20 + Math.floor(uploadProgress * 0.6)); // Scale to 20-80%
        },
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      console.log('Upload response:', uploadResponse.data);

      if (!uploadResponse.data?.success) {
        throw new Error(uploadResponse.data?.error || 'Failed to upload resume');
      }

      setUploadProgress(100);
      setAnalysisProgress(100);

      // Update state with the response data
      setHasResume(true);
      setResumeUrl(uploadResponse.data.data?.file_url || '');

      toast.success('Resume uploaded successfully');

      // Refresh the resume data to show the uploaded file
      await checkExistingResume();

    } catch (error) {
      console.error('Error uploading resume:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload resume';
      toast.error(errorMessage);
      console.error('Full error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  };

  const handleAnalyzeResume = async () => {
    setIsAnalyzing(true);
    setShowAnalysis(false);

    try {
      console.log('Fetching resume data for analysis...');

      // Get the resume data from database
      const response = await apiService.getStudentResume(studentId);

      if (!response.success || !response.data) {
        toast.error('No resume found to analyze');
        return;
      }

      console.log('Resume data:', response.data);
      console.log('Metadata:', response.data.metadata);
      console.log('Analysis:', response.data.metadata?.analysis);

      // Check if we already have analysis in metadata
      if (response.data.metadata?.analysis) {
        console.log('Found existing analysis in database');
        setResumeData(response.data);
        setShowAnalysis(true);
        toast.success('Resume analysis loaded successfully');
        return;
      }

      // If no analysis exists, show error
      toast.error('No analysis found. Please re-upload your resume to generate analysis.');

    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error(error.message || 'Failed to load resume analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderProgressBar = (progress, label, color = 'bg-royal-600') => (
    <div className="w-full mb-2">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${color}`} 
          style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
        ></div>
      </div>
    </div>
  );

  // Show loading state while student data is being fetched
  if (studentLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if student data is not available
  if (!student || !studentId) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Not Found</h2>
                <p className="text-gray-600 mb-4">
                  We couldn't load your student profile. Please contact support.
                </p>
                <button
                  onClick={() => navigate('/student/profile')}
                  className="px-4 py-2 bg-royal-600 text-white rounded-md hover:bg-royal-700 transition-colors"
                >
                  Go to Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-royal-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">My Resume</h1>
            </div>
            {studentId && (
              <span className="text-sm text-gray-500">Student ID: {studentId}</span>
            )}
          </div>

          {hasResume && (
            <div className="mb-6 flex gap-4">
              <button
                onClick={handleViewResume}
                className="flex items-center px-4 py-2 bg-royal-100 text-royal-700 rounded-md hover:bg-royal-200 transition-colors"
              >
                <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-2" />
                View Current Resume
              </button>
              <button
                onClick={handleAnalyzeResume}
                disabled={isAnalyzing}
                className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          )}

          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-royal-500 transition-colors duration-200 cursor-pointer"
            onClick={() => document.getElementById('resume-upload').click()}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <ArrowUpTrayIcon className="h-12 w-12 text-royal-500" />
              <div className="text-sm text-gray-600">
                {file ? (
                  <p className="font-medium text-royal-700">Selected file: {file.name}</p>
                ) : (
                  <p>Drag and drop your resume here, or <span className="text-royal-600 font-medium">click to select</span></p>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="resume-upload"
                    className="cursor-pointer bg-royal-600 text-white px-6 py-2.5 rounded-md hover:bg-royal-700 transition-colors inline-block text-sm font-medium shadow-sm"
                  >
                    {file ? 'Change File' : 'Select File'}
                  </label>
                  <input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,.pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                </div>
                {file && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpload();
                    }}
                    disabled={isUploading}
                    className={`px-6 py-2.5 rounded-md text-white text-sm font-medium shadow-sm ${
                      isUploading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
                    } transition-all`}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Accepted file types:</span> .pdf, .doc, .docx, .txt
              <br />
              <span className="font-medium">Maximum file size:</span> 5MB
            </p>
          </div>

          {showAnalysis && resumeData?.metadata?.analysis && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Resume Analysis</h2>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Score */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-700">Overall Score</span>
                  <span className="text-2xl font-bold text-royal-600">
                    {resumeData.metadata.analysis.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-royal-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${resumeData.metadata.analysis.score}%` }}
                  />
                </div>
              </div>

              {/* Experience & Education Level */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-1">Experience Level</h4>
                  <p className="text-gray-900">{resumeData.metadata.analysis.experience_level}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-1">Education Level</h4>
                  <p className="text-gray-900">{resumeData.metadata.analysis.education_level}</p>
                </div>
              </div>

              {/* Skills Identified */}
              {resumeData.metadata.analysis.skills_identified?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Skills Identified</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.metadata.analysis.skills_identified.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {resumeData.metadata.analysis.strengths?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {resumeData.metadata.analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-green-700">{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {resumeData.metadata.analysis.recommendations?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {resumeData.metadata.analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-orange-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Resume Tips</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
              <li>Use clear section headings (Education, Experience, Skills)</li>
              <li>Include relevant keywords from the job description</li>
              <li>Quantify your achievements with numbers where possible</li>
              <li>Keep it concise (1-2 pages for most candidates)</li>
              <li>Use a clean, professional format</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;
