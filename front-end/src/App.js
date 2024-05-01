import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import './App.css';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [transcodedVideo1, setTranscodedVideo1] = useState(null);
  const [transcodedVideo2, setTranscodedVideo2] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTranscodedVideo();
  }, []);

  const fetchTranscodedVideo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/transcoded-video');
      setTranscodedVideo1(response.data.url[0]);
      setTranscodedVideo2(response.data.url[1]);
    } catch (error) {
      console.error('Error fetching transcoded video:', error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
  };

  const handleDropboxClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      setIsLoading(true);
      setUploadStatus('Uploading...');
      await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('Video uploaded successfully!');
      fetchTranscodedVideo();
    } catch (error) {
      console.error('Error uploading video:', error);
      setUploadStatus('An error occurred while uploading the video.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload1 = () => {
    const link = document.createElement('a');
    link.href = transcodedVideo1;
    link.download = 'transcoded_video_1080p.mp4';
    link.target="_blank";
    link.click();
  };

  const handleDownload2 = () => {
    const link = document.createElement('a');
    link.href = transcodedVideo2;
    link.download = 'transcoded_video_720p.mp4';
    link.target="_blank";
    link.click();
  };

  return (
    <div className="app">
      <h1>Video Transcoding Project</h1>
      <div
        className={`dropbox ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleDropboxClick}
      >
        <div className="dropbox-content">
          <p>Drag and drop a video file here or click to select a file</p>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
        </div>
      </div>
      {selectedFile && <p className="selected-file">Selected file: {selectedFile.name}</p>}
      <button className="upload-button" onClick={handleUpload} disabled={isLoading}>
        {isLoading ? <ClipLoader size={20} color="#ffffff" /> : 'Upload'}
      </button>
      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}

      <div className="transcoded-section">
        <h2>Transcoded Videos</h2>
        <div className="download-buttons">
          {transcodedVideo1 && (
            <button className="download-button" onClick={handleDownload1}>
              Download 1080p
            </button>
          )}
          {transcodedVideo2 && (
            <button className="download-button" onClick={handleDownload2}>
              Download 720p
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
