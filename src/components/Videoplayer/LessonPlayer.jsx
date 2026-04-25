
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import VideoPlayer from '../VideoPlayer'
import { API_BASE_URL } from '../../utils/apiConfig'
import './LessonPlayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const LessonPlayer = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  const allFiles = state?.allFiles || []
  const courseDetailsdock = state?.courseDetails || {}
  const courseModules = courseDetailsdock.modules || []

  const [selectedFile, setSelectedFile] = useState(state?.selected || allFiles[0])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [secureUrl, setSecureUrl] = useState(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null)
  const [urlLoading, setUrlLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [containerWidth, setContainerWidth] = useState(null)
  const resizeObserverRef = React.useRef(null)

  const onRefChange = useCallback(node => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    if (node) {
      setContainerWidth(node.getBoundingClientRect().width);
      resizeObserverRef.current = new ResizeObserver(entries => {
        if (entries[0]) {
          setContainerWidth(entries[0].contentRect.width);
        }
      });
      resizeObserverRef.current.observe(node);
    }
  }, []);

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  /**
   * Fetch a pre-signed URL from the backend.
   * The backend verifies the JWT token before generating the URL.
   */
  const fetchSecureUrl = useCallback(async (s3Key) => {
    if (!s3Key) return null
    setUrlLoading(true)
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/drlifeboat/student/file/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ s3_key: s3Key })
      })
      const data = await response.json()
      if (data.result && data.url) {
        setSecureUrl(data.url)

        setLoadError(null);
        return data.url
      } else {
        console.error('Failed to get secure URL:', data.message)
        return null
      }
    } catch (err) {
      console.error('Error fetching secure URL:', err)
      return null
    } finally {
      setUrlLoading(false)
    }
  }, [])

  // Fetch secure URL whenever selectedFile changes
  useEffect(() => {
    setSecureUrl(null)
    setLoadError(null)
    // Revoke previous blob URL to avoid memory leaks
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl)
      setPdfBlobUrl(null)
    }
    const file = selectedFile
    if (!file) return

    // If file has an s3_key, fetch a pre-signed URL
    if (file.s3_key) {
      fetchSecureUrl(file.s3_key)
    }
    // If it's a Google Drive link, we use it directly (no S3 involved)
  }, [selectedFile, fetchSecureUrl])

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl)
    }
  }, [pdfBlobUrl])

  if (!selectedFile || allFiles.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <h4 className="text-danger">No lessons available</h4>
      </div>
    )
  }

  const getFileId = (link) => {
    if (!link) return null
    const m1 = link.match(/\/d\/([a-zA-Z0-9-_]+)/)
    const m2 = link.match(/[?&]id=([a-zA-Z0-9-_]+)/)
    return m1 ? m1[1] : m2 ? m2[1] : null
  }

  const topicOptions = useMemo(() => {
    if (selectedModule === 'all') return []
    const mod = courseModules.find(m => m.id == selectedModule)
    if (!mod) return []
    const list = []
    mod.topics?.forEach(t => {
      list.push({ id: t.id, name: t.name })
      t.subtopics?.forEach(st => list.push({ id: st.id, name: '  ↳ ' + st.name }))
    })
    return list
  }, [selectedModule, courseModules])

  const filteredFiles = useMemo(() => {
    return allFiles.filter(file => {
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false

      if (selectedType !== 'all') {
        const isVideo = file.type?.toLowerCase().includes('video') || file.s3_key?.includes('.mp4')
        if (selectedType === 'pdf' && isVideo) return false
        if (selectedType === 'video' && !isVideo) return false
      }

      if (selectedModule !== 'all') {
        let found = false
        courseModules.forEach(mod => {
          if (mod.id == selectedModule) {
            if (mod.files?.some(f => f.id === file.id)) found = true
            mod.topics?.forEach(t => {
              if (t.files?.some(f => f.id === file.id)) found = true
              t.subtopics?.forEach(st => {
                if (st.files?.some(f => f.id === file.id)) found = true
              })
            })
          }
        })
        if (!found) return false
      }

      if (selectedTopic !== 'all') {
        let found = false
        courseModules.forEach(mod => {
          mod.topics?.forEach(t => {
            if (t.id == selectedTopic && t.files?.some(f => f.id === file.id)) found = true
            t.subtopics?.forEach(st => {
              if (st.id == selectedTopic && st.files?.some(f => f.id === file.id)) found = true
            })
          })
        })
        if (!found) return false
      }

      return true
    })
  }, [allFiles, searchQuery, selectedModule, selectedTopic, selectedType, courseModules])

  const renderViewer = () => {
    const { name, type, file_link, s3_key } = selectedFile

    const fileId = getFileId(file_link)
    const isGoogleDrive = file_link?.includes('drive.google.com') && fileId
    const isDirectPdf = (type === 'pdf' || type === 'document' || s3_key?.toLowerCase().endsWith('.pdf'))

    // If we're still loading the pre-signed URL, show spinner
    if (s3_key && urlLoading) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white rounded shadow-sm" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading secure content...</p>
        </div>
      )
    }

    // For S3 files, use the pre-signed URL
    const resolvedUrl = s3_key ? secureUrl : (isGoogleDrive ? `https://drive.google.com/file/d/${fileId}/preview` : file_link)

    if (!resolvedUrl) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white rounded shadow-sm" style={{ minHeight: '60vh' }}>
          <i className="fas fa-lock text-muted mb-3" style={{ fontSize: '3rem' }}></i>
          <p className="text-muted">Content not available</p>
        </div>
      )
    }

    // PDF / Google Drive viewer
    if (isGoogleDrive || isDirectPdf) {
      const isReactPdf = isDirectPdf && !isGoogleDrive && secureUrl;
      let pdfSrc = isGoogleDrive ? resolvedUrl : secureUrl;
        
      // If it's a direct PDF (fallback iframe), append parameters to hide the sidebar and toolbar for a clean view
      if (isDirectPdf && !isGoogleDrive && pdfSrc) {
        pdfSrc = `${pdfSrc}#toolbar=0&navpanes=0&view=FitH`;
      }

      return (
        <div className="d-flex flex-column bg-white rounded shadow-sm overflow-hidden h-100 no-download-container" style={{ position: 'relative' }}>
          <div className="p-3 bg-light border-bottom">
            <h6 className="mb-0 fw-bold text-truncate">{name}</h6>
          </div>
          {loading && !loadError && (
            <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 10 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          
          {loadError ? (
            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 p-5 text-center">
              <i className="fas fa-exclamation-circle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-danger">Failed to load document</h5>
              <p className="text-muted small">{loadError}</p>
              <button className="btn btn-sm btn-outline-primary mt-3" onClick={() => fetchSecureUrl(s3_key)}>
                Retry
              </button>
            </div>
          ) : isReactPdf ? (
            <div 
              className="w-100 flex-grow-1 overflow-auto custom-scrollbar py-4" 
              style={{ backgroundColor: '#525659' }}
              onContextMenu={(e) => e.preventDefault()}
              ref={onRefChange}
            >
              <Document
                file={secureUrl}
                onLoadSuccess={({ numPages }) => {
                  setNumPages(numPages);
                  setLoading(false);
                  setLoadError(null);
                }}
                onLoadError={(error) => {
                  console.error('PDF load error:', error);
                  setLoadError("Failed to load PDF. It might be corrupted or unavailable.");
                  setLoading(false);
                }}
                loading={null}
              >
                {Array.from(new Array(numPages || 0), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={containerWidth ? Math.min(containerWidth * 0.95, 800) : 800}
                    className="react-pdf-page-wrapper mb-4"
                  />
                ))}
              </Document>
            </div>
          ) : (
            <>
              <iframe
                src={pdfSrc}
                title={name}
                className="w-100 flex-grow-1 border-0"
                onLoad={() => setLoading(false)}
                allowFullScreen
              />
              <div className="pdf-download-blocker" onContextMenu={(e) => e.preventDefault()}></div>
            </>
          )}
        </div>
      )
    }

    // Video viewer
    return (
      <div className="bg-black rounded overflow-hidden shadow-sm h-100 d-flex flex-column">
        <div className="p-3 bg-light border-bottom">
          <h6 className="mb-0 fw-bold text-truncate">{name}</h6>
        </div>
        <div className="flex-grow-1 position-relative">
          <VideoPlayer src={resolvedUrl} title={name} />
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light">

      {/* Top Bar */}
      <div className="bg-white border-bottom px-3 px-md-4 py-3 shadow-sm d-flex align-items-center justify-content-between flex-shrink-0" style={{ height: '64px' }}>
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-link text-dark p-0">
            ← Back
          </button>
          <h6 className="mb-0 text-truncate" style={{ maxWidth: '500px' }}>
            {selectedFile.name}
          </h6>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="btn btn-outline-primary btn-sm d-lg-none mobile-toggle-btn"
          onClick={() => setMobileSidebarOpen(true)}
        >
          Lessons ({filteredFiles.length})
        </button>
      </div>

      {/* Main Layout */}
      <div className="d-flex flex-grow-1 overflow-hidden">

        {/* Viewer Area */}
        <div className="flex-grow-1 overflow-auto content-area">
          {renderViewer()}
        </div>

        {/* Desktop Sidebar */}
        <div className="d-none d-lg-flex flex-column bg-white border-start desktop-sidebar">
          <div className="p-4 border-bottom bg-light">
            <h5 className="mb-3 fw-bold">Lessons ({filteredFiles.length})</h5>

            <input
              type="text"
              placeholder="Search lessons..."
              className="form-control form-control-sm mb-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="form-select form-select-sm mb-2"
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value)
                setSelectedTopic('all')
              }}
            >
              <option value="all">All Modules</option>
              {courseModules.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {selectedModule !== 'all' && topicOptions.length > 0 && (
              <select
                className="form-select form-select-sm mb-2"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="all">All Topics</option>
                {topicOptions.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}

            <select
              className="form-select form-select-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF Only</option>
              <option value="video">Video Only</option>
            </select>
          </div>

          {/* Scrollable Lesson List */}
          <div  className="flex-grow-1 overflow-auto custom-scrollbar">
            {filteredFiles.length === 0 ? (
              <div className="p-5 text-center text-muted">No lessons found</div>
            ) : (
              filteredFiles.map((file, i) => (
                <div
                  key={file.id || i}
                  className={`px-4 py-3 border-bottom cursor-pointer transition-all hover-bg-light ${
                    (selectedFile.id === file.id || selectedFile.name === file.name) ? 'lesson-item-active' : ''
                  }`}
                  onClick={() => {
                    setSelectedFile(file)
                    setLoading(true)
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i
                      className={`fs-4 ${
                        file.type?.toLowerCase().includes('video') || file.s3_key?.includes('.mp4')
                          ? 'fas fa-play-circle text-success'
                          : 'fas fa-file-pdf text-danger'
                      }`}
                    />
                    <div className="text-truncate">{file.name}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="mobile-sidebar-overlay"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="mobile-sidebar">
            <div className="mobile-sidebar-header">
              <h5 className="mb-0">Lessons</h5>
              <button
                className="btn-close btn-close-white"
                onClick={() => setMobileSidebarOpen(false)}
              />
            </div>

            <div className="p-3 border-bottom bg-light">
              <input
                type="text"
                placeholder="Search..."
                className="form-control form-control-sm mb-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="form-select form-select-sm mb-2"
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value)
                  setSelectedTopic('all')
                }}
              >
                <option value="all">All Modules</option>
                {courseModules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select
                className="form-select form-select-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="overflow-auto flex-grow-1 custom-scrollbar">
              {filteredFiles.map((file, i) => (
                <div
                  key={file.id || i}
                  className="px-4 py-3 border-bottom cursor-pointer hover-bg-light"
                  onClick={() => {
                    setSelectedFile(file)
                    setLoading(true)
                    setMobileSidebarOpen(false)
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i
                      className={`fs-5 ${
                        file.type?.includes('video') || file.s3_key?.includes('.mp4')
                          ? 'fas fa-play-circle text-success'
                          : 'fas fa-file-pdf text-danger'
                      }`}
                    />
                    <div>{file.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LessonPlayer
