import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

const Documents = () => {
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
    if (!docConfig.acceptedFormats.includes(fileExtension)) {
      alert(`Invalid file format. Accepted formats: ${docConfig.acceptedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    const maxSizeMB = parseInt(docConfig.maxSize);
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
      onStepComplete(2);
      moveToNextStep();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="document-status status-verified">✓ Verified</span>;
      case 'verifying':
        return <span className="document-status status-pending">🔄 Verifying...</span>;
      case 'pending':
        return <span className="document-status status-pending">⏳ Pending</span>;
      default:
        return <span className="document-status status-pending">⏳ Pending</span>;
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'PDF':
        return '📄';
      case 'JPG':
      case 'PNG':
        return '🖼️';
      default:
        return '📎';
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Document Upload</h2>
        <p>Upload and verify employee documents for onboarding</p>
      </div>

      <div className="progress-indicator" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontWeight: '600', color: '#1f2937' }}>Upload Progress</span>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {Object.values(documents).filter(doc => doc !== null).length} / {Object.keys(documentTypes).length} documents uploaded
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${(Object.values(documents).filter(doc => doc !== null).length / Object.keys(documentTypes).length) * 100}%` 
            }}
          />
        </div>
      </div>

      {Object.keys(documentTypes).map(docType => {
        const docConfig = documentTypes[docType];
        const uploadedDoc = documents[docType];
        const status = verificationStatus[docType];

        return (
          <div key={docType} className="document-upload-section">
            <div className="document-upload-header">
              <div>
                <h3 className="document-title">{docConfig.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0' }}>
                  {docConfig.description}
                  {docConfig.required && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}> *</span>}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0' }}>
                  Accepted formats: {docConfig.acceptedFormats.join(', ')} • Max size: {docConfig.maxSize}
                </p>
              </div>
              {getStatusBadge(status)}
            </div>

            {!uploadedDoc ? (
              <div
                className={`upload-area ${dragging[docType] ? 'dragging' : ''}`}
                onDragOver={(e) => handleDragOver(e, docType)}
                onDragLeave={(e) => handleDragLeave(e, docType)}
                onDrop={(e) => handleDrop(e, docType)}
                onClick={() => fileInputRefs[docType].current?.click()}
              >
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  Drag and drop file here, or click to browse
                </div>
                <button type="button" className="upload-button">
                  Choose File
                </button>
                <input
                  ref={fileInputRefs[docType]}
                  type="file"
                  accept={docConfig.acceptedFormats.map(format => `.${format.toLowerCase()}`).join(',')}
                  onChange={(e) => handleFileSelect(e, docType)}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-icon">
                  {getFileIcon(uploadedDoc.type)}
                </div>
                <div className="file-info">
                  <div className="file-name">{uploadedDoc.name}</div>
                  <div className="file-size">{uploadedDoc.size} MB • {uploadedDoc.type}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {status === 'pending' && (
                    <button
                      type="button"
                      className="btn btn-success"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                      onClick={() => handleVerifyDocument(docType)}
                    >
                      Verify
                    </button>
                  )}
                  <button
                    type="button"
                    className="file-remove"
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

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => alert('No previous step')}
        >
          ← Back to Registration
        </button>
        
        <div className="form-actions-right">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => {
              // Save as draft functionality
              alert('Documents saved as draft!');
            }}
          >
            💾 Save Draft
          </button>
          
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleSaveAndContinue}
          >
            Save & Continue to Role Assignment →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Documents;
