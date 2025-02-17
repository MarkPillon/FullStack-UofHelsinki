import { useState } from 'react';
import './App.css';

function App() {
  // State variables
  const [callData, setCallData] = useState(null);
  const [callId, setCallId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // API configurations
  const UPLOAD_API_URL = 'https://3j5kwinkm1.execute-api.us-east-1.amazonaws.com/prod/';
  const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key

  // File upload handler
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    // Validate file type and size
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError('Unsupported file type. Please upload an MP3, WAV, or OGG file.');
      return;
    }

    if (selectedFile.size > maxSize) {
      setUploadError('File size exceeds the 50MB limit.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const base64data = await readFileAsBase64(selectedFile);

      // Send the base64 data to the API
      const response = await fetch(UPLOAD_API_URL + "CallAnalyticsManager", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileData: base64data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload the file');
      }

      const responseData = await response.json();
      const backendCallId = responseData.callId;

      setCallId(backendCallId);
      setUploadSuccess(true);
      setSelectedFile(null);
      alert(`Upload successful! Your Call ID: ${backendCallId}`);
    } catch (err) {
      setUploadError(err.message);
      console.error('Upload Error:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  // Helper function to read file as base64
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Analytics lookup handler
  const fetchCallData = async () => {
    if (!callId) {
      setError('Call ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lookupUrl = `${UPLOAD_API_URL}CallAnalyticsManager?callId=${encodeURIComponent(callId)}`;
      const response = await fetch(lookupUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (!data?.callId) {
        throw new Error('No data found or incorrect data structure.');
      }

      setCallData(data);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Call Analytics Dashboard</h1>

      {/* File Upload Section */}
      <div className="upload-section">
        <h2>Upload New Call Recording</h2>
        <div className="upload-controls">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            accept=".mp3,.wav,.ogg,audio/*"
            className="file-input"
            disabled={uploadLoading}
            aria-label="Upload call recording"
          />
          <button
            onClick={handleFileUpload}
            disabled={!selectedFile || uploadLoading}
            className="upload-button"
            aria-label="Upload file"
          >
            {uploadLoading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>

        {selectedFile && (
          <div className="file-info">
            Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
          </div>
        )}

        {uploadSuccess && (
          <div className="success-message">
            ✅ Upload successful! Your Call ID: {callId}
          </div>
        )}

        {uploadError && (
          <div className="error-message">
            ⚠️ Error: {uploadError}
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="search-section">
        <h2>Lookup Existing Analysis</h2>
        <div className="search-controls">
          <input
            type="text"
            value={callId}
            onChange={(e) => setCallId(e.target.value)}
            placeholder="Enter Call ID"
            className="search-input"
            aria-label="Enter Call ID"
          />
          <button
            onClick={fetchCallData}
            disabled={loading}
            className="search-button"
            aria-label="Search call data"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      {(loading || uploadLoading) && (
        <div className="loading-indicator">
          {loading ? 'Loading data from AWS...' : 'Uploading file...'}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          ⚠️ Error: {error}
        </div>
      )}

      {/* Analytics Results */}
      {callData && (
        <div className="analytics-card">
          <div className="header-section">
            <h2>Call Analysis: {callData.callId}</h2>
          </div>

          <div className="timing-section">
            <h3>⏱ Processing Timeline</h3>
            <div className="timing-grid">
              <div>
                <label>Start:</label>
                <time>{new Date(callData.processingTime.start).toLocaleString()}</time>
              </div>
              <div>
                <label>End:</label>
                <time>{new Date(callData.processingTime.end).toLocaleString()}</time>
              </div>
            </div>
          </div>

          <div className="transcript-section">
            <h3>📜 Transcript</h3>
            <div className="transcript-content">
              {callData.transcript}
            </div>
          </div>

          <div className="insights-section">
            <h3>🔍 Key Insights</h3>
            <div className="insights-content">
              {callData.insights ? (
                <div>
                  {callData.insights.split('\n').map((insight, index) => (
                    <div key={index} className="insight-item">
                      {insight.replace(/^- /, '').trim()}
                    </div>
                  ))}
                </div>
              ) : (
                <div>No insights available</div>
              )}
            </div>
          </div>

          <div className="sentiment-section">
            <h3>📊 Sentiment Analysis</h3>
            <table className="sentiment-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sentiment</td>
                  <td>{callData.sentimentAnalysis?.Sentiment || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Neutral Score</td>
                  <td>{callData.sentimentAnalysis?.SentimentScore?.Neutral?.toFixed(2) || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Negative Score</td>
                  <td>{callData.sentimentAnalysis?.SentimentScore?.Negative?.toFixed(2) || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Mixed Score</td>
                  <td>{callData.sentimentAnalysis?.SentimentScore?.Mixed?.toFixed(2) || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Positive Score</td>
                  <td>{callData.sentimentAnalysis?.SentimentScore?.Positive?.toFixed(2) || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;