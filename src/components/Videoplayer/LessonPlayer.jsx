// src/components/Videoplayer/LessonPlayer.jsx
import React, { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import VideoPlayer from '../VideoPlayer'

const LessonPlayer = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  const allFiles = state?.allFiles || []
  const courseDetails = state?.courseDetails || {}
  const courseModules = courseDetails.modules || []

  const [selectedFile, setSelectedFile] = useState(state?.selected || allFiles[0])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filter states
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
        <div className="d-flex flex-column h-100 bg-white rounded shadow-sm overflow-hidden">
          <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold text-truncate">{name}</h6>
            {/* <a
              href={`https://drive.google.com/uc?export=download&id=${fileId}`}
              className="btn btn-success btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a> */}
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
            className="border-0 w-100 flex-grow-1"
            onLoad={() => setLoading(false)}
            style={{ minHeight: '60vh' }}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )
    }

    const videoUrl = fileId
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : file_link

    return <VideoPlayer src={videoUrl} title={name} />
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between shadow-sm" style={{ height: '60px' }}>
        <div className="d-flex align-items-center">
          <button onClick={() => navigate(-1)} className="btn btn-link text-dark p-0 me-3">
            ← Back
          </button>
          <h6 className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>
            {selectedFile.name}
          </h6>
        </div>

        <button
          className="btn btn-outline-primary btn-sm d-lg-none"
          onClick={() => setMobileSidebarOpen(true)}
        >
          Filter ({filteredFiles.length})
        </button>
      </div>

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Main Viewer */}
        <div className="flex-grow-1 overflow-auto p-3 bg-light">
          {renderViewer()}
        </div>

        {/* Desktop Sidebar */}
        <div className="d-none d-lg-flex flex-column bg-white border-start" style={{ width: '340px' }}>
          <div className="p-4 border-bottom bg-light">
            <h5 className="mb-3">Lessons ({filteredFiles.length})</h5>

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

          <div className="overflow-auto flex-grow-1">
            {filteredFiles.length === 0 ? (
              <div className="p-4 text-center text-muted">No files found</div>
            ) : (
              filteredFiles.map((file, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 border-bottom cursor-pointer transition-all ${
                    selectedFile.name === file.name ? 'bg-primary text-white' : 'hover-bg-light'
                  }`}
                  onClick={() => {
                    setSelectedFile(file)
                    setLoading(true)
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className={`fs-4 ${
                      file.type?.includes('video') ? 'fas fa-play-circle text-success' : 'fas fa-file-pdf text-danger'
                    }`} />
                    <div className="text-truncate flex-grow-1">{file.name}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="position-fixed inset-0 bg-black bg-opacity-50 z-50 d-lg-none" onClick={() => setMobileSidebarOpen(false)}>
          <div
            className="position-absolute top-0 end-0 bg-white h-100 shadow-lg overflow-hidden"
            style={{ width: '85%', maxWidth: '380px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-primary text-white d-flex justify-content-between align-items-center border-bottom">
              <h5 className="mb-0">Filter & Lessons</h5>
              <button className="btn-close btn-close-white" onClick={() => setMobileSidebarOpen(false)} />
            </div>

            <div className="p-3 border-bottom bg-light">
              <input
                type="text"
                placeholder="Search..."
                className="form-control form-control-sm mb-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select className="form-select form-select-sm mb-2" value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
                <option value="all">All Modules</option>
                {courseModules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select className="form-select form-select-sm" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
              {filteredFiles.map((file, i) => (
                <div
                  key={i}
                  className="px-4 py-3 border-bottom cursor-pointer hover-bg-light"
                  onClick={() => {
                    setSelectedFile(file)
                    setLoading(true)
                    setMobileSidebarOpen(false)
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className={`fs-5 ${
                      file.type?.includes('video') ? 'fas fa-play-circle text-success' : 'fas fa-file-pdf text-danger'
                    }`} />
                    <div>{file.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LessonPlayer
