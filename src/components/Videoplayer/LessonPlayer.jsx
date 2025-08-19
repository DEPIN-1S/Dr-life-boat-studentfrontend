import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './lessonPlayer.css'
import VideoPlayer from '../VideoPlayer'

const LessonPlayer = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [selectedFile, setSelectedFile] = useState(state)

  const lessons = state?.allFiles || []

  if (!selectedFile) {
    return <p>No file selected</p>
  }

  const renderFileViewer = () => {
    const { url, type } = selectedFile

    if (['mp4', 'mov', 'avi', 'mkv'].includes(type)) {
      return <VideoPlayer videoSources={url} />
    }

    if (type === 'pdf') {
      return (
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
          title="PDF Viewer"
          className="lessonPlayer-iframe"
          sandbox="allow-same-origin allow-scripts"
          allow="fullscreen"
        />
      )
    }

    if (type === 'ppt' || type === 'pptx') {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
          title="PPT Viewer"
          className="lessonPlayer-iframe"
          sandbox="allow-same-origin allow-scripts"
        />
      )
    }

    if (url.includes('google')) {
      return (
        <div style={{ position: 'relative' }} className="new-video">
          <iframe
            src={url}
            className="new-video"
            width="100%"
            height="580"
            allow="autoplay"
            title="Drive Content"
            allowFullScreen={true}
            style={{ border: 'none' }}
            sandbox="allow-same-origin allow-scripts"
          ></iframe>
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 10,
            }}
          >
            <img
              src="/logo1.png"
              alt="Company Logo"
              style={{ height: '50px', width: 'auto', opacity: 0.9 }}
            />
          </div>
        </div>
      )
    }

    return <p>Unsupported file type</p>
  }

  return (
    <div className="lessonPlayer-wrapper">
      <div className="lessonPlayer-left">
        <div className="lessonPlayer-header">
          <button onClick={() => navigate(-1)} className="lessonPlayer-back-btn">
            ← Back
          </button>
          <h2>{selectedFile.name}</h2>
        </div>
        <div className="lessonPlayer-media-wrapper">{renderFileViewer()}</div>
      </div>

      <div className="lessonPlayer-sidebar">
        <h3>All Lessons</h3>
        <div className="lessonPlayer-list">
          {/* {selectedFile.allFiles.map((file) => (
            <div onClick={() => setSelectedFile(file)}>
              {file.name} - {file.parent}
            </div>
          ))} */}
          {console.log(selectedFile, 'selectedFile')}
          {lessons.map((file, idx) => (
            <div
              key={idx}
              className={`lessonPlayer-item ${file.url === selectedFile.url ? 'active' : ''}`}
              onClick={() => setSelectedFile(file)}
            >
              <p className="lessonPlayer-file-name">{file.name}</p>
              <small className="lessonPlayer-file-type">{file.type}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LessonPlayer
