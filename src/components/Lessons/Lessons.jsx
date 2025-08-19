import React, { useState } from 'react'
import {
  FaPlay,
  FaFilePdf,
  FaRegEdit,
  FaChevronDown,
  FaChevronUp,
  FaLock,
  FaFilePowerpoint,
} from 'react-icons/fa'
import './lessons.css'
import { useNavigate } from 'react-router-dom'

const Lesson = ({ data, onFileSelect }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('chapters')
  const [openModules, setOpenModules] = useState([])
  const [openTopics, setOpenTopics] = useState([])
  const [openSubtopics, setOpenSubtopics] = useState([])

  const collectAllFilesFromModules = (modules = []) => {
    const allFiles = []

    modules.forEach((module) => {
      if (module.files?.length) {
        module.files.forEach((file) =>
          allFiles.push({
            ...file,
            parent: `Module: ${module.name}`,
          }),
        )
      }

      module.topics?.forEach((topic) => {
        if (topic.files?.length) {
          topic.files.forEach((file) =>
            allFiles.push({
              ...file,
              parent: `Topic: ${topic.name}`,
            }),
          )
        }

        topic.subtopics?.forEach((sub) => {
          if (sub.files?.length) {
            sub.files.forEach((file) =>
              allFiles.push({
                ...file,
                parent: `Subtopic: ${sub.name}`,
              }),
            )
          }
        })
      })
    })

    return allFiles
  }

  const toggleModule = (index) => {
    setOpenModules((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  const toggleTopic = (moduleIndex, topicIndex) => {
    const key = `${moduleIndex}-${topicIndex}`
    setOpenTopics((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }
  const toggleSubtopic = (moduleIndex, topicIndex, subIndex) => {
    const key = `${moduleIndex}-${topicIndex}-${subIndex}`
    setOpenSubtopics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }
  const renderFiles = (files) => {
    if (!files || files.length === 0) return null

    return files.map((file, i) => {
      const fileUrl = file?.file || file.file_link
      const fileName = file.name || fileUrl || 'No File'
      const extension = fileUrl

      const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(extension)
      const isPdf = extension === 'pdf'
      const isClickable = file.isPurchased

      // const handleClick = () => {
      // if (isClickable) {
      //   navigate('/lesson-player', {
      //     state: {
      //       url: file.file_link
      //         ? fileUrl.replace(/\/view(\?.*)?$/, '/preview')
      //         : `import.meta.env.VITE_BASE_URL${fileUrl}`,
      //       name: fileName,
      //       type: extension,
      //       duration: file.duration || null,
      //       allFiles: [...collectAllFilesFromModules],
      //     },
      //   })
      // }
      //uncomment if you want the video to be played in same page
      // if (isClickable && onFileSelect) {
      //   onFileSelect({
      //     url: file.file_link
      //       ? fileUrl.replace(/\/view(\?.*)?$/, '/preview')
      //       : `import.meta.env.VITE_BASE_URL${fileUrl}`,
      //     name: fileName,
      //     type: extension,
      //     duration: file.duration || null,
      //   })
      //   window.scrollTo({ top: 0, behavior: 'smooth' })
      // }
      // }
      const handleClick = () => {
        if (isClickable) {
          const allFiles = collectAllFilesFromModules(data.modules).map((f) => ({
            name: f.name || 'No Name',
            type: f.type,
            url: f.file_link
              ? f.file_link.replace(/\/view(\?.*)?$/, '/preview')
              : `import.meta.env.VITE_BASE_URL${f.file}`,
            duration: f.duration || '',
            parent: f.parent,
          }))

          const formattedFile = {
            url: file.file_link
              ? fileUrl.replace(/\/view(\?.*)?$/, '/preview')
              : `import.meta.env.VITE_BASE_URL${fileUrl}`,
            name: fileName,
            type: extension,
            duration: file.duration || null,
            allFiles, // pass flat list
          }

          navigate('/lesson-player', {
            state: formattedFile,
          })
        }
      }

      console.log(isClickable, 'isClickable')

      return (
        <div
          key={i}
          className="lesson-subtopic"
          onClick={handleClick}
          style={{ cursor: isClickable ? 'pointer' : 'not-allowed', opacity: fileUrl ? 1 : 0.5 }}
        >
          <div>
            <p>
              {/* {fileName?.includes('drive.google.com')
              ? 'GOOGLE DRIVE'
              : fileName?.includes('docs.google.com')
                ? 'PRESENTATION'
                : 'FILE'} */}
              {file.name}
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <p>{file.type}</p>
              <p>
                {/* {extension.includes(extension)
              ? `Duration | ${file.duration || 'N/A'}`
              : extension.includes('presentation')
                ? 'GOOGLE DRIVE (PRESENTATION)'
                : extension.includes('file')
                  ? 'FILE'
                  : 'UNKNOWN'} */}
                {file.duration}
              </p>
            </div>
          </div>
          {isClickable ? (
            file.type == 'video' ? (
              <FaPlay />
            ) : file.type == 'pdf' ? (
              <FaFilePdf />
            ) : file.type == 'ppt' ? (
              <FaFilePowerpoint />
            ) : (
              <FaFilePdf />
            )
          ) : (
            <FaLock />
          )}
        </div>
      )
    })
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chapters':
        return (
          <div className="lesson-container">
            <h4>{data.heading}</h4>
            {data.modules?.map((module, moduleIndex) => (
              <div key={module.id} className="lesson-chapter">
                <div className="lesson-header" onClick={() => toggleModule(moduleIndex)}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {module.image ? (
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}/${module.image}`}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/logo.png'
                        }}
                        style={{ height: '30px', width: '30px', marginRight: '10px' }}
                      />
                    ) : (
                      <div style={{ height: '30px', width: '30px', marginRight: '10px' }} />
                    )}
                    {module.name}
                  </div>
                  {openModules.includes(moduleIndex) ? <FaChevronUp /> : <FaChevronDown />}
                </div>

                {openModules.includes(moduleIndex) && (
                  <>
                    <div className="lesson-subtopic-files">{renderFiles(module.files)}</div>

                    {module.topics?.map((topic, topicIndex) => {
                      const topicKey = `${moduleIndex}-${topicIndex}`
                      return (
                        <div key={topic.id} className="lesson-topic">
                          <div
                            className="lesson-subheader"
                            onClick={() => toggleTopic(moduleIndex, topicIndex)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {topic.image ? (
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}/${topic?.image}`}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = '/logo.png'
                                  }}
                                  style={{ height: '30px', width: '30px', marginRight: '10px' }}
                                />
                              ) : (
                                <div
                                  style={{ height: '30px', width: '30px', marginRight: '10px' }}
                                />
                              )}
                              {topic.name}
                            </div>
                            {openTopics.includes(topicKey) ? <FaChevronUp /> : <FaChevronDown />}
                          </div>

                          {openTopics.includes(topicKey) && (
                            <>
                              <div className="lesson-subtopic-files">
                                {renderFiles(topic.files)}
                              </div>

                              {topic.subtopics?.map((sub, subIndex) => (
                                <div key={sub.id} className="lesson-subtopic">
                                  <div
                                    className="lesson-subheader"
                                    onClick={() =>
                                      toggleSubtopic(moduleIndex, topicIndex, subIndex)
                                    }
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      {sub?.image ? (
                                        <img
                                          src={`${import.meta.env.VITE_BASE_URL}/${sub?.image}`}
                                          onError={(e) => {
                                            e.currentTarget.onerror = null
                                            e.currentTarget.src = '/logo.png'
                                          }}
                                          style={{
                                            height: '30px',
                                            width: '30px',
                                            marginRight: '10px',
                                          }}
                                        />
                                      ) : (
                                        <div
                                          style={{
                                            height: '30px',
                                            width: '30px',
                                            marginRight: '10px',
                                          }}
                                        />
                                      )}
                                      {sub.name}
                                    </div>
                                    {openSubtopics.includes(
                                      `${moduleIndex}-${topicIndex}-${subIndex}`,
                                    ) ? (
                                      <FaChevronUp />
                                    ) : (
                                      <FaChevronDown />
                                    )}
                                  </div>
                                  {openSubtopics.includes(
                                    `${moduleIndex}-${topicIndex}-${subIndex}`,
                                  ) && (
                                    <div className="lesson-subtopic-files">
                                      {renderFiles(sub.files)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            ))}
          </div>
        )
      case 'videos':
        return (
          <div className="lesson-item">
            <p>{data.heading} VIDEOS</p>
            <p>Duration | 00:13:00</p>
            <FaPlay />
          </div>
        )
      case 'notes':
        return (
          <div className="lesson-item">
            <p>{data.heading} NOTES</p>
            <p>Pages - 4</p>
            <FaFilePdf />
          </div>
        )
      case 'tests':
        return (
          <>
            <h4>Mock Test</h4>
            <div className="lesson-item">
              <p>Mock Test - 1</p>
              <p>Questions: 5 | 00:05:00</p>
              <FaRegEdit />
            </div>
            <div className="lesson-item">
              <p>Mock Test - 2</p>
              <p>Questions: 5 | 00:05:00</p>
              <FaRegEdit />
            </div>
          </>
        )
      default:
        return 'chapters'
    }
  }

  return (
    <div className="lesson-container">
      <div className="tabs">
        <button
          onClick={() => setActiveTab('chapters')}
          className={activeTab === 'chapters' ? 'active' : ''}
        >
          Chapters <span className="count">{data.modules?.length}</span>
        </button>
        {/* <button
          onClick={() => setActiveTab('videos')}
          className={activeTab === 'videos' ? 'active' : ''}
        >
          Videos <span className="count">--</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={activeTab === 'notes' ? 'active' : ''}
        >
          Notes <span className="count">--</span>
        </button> */}
        {/* <button
          onClick={() => setActiveTab('tests')}
          className={activeTab === 'tests' ? 'active' : ''}
        >
          Tests <span className="count">2</span>
        </button> */}
      </div>
      <div className="content">{renderContent()}</div>
    </div>
  )
}

export default Lesson
