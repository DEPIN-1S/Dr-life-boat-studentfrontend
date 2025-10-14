import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import VideoPlayer from '../VideoPlayer'

const LessonPlayer = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [selectedFile, setSelectedFile] = useState(state)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const lessons = state?.allFiles || []

  if (!selectedFile) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h4 className="text-muted">No file selected</h4>
        </div>
      </div>
    )
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const handleMobileFileSelect = (file) => {
    setSelectedFile(file)
    setIsMobileSidebarOpen(false) // Close sidebar after selection
  }

  // Helper function to render the appropriate icon
  const renderFileIcon = (file, sizeClass = 'fs-4') => {
    const { type, url } = file

    if (type === 'pdf') {
      return <i className={`fas fa-file-pdf text-danger ${sizeClass}`}></i>
    }

    if (['mp4', 'mov', 'avi', 'mkv'].includes(type)) {
      return <i className={`fas fa-play-circle text-success ${sizeClass}`}></i>
    }

    if (type === 'ppt' || type === 'pptx') {
      return <i className={`fas fa-file-powerpoint text-warning ${sizeClass}`}></i>
    }

    // Fallback for Google Drive or other types
    if (url?.includes('google')) {
      return <i className={`fab fa-google-drive text-primary ${sizeClass}`}></i>
    }

    // Default fallback icon if none match
    return <i className={`fas fa-file text-secondary ${sizeClass}`}></i>
  }

  const renderFileViewer = () => {
    const { url, type } = selectedFile

    if (['mp4', 'mov', 'avi', 'mkv'].includes(type)) {
      return (
        <VideoPlayer
          src={url}
          title={selectedFile.name}
          className="w-100 rounded"
          style={{ height: '500px' }}
        />
      )
    }

    if (type === 'pdf') {
      return (
        <div className="w-100 h-100 d-flex flex-column bg-white rounded shadow-sm">
          <div className="p-2 bg-light border-bottom d-flex justify-content-between align-items-center">
            <span className="fw-medium text-dark">
              <i className="fas fa-file-pdf text-danger me-2"></i>
              PDF Viewer
            </span>
          </div>
          <iframe
            src={url}
            title="PDF Viewer"
            className="flex-grow-1 border-0"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      )
    }

    if (type === 'ppt' || type === 'pptx') {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
          title="PPT Viewer"
          className="w-100 rounded border-0"
          style={{ height: '700px' }}
          sandbox="allow-same-origin allow-scripts"
        />
      )
    }

    if (url.includes('google')) {
      return (
        <div className="position-relative">
          <iframe
            src={url}
            className="w-100 rounded border-0"
            style={{ height: '700px' }}
            allow="autoplay"
            title="Drive Content"
            allowFullScreen={true}
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      )
    }

    return (
      <div className="text-center p-5">
        <h5 className="text-muted">Unsupported file type</h5>
      </div>
    )
  }

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row g-0 h-100">
        {/* Main Content Area */}
        <div className="col-lg-9 col-12 bg-light">
          <div className="h-100 d-flex flex-column">
            {/* Header */}
            <div className="bg-white border-bottom px-3 px-md-4 py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <button
                    onClick={() => navigate(-1)}
                    className="btn btn-link text-dark p-0 me-2 me-md-3 text-decoration-none"
                  >
                    <i className="fas fa-arrow-left me-1 me-md-2"></i>
                    <span className="d-none d-sm-inline">Back</span>
                  </button>
                  <h4 className="mb-0 fs-6 fs-md-4 text-truncate">{selectedFile.name}</h4>
                </div>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-secondary btn-sm d-lg-none me-2"
                    onClick={toggleMobileSidebar}
                  >
                    <i className={`fas ${isMobileSidebarOpen ? 'fa-times' : 'fa-list'}`}></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Viewer */}
            <div className="flex-grow-1 p-2 p-md-4 overflow-auto">
              <div className="h-100">
                {renderFileViewer()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Desktop (Fixed and Scrollable) */}
        <div className="col-lg-3 d-none d-lg-block bg-white border-start position-fixed end-0" style={{ width: '22%', height: '100vh', zIndex: 1000 }}>
          <div className="h-100 d-flex flex-column">
            {/* Fixed Header */}
            <div className="p-3 border-bottom bg-light flex-shrink-0">
              <h5 className="mb-0 fw-bold text-primary">
                <i className="fas fa-play-circle me-2"></i>
                All Lessons
              </h5>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow-1 overflow-auto">
              {lessons.map((file, idx) => (
                <div
                  key={idx}
                  className={`p-3 border-bottom cursor-pointer ${
                    selectedFile.name === file.name
                      ? 'bg-primary bg-opacity-10 border-primary border-end-3'
                      : 'hover-bg-light'
                  }`}
                  onClick={() => setSelectedFile(file)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    <div className="me-3 flex-shrink-0">
                      {renderFileIcon(file)}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <h6 className="mb-1 fw-medium text-truncate">{file.name}</h6>
                      <small className="text-muted text-uppercase fw-bold">{file.type}</small>
                    </div>
                    <div className="flex-shrink-0">
                      {selectedFile.name === file.name && (
                        <i className="fas fa-chevron-right text-primary"></i>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="d-lg-none position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 9999 }}>
            {/* Backdrop */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-50"
              onClick={() => setIsMobileSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <div className="position-absolute top-0 end-0 bg-white h-100 shadow-lg" style={{ width: '80%', maxWidth: '350px' }}>
              <div className="h-100 d-flex flex-column">
                {/* Header */}
                <div className="p-3 bg-primary text-white d-flex justify-content-between align-items-center flex-shrink-0">
                  <h5 className="mb-0">
                    <i className="fas fa-play-circle me-2"></i>
                    All Lessons
                  </h5>
                  <button
                    className="btn btn-link text-white p-0"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <i className="fas fa-times fs-4"></i>
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-grow-1 overflow-auto">
                  {lessons.map((file, idx) => (
                    <div
                      key={idx}
                      className={`p-3 border-bottom cursor-pointer ${
                        selectedFile.name === file.name
                          ? 'bg-primary bg-opacity-10'
                          : ''
                      }`}
                      onClick={() => handleMobileFileSelect(file)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="me-3 flex-shrink-0">
                          {renderFileIcon(file, 'fs-3')}
                        </div>
                        <div className="flex-grow-1 min-width-0">
                          <h6 className="mb-1 fw-medium">{file.name}</h6>
                          <small className="text-muted text-uppercase fw-bold">{file.type}</small>
                        </div>
                        <div className="flex-shrink-0">
                          {selectedFile.name === file.name && (
                            <i className="fas fa-check-circle text-success fs-5"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonPlayer
