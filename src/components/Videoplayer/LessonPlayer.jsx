import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import VideoPlayer from '../VideoPlayer'

const LessonPlayer = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [selectedFile, setSelectedFile] = useState(state)

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
            {/* <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary">
                <i className="fas fa-download"></i>
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="fas fa-expand"></i>
              </button>
            </div> */}
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
                    data-bs-toggle="offcanvas"
                    data-bs-target="#lessonsOffcanvas"
                  >
                    <i className="fas fa-list"></i>
                  </button>
                  {/* <div className="dropdown d-none d-md-block">
                    <button className="btn btn-link text-dark p-0" type="button">
                      <div className="d-flex align-items-center">
                        <span className="me-2 d-none d-lg-inline">test12</span>
                        <span className="text-muted small d-none d-lg-inline">STD 121145</span>
                        <div className="bg-warning rounded-circle ms-2" style={{ width: '32px', height: '32px' }}></div>
                      </div>
                    </button>
                  </div> */}
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

        {/* Right Sidebar - Desktop */}
        <div className="col-lg-3 d-none d-lg-block bg-white border-start">
          <div className="h-100 d-flex flex-column">
            <div className="p-3 border-bottom bg-light">
              <h5 className="mb-0 fw-bold text-primary">
                <i className="fas fa-play-circle me-2"></i>
                All Lessons
              </h5>
            </div>

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
                    <div className="me-3">
                      {file.type === 'pdf' && <i className="fas fa-file-pdf text-danger fs-4"></i>}
                      {['mp4', 'mov', 'avi', 'mkv'].includes(file.type) && <i className="fas fa-play-circle text-success fs-4"></i>}
                      {(file.type === 'ppt' || file.type === 'pptx') && <i className="fas fa-file-powerpoint text-warning fs-4"></i>}
                      {file.url?.includes('google') && <i className="fab fa-google-drive text-primary fs-4"></i>}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-medium text-truncate">{file.name}</h6>
                      <small className="text-muted text-uppercase fw-bold">{file.type}</small>
                    </div>
                    {selectedFile.name === file.name && (
                      <i className="fas fa-chevron-right text-primary"></i>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Offcanvas for Lessons */}
        <div className="offcanvas offcanvas-end d-lg-none" tabIndex="-1" id="lessonsOffcanvas">
          <div className="offcanvas-header bg-primary text-white">
            <h5 className="offcanvas-title">
              <i className="fas fa-play-circle me-2"></i>
              All Lessons
            </h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body p-0">
            {lessons.map((file, idx) => (
              <div
                key={idx}
                className={`p-3 border-bottom cursor-pointer ${
                  selectedFile.name === file.name
                    ? 'bg-primary bg-opacity-10'
                    : ''
                }`}
                onClick={() => {
                  setSelectedFile(file)
                  // Close offcanvas after selection on mobile
                  const offcanvasElement = document.getElementById('lessonsOffcanvas')
                  const offcanvas = bootstrap?.Offcanvas?.getInstance(offcanvasElement)
                  offcanvas?.hide()
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    {file.type === 'pdf' && <i className="fas fa-file-pdf text-danger fs-3"></i>}
                    {['mp4', 'mov', 'avi', 'mkv'].includes(file.type) && <i className="fas fa-play-circle text-success fs-3"></i>}
                    {(file.type === 'ppt' || file.type === 'pptx') && <i className="fas fa-file-powerpoint text-warning fs-3"></i>}
                    {file.url?.includes('google') && <i className="fab fa-google-drive text-primary fs-3"></i>}
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-medium">{file.name}</h6>
                    <small className="text-muted text-uppercase fw-bold">{file.type}</small>
                  </div>
                  {selectedFile.name === file.name && (
                    <i className="fas fa-check-circle text-success fs-5"></i>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonPlayer
