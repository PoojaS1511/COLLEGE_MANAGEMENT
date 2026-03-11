import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

const HRDocuments = () => {
  const { moveToNextStep, moveToPreviousStep, onStepComplete } = useOutletContext();
  const [documents, setDocuments] = useState({
    identityProof: null,
    educationalCertificates: null,
    appointmentLetter: null,
    experienceCertificate: null
  });

  const [dragging, setDragging] = useState({
    identityProof: false,
    educationalCertificates: false,
    appointmentLetter: false,
    experienceCertificate: false
  });

  const [verificationStatus, setVerificationStatus] = useState({
    identityProof: 'pending',
    educationalCertificates: 'pending',
    appointmentLetter: 'pending',
    experienceCertificate: 'pending'
  });

  const fileInputRefs = {
    identityProof: useRef(null),
    educationalCertificates: useRef(null),
    appointmentLetter: useRef(null),
    experienceCertificate: useRef(null)
  };

  const documentTypes = {
    identityProof: {
      title: 'Identity Proof',
      description: 'Aadhaar Card or PAN Card',
      required: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSize: '5MB'
    },
    educationalCertificates: {
      title: 'Educational Certificates',
      description: 'Highest qualification certificate',
      required: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSize: '10MB'
    },
    appointmentLetter: {
      title: 'Appointment Letter',
      description: 'Official appointment letter from college',
      required: true,
      acceptedFormats: ['PDF'],
      maxSize: '5MB'
    },
    experienceCertificate: {
      title: 'Experience Certificate',
      description: 'Previous work experience (if any)',
      required: false,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSize: '5MB'
    }
  };

  const handleDragOver = (e, docType) => {
    e.preventDefault();
    setDragging(prev => ({
      ...prev,
      [docType]: true
    }));
  };

  const handleDragLeave = (e, docType) => {
    e.preventDefault();
    setDragging(prev => ({
      ...prev,
      [docType]: false
    }));
  };

  const handleDrop = (e, docType) => {
    e.preventDefault();
    setDragging(prev => ({
      ...prev,
      [docType]: false
    }));

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], docType);
    }
  };

  const handleFileSelect = (e, docType) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files[0], docType);
    }
  };

  const handleFileUpload = (file, docType) => {
    const docConfig = documentTypes[docType];
    
    // Validate file type
    const fileExtension = file.name.split('.').pop().toUpperCase();
    if (!docConfig.acceptedFormats.some(format => fileExtension.toUpperCase() === format)) {
      alert(`Invalid file format. Accepted formats: ${docConfig.acceptedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    const maxSizeMB = parseFloat(docConfig.maxSize);
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      alert(`File size exceeds ${docConfig.maxSize} limit`);
      return;
    }

    // Create file preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          file: file,
          name: file.name,
          size: fileSizeMB.toFixed(2),
          type: fileExtension,
          preview: e.target.result
        }
      }));

      // Set status to pending verification
      setVerificationStatus(prev => ({
        ...prev,
        [docType]: 'pending'
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (docType) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: null
    }));
    setVerificationStatus(prev => ({
      ...prev,
      [docType]: 'pending'
    }));
    
    // Clear file input
    if (fileInputRefs[docType].current) {
      fileInputRefs[docType].current.value = '';
    }
  };

  const handleVerifyDocument = (docType) => {
    // Simulate verification process
    setVerificationStatus(prev => ({
      ...prev,
      [docType]: 'verifying'
    }));

    setTimeout(() => {
      setVerificationStatus(prev => ({
        ...prev,
        [docType]: 'verified'
      }));
    }, 2000);
  };

  const validateDocuments = () => {
    const requiredDocs = Object.keys(documentTypes).filter(key => documentTypes[key].required);
    const missingDocs = requiredDocs.filter(docType => !documents[docType]);
    
    if (missingDocs.length > 0) {
      alert(`Please upload required documents: ${missingDocs.map(doc => documentTypes[doc].title).join(', ')}`);
      return false;
    }

    const unverifiedDocs = requiredDocs.filter(docType => verificationStatus[docType] !== 'verified');
    if (unverifiedDocs.length > 0) {
      alert('Please verify all required documents before continuing');
      return false;
    }

    return true;
  };

  const handleSaveAndContinue = () => {
    if (validateDocuments()) {
      // Save documents data
      const documentsData = {
        documents: Object.keys(documents).reduce((acc, key) => {
          if (documents[key]) {
            acc[key] = {
              name: documents[key].name,
              size: documents[key].size,
              type: documents[key].type,
              status: verificationStatus[key]
            };
          }
          return acc;
        }, {})
      };

      // Update onboarding data
      const existingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      localStorage.setItem('onboardingData', JSON.stringify({
        ...existingData,
        ...documentsData
      }));

      // Document upload completed
      if (onStepComplete) onStepComplete(2);
      if (moveToNextStep) moveToNextStep();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">✓ Verified</span>;
      case 'verifying':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">🔄 Verifying...</span>;
      case 'pending':
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">⏳ Pending</span>;
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return '📄';
      case 'JPG':
      case 'JPEG':
      case 'PNG':
        return '🖼️';
      default:
        return '📎';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Document Upload</h2>
        <p className="text-gray-600">Upload and verify employee documents for onboarding</p>
      </div>

      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">Upload Progress</span>
          <span className="text-sm text-gray-500">
            {Object.values(documents).filter(doc => doc !== null).length} / {Object.keys(documentTypes).length} documents uploaded
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ 
              width: `${(Object.values(documents).filter(doc => doc !== null).length / Object.keys(documentTypes).length) * 100}%` 
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(documentTypes).map(docType => {
          const docConfig = documentTypes[docType];
          const uploadedDoc = documents[docType];
          const status = verificationStatus[docType];

          return (
            <div key={docType} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{docConfig.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {docConfig.description}
                    {docConfig.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: {docConfig.acceptedFormats.join(', ')} • Max size: {docConfig.maxSize}
                  </p>
                </div>
                {getStatusBadge(status)}
              </div>

              {!uploadedDoc ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    dragging[docType] ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onDragOver={(e) => handleDragOver(e, docType)}
                  onDragLeave={(e) => handleDragLeave(e, docType)}
                  onDrop={(e) => handleDrop(e, docType)}
                  onClick={() => fileInputRefs[docType].current?.click()}
                >
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-gray-600 mb-2">Drag and drop file here, or click to browse</p>
                  <button 
                    type="button" 
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Choose File
                  </button>
                  <input
                    ref={fileInputRefs[docType]}
                    type="file"
                    accept={docConfig.acceptedFormats.map(format => `.${format.toLowerCase()}`).join(',')}
                    onChange={(e) => handleFileSelect(e, docType)}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">
                      {getFileIcon(uploadedDoc.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{uploadedDoc.name}</div>
                      <div className="text-sm text-gray-500">{uploadedDoc.size} MB • {uploadedDoc.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status === 'pending' && (
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={() => handleVerifyDocument(docType)}
                      >
                        Verify
                      </button>
                    )}
                    <button
                      type="button"
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                      onClick={() => handleRemoveFile(docType)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Form Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={moveToPreviousStep || (() => window.history.back())}
        >
          ← Back to Registration
        </button>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button 
            type="button" 
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
            onClick={() => {
              // Save as draft functionality
              alert('Documents saved as draft!');
            }}
          >
            💾 Save Draft
          </button>
          
          <button 
            type="button" 
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
            onClick={handleSaveAndContinue}
          >
            Save & Continue to Role Assignment →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDocuments;
