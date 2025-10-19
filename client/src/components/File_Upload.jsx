import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";

function FileUpload({ onWorkflowStart, onWorkflowUpdate, onWorkflowComplete }) {
  const [file, setFile] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const pollingIntervalRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Poll workflow status every 1 second
  const startPollingWorkflowStatus = () => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/workflow-status');
        const workflow = response.data.workflow;

        if (workflow) {
          // Update parent component with current status
          if (onWorkflowUpdate) {
            onWorkflowUpdate(workflow);
          }

          // If workflow completed or failed, stop polling
          if (workflow.status === 'completed' || workflow.status === 'failed') {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            
            setUploading(false);
            
            if (workflow.status === 'completed') {
              setMessage(`✅ Success! Workflow completed. Email sent to ${recipientEmail}`);
              setMessageType('success');
            } else {
              setMessage(`❌ Workflow failed: ${workflow.error}`);
              setMessageType('error');
            }

            if (onWorkflowComplete) {
              onWorkflowComplete(workflow);
            }
          }
        }
      } catch (error) {
        console.error('Error polling workflow status:', error);
      }
    }, 1000); // Poll every 1 second
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Please select a file first!');
      setMessageType('error');
      return;
    }

    if (!recipientEmail) {
      setMessage('Please enter recipient email address!');
      setMessageType('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setMessage('Please enter a valid email address!');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('⏳ Uploading file and starting workflow...');
    setMessageType('info');

    // Notify parent that workflow is starting
    if (onWorkflowStart) {
      onWorkflowStart();
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("recipientEmail", recipientEmail);

      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage('⏳ File uploaded! Processing workflow...');
        setMessageType('info');
        
        // Start polling for workflow status
        startPollingWorkflowStatus();
        
        // Reset form fields (but keep uploading state true)
        setFile(null);
        document.getElementById('fileInput').value = '';
      }
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage('❌ Error: ' + errorMsg);
      setMessageType('error');
      setUploading(false);
      
      if (onWorkflowComplete) {
        onWorkflowComplete(null);
      }
    }
  };

  return (
    <div style={{ 
      padding: '30px', 
      maxWidth: '600px', 
      margin: '30px auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0, color: '#2c3e50' }}>📤 Upload Document</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Upload a document to trigger the automation workflow. 
        An email notification will be sent once processing is complete.
      </p>
      
      <form onSubmit={handleUpload}>
        {/* Email Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#2c3e50'
          }}>
            📧 Recipient Email Address *
          </label>
          <input 
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="interviewer@company.com"
            disabled={uploading}
            style={{ 
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4285f4'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <small style={{ color: '#999', fontSize: '12px' }}>
            This email will receive the upload notification
          </small>
        </div>

        {/* File Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#2c3e50'
          }}>
            📎 Select Document *
          </label>
          <input 
            id="fileInput"
            type="file" 
            onChange={(e) => setFile(e.target.files[0])}
            disabled={uploading}
            style={{ 
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              border: '2px dashed #e0e0e0',
              borderRadius: '6px',
              backgroundColor: '#fafafa',
              cursor: uploading ? 'not-allowed' : 'pointer',
              boxSizing: 'border-box'
            }}
          />
          {file && (
            <div style={{ 
              marginTop: '10px', 
              padding: '8px 12px',
              backgroundColor: '#e3f2fd',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#1976d2'
            }}>
              ✓ Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={uploading || !file || !recipientEmail}
          style={{
            width: '100%',
            padding: '14px 24px',
            backgroundColor: uploading || !file || !recipientEmail ? '#ccc' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: uploading || !file || !recipientEmail ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s',
            boxShadow: uploading || !file || !recipientEmail ? 'none' : '0 2px 4px rgba(66, 133, 244, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!uploading && file && recipientEmail) {
              e.target.style.backgroundColor = '#3367d6';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(66, 133, 244, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading && file && recipientEmail) {
              e.target.style.backgroundColor = '#4285f4';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(66, 133, 244, 0.3)';
            }
          }}
        >
          {uploading ? '⏳ Processing Workflow...' : '🚀 Upload & Execute Workflow'}
        </button>
      </form>
      
      {/* Status Message */}
      {message && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 
            messageType === 'error' ? '#ffebee' : 
            messageType === 'success' ? '#e8f5e9' : '#fff3e0',
          color: 
            messageType === 'error' ? '#c62828' : 
            messageType === 'success' ? '#2e7d32' : '#e65100',
          borderRadius: '6px',
          border: `1px solid ${
            messageType === 'error' ? '#ef9a9a' : 
            messageType === 'success' ? '#a5d6a7' : '#ffb74d'
          }`,
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
