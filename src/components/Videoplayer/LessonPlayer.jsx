
import React, { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import VideoPlayer from '../VideoPlayer'
import './LessonPlayer.css' // ← Make sure this file exists

const LessonPlayer = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  const allFiles = state?.allFiles || []
  const courseDetailsdock = state?.courseDetails || {}
  const courseModules = courseDetailsdock.modules || []

  const [selectedFile, setSelectedFile] = useState(state?.selected || allFiles[0])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

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

  const fileId = getFileId(selectedFile.file_link || selectedFile.url)

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
        const isVideo = file.type?.toLowerCase().includes('video') || file.file_link?.includes('.mp4')
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
    const { name, type, file_link } = selectedFile

    if ((type === 'pdf' || file_link?.includes('drive.google.com')) && fileId) {
      return (
        <div className="d-flex flex-column bg-white rounded shadow-sm overflow-hidden h-100">
          <div className="p-3 bg-light border-bottom">
            <h6 className="mb-0 fw-bold text-truncate">{name}</h6>
          </div>
          {loading && (
            <div className="position-absolute top-50 start-50 translate-middle z-10">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          <iframe
            src={`https://drive.google.com/file/d/${fileId}/preview`}
            title={name}
            className="w-100 flex-grow-1 border-0"
            onLoad={() => setLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-popups allow-modals"
          />
        </div>
      )
    }

    const videoUrl = fileId
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : file_link

    return (
      <div className="bg-black rounded overflow-hidden shadow-sm h-100 d-flex flex-column">
        <div className="p-3 bg-light border-bottom">
          <h6 className="mb-0 fw-bold text-truncate">{name}</h6>
        </div>
        <div className="flex-grow-1 position-relative">
          <VideoPlayer src={videoUrl} title={name} />
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
                        file.type?.toLowerCase().includes('video') || file.file_link?.includes('.mp4')
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
                        file.type?.includes('video') || file.file_link?.includes('.mp4')
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
