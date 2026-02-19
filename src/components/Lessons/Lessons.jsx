// src/pages/Lesson.jsx or wherever you have it
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaPlay, FaFilePdf, FaFilePowerpoint, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import './lessons.css'

import { API_BASE_URL } from '../../utils/apiConfig'

const Lesson = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const course = state?.courseDetails || {}
  const [openModules, setOpenModules] = useState([])
  const [openTopics, setOpenTopics] = useState([])
  const [openSubtopics, setOpenSubtopics] = useState([])

  const BASE_URL = API_BASE_URL

  if (!course || !course.modules) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>No course found</div>
  }

  const toggleModule = (i) => setOpenModules(prev =>
    prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
  )
  const toggleTopic = (m, t) => setOpenTopics(prev => {
    const key = `${m}-${t}`
    return prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
  })
  const toggleSubtopic = (m, t, s) => setOpenSubtopics(prev => {
    const key = `${m}-${t}-${s}`
    return prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
  })

  const SafeImage = ({ src, alt }) => {
    if (!src) return <div className="lesson-image-placeholder">Image</div>
    const url = src.startsWith('http') ? src : `${BASE_URL}/${src}`
    return <img src={url} alt={alt} className="lesson-image" onError={e => e.target.style.display = 'none'} />
  }

  const getIcon = (type) => {
    if (type?.toLowerCase().includes('video')) return <FaPlay className="text-success" />
    if (type?.toLowerCase().includes('pdf')) return <FaFilePdf className="text-danger" />
    if (type?.toLowerCase().includes('ppt')) return <FaFilePowerpoint className="text-warning" />
    return <FaFilePdf className="text-danger" />
  }

  // THIS IS THE MOST IMPORTANT PART
  // const goToPlayer = (clickedFile) => {
  //   // Collect EVERY file from the entire course
  //   const collectAllFiles = (modules) => {
  //     const files = []
  //     modules.forEach(mod => {
  //       if (mod.files?.length) files.push(...mod.files)
  //       mod.topics?.forEach(topic => {
  //         if (topic.files?.length) files.push(...topic.files)
  //         topic.subtopics?.forEach(sub => {
  //           if (sub.files?.length) files.push(...sub.files)
  //         })
  //       })
  //     })
  //     return files
  //   }

  //   const allFiles = collectAllFiles(course.modules)

  //   navigate('/lesson-player', {
  //     state: {
  //       allFiles,           // All PDFs + videos
  //       selected: clickedFile // The one user clicked
  //     }
  //   })
  // }
  const goToPlayer = (clickedFile) => {
    // Collect EVERY file from the entire course
    const collectAllFiles = (modules) => {
      const files = []
      modules.forEach(mod => {
        if (mod.files?.length) files.push(...mod.files)
        mod.topics?.forEach(topic => {
          if (topic.files?.length) files.push(...topic.files)
          topic.subtopics?.forEach(sub => {
            if (sub.files?.length) files.push(...sub.files)
          })
        })
      })
      return files
    }

    const allFiles = collectAllFiles(course.modules)

    navigate('/lesson-player', {
      state: {
        allFiles,
        selected: clickedFile,
        courseDetails: course   // ← THIS LINE FIXES MODULE FILTER
      }
    })
  }
  const renderFiles = (files) => {
    if (!files || files.length === 0) return null
    return files.map((f, i) => (
      <div
        key={i}
        className="lesson-file-row d-flex justify-content-between align-items-center p-3 border-bottom cursor-pointer hover-bg-light"
        onClick={() => goToPlayer(f)}
      >
        <div>
          <p className="mb-1 fw-500">{f.name || 'Untitled File'}</p>
          {f.duration && <small className="text-muted">{f.duration}</small>}
        </div>
        <div className="fs-3">
          {getIcon(f.type)}
        </div>
      </div>
    ))
  }

  return (
    <div className="lessons-container py-4">
      <div className="container">
        <h2 className="text-center mb-5 fw-bold text-primary">{course.heading}</h2>

        {course.modules.map((module, mIdx) => (
          <div key={module.id || mIdx} className="lesson-module mb-4">
            <div
              className="lesson-card p-4 bg-white shadow-sm rounded d-flex justify-content-between align-items-center"
              onClick={() => toggleModule(mIdx)}
            >
              <div className="d-flex align-items-center">
                <SafeImage src={module.image} alt={module.name} />
                <div className="ms-3">
                  <h4 className="mb-1">{module.name}</h4>
                  <small className="text-muted">{module.topics?.length || 0} Topics</small>
                </div>
              </div>
              {openModules.includes(mIdx) ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {openModules.includes(mIdx) && (
              <div className="mt-3">
                {renderFiles(module.files)}

                {module.topics?.map((topic, tIdx) => {
                  const tKey = `${mIdx}-${tIdx}`
                  return (
                    <div key={topic.id || tIdx} className="ms-4 mb-3">
                      <div
                        className="lesson-card p-3 bg-light rounded d-flex justify-content-between align-items-center"
                        onClick={() => toggleTopic(mIdx, tIdx)}
                      >
                        <div className="d-flex align-items-center">
                          <SafeImage src={topic.image} alt={topic.name} />
                          <h5 className="ms-3 mb-0">{topic.name}</h5>
                        </div>
                        {openTopics.includes(tKey) ? <FaChevronUp /> : <FaChevronDown />}
                      </div>

                      {openTopics.includes(tKey) && (
                        <div className="mt-2">
                          {renderFiles(topic.files)}
                          {topic.subtopics?.map((sub, sIdx) => {
                            const sKey = `${mIdx}-${tIdx}-${sIdx}`
                            return (
                              <div key={sub.id || sIdx} className="ms-4">
                                <div
                                  className="p-3 bg-white border rounded d-flex justify-content-between align-items-center"
                                  onClick={() => toggleSubtopic(mIdx, tIdx, sIdx)}
                                >
                                  <div className="d-flex align-items-center">
                                    <SafeImage src={sub.image} alt={sub.name} />
                                    <span className="ms-3">{sub.name}</span>
                                  </div>
                                  {openSubtopics.includes(sKey) ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                                {openSubtopics.includes(sKey) && renderFiles(sub.files)}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Lesson
