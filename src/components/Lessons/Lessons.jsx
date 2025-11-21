




// import React, { useState } from 'react'
// import { useLocation } from 'react-router-dom'        // ← NEW: to get data from navigation
// import {
//   FaPlay,
//   FaFilePdf,
//   FaRegEdit,
//   FaChevronDown,
//   FaChevronUp,
//   FaLock,
//   FaFilePowerpoint,
// } from 'react-icons/fa'
// import './lessons.css'
// import { useNavigate } from 'react-router-dom'

// const Lesson = () => {
//   const navigate = useNavigate()
//   const { state } = useLocation()                    // ← Get data sent from CourseCard
//   const data = state?.courseDetails || {}            // ← This is your real course data

//   const [activeTab, setActiveTab] = useState('chapters')
//   const [openModules, setOpenModules] = useState([])
//   const [openTopics, setOpenTopics] = useState([])
//   const [openSubtopics, setOpenSubtopics] = useState([])

//   // If no data (user opens link directly), show message
//   if (!data || !data.modules) {
//     return (
//       <div style={{ padding: '100px 20px', textAlign: 'center', fontSize: '20px' }}>
//         <h2>No course data found</h2>
//         <p>Please go back and click the "Lessons" button again.</p>
//       </div>
//     )
//   }

//   const collectAllFilesFromModules = (modules = []) => {
//     const allFiles = []
//     modules.forEach((module) => {
//       if (module.files?.length) {
//         module.files.forEach((file) =>
//           allFiles.push({ ...file, parent: `Module: ${module.name}` })
//         )
//       }
//       module.topics?.forEach((topic) => {
//         if (topic.files?.length) {
//           topic.files.forEach((file) =>
//             allFiles.push({ ...file, parent: `Topic: ${topic.name}` })
//           )
//         }
//         topic.subtopics?.forEach((sub) => {
//           if (sub.files?.length) {
//             sub.files.forEach((file) =>
//               allFiles.push({ ...file, parent: `Subtopic: ${sub.name}` })
//             )
//           }
//         })
//       })
//     })
//     return allFiles
//   }

//   const toggleModule = (index) => {
//     setOpenModules((prev) =>
//       prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
//     )
//   }

//   const toggleTopic = (moduleIndex, topicIndex) => {
//     const key = `${moduleIndex}-${topicIndex}`
//     setOpenTopics((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     )
//   }

//   const toggleSubtopic = (moduleIndex, topicIndex, subIndex) => {
//     const key = `${moduleIndex}-${topicIndex}-${subIndex}`
//     setOpenSubtopics((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     )
//   }

//   const getFileExtension = (fileUrl) => {
//     if (!fileUrl) return ''
//     return fileUrl.split('.').pop().toLowerCase()
//   }

//   const renderFiles = (files) => {
//     if (!files || files.length === 0) return null

//     return files.map((file, i) => {
//       const fileUrl = file?.file || file.file_link
//       const fileName = file.name || fileUrl || 'No File'
//       const fileExtension = getFileExtension(fileUrl)
//       const fileType = file.type || fileExtension
//       const isClickable = file.isPurchased !== false // assume true if not set

//       const handleClick = () => {
//         if (!isClickable) return

//         const allFiles = collectAllFilesFromModules(data.modules).map((f) => ({
//           name: f.name || 'No Name',
//           type: f.type || getFileExtension(f.file_link || f.file),
//           url: f.file_link
//             ? f.file_link.replace(/\/view(\?.*)?$/, '/preview')
//             : `${import.meta.env.VITE_BASE_URL}${f.file}`,
//           duration: f.duration || '',
//           parent: f.parent,
//         }))

//         const formattedFile = {
//           url: file.file_link
//             ? fileUrl.replace(/\/view(\?.*)?$/, '/preview')
//             : `${import.meta.env.VITE_BASE_URL}${fileUrl}`,
//           name: fileName,
//           type: fileType,
//           duration: file.duration || null,
//           allFiles,
//         }

//         navigate('/lesson-player', { state: formattedFile })
//       }

//       const getIcon = () => {
//         if (!isClickable) return <FaLock />
//         switch (fileType) {
//           case 'video':
//           case 'mp4':
//           case 'mov':
//           case 'avi':
//           case 'mkv':
//             return <FaPlay />
//           case 'pdf':
//             return <FaFilePdf />
//           case 'ppt':
//           case 'pptx':
//             return <FaFilePowerpoint />
//           default:
//             return <FaFilePdf />
//         }
//       }

//       return (
//         <div
//           key={i}
//           className="lesson-subtopic"
//           onClick={handleClick}
//           style={{
//             cursor: isClickable ? 'pointer' : 'not-allowed',
//             opacity: fileUrl ? 1 : 0.5,
//           }}
//         >
//           <div>
//             <p>{file.name || 'Untitled File'}</p>
//             <div style={{ display: 'flex', gap: '20px' }}>
//               <p>{fileType.toUpperCase()}</p>
//               <p>{file.duration || 'N/A'}</p>
//             </div>
//           </div>
//           {getIcon()}
//         </div>
//       )
//     })
//   }

//   const renderContent = () => {
//     if (activeTab === 'chapters') {
//       return (
//         <div className="lesson-container">
//           <h4>{data.heading}</h4>
//           {data.modules.map((module, moduleIndex) => (
//             <div key={module.id} className="lesson-chapter">
//               <div className="lesson-header" onClick={() => toggleModule(moduleIndex)}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                   {module.image ? (
//                     <img
//                       src={`${import.meta.env.VITE_BASE_URL}/${module.image}`}
//                       alt={module.name}
//                       onError={(e) => {
//                         e.currentTarget.src = '/logo.png'
//                       }}
//                       style={{ height: '30px', width: '30px', borderRadius: '4px' }}
//                     />
//                   ) : (
//                     <div style={{ width: '30px', height: '30px' }} />
//                   )}
//                   <span>{module.name}</span>
//                 </div>
//                 {openModules.includes(moduleIndex) ? <FaChevronUp /> : <FaChevronDown />}
//               </div>

//               {openModules.includes(moduleIndex) && (
//                 <>
//                   <div className="lesson-subtopic-files">{renderFiles(module.files)}</div>

//                   {module.topics?.map((topic, topicIndex) => {
//                     const topicKey = `${moduleIndex}-${topicIndex}`
//                     return (
//                       <div key={topic.id} className="lesson-topic">
//                         <div
//                           className="lesson-subheader"
//                           onClick={() => toggleTopic(moduleIndex, topicIndex)}
//                         >
//                           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                             {topic.image ? (
//                               <img
//                                 src={`${import.meta.env.VITE_BASE_URL}/${topic.image}`}
//                                 alt={topic.name}
//                                 onError={(e) => {
//                                   e.currentTarget.src = '/logo.png'
//                                 }}
//                                 style={{ height: '30px', width: '30px' }}
//                               />
//                             ) : (
//                               <div style={{ width: '30px', height: '30px' }} />
//                             )}
//                             {topic.name}
//                           </div>
//                           {openTopics.includes(topicKey) ? <FaChevronUp /> : <FaChevronDown />}
//                         </div>

//                         {openTopics.includes(topicKey) && (
//                           <>
//                             <div className="lesson-subtopic-files">{renderFiles(topic.files)}</div>

//                             {topic.subtopics?.map((sub, subIndex) => {
//                               const subKey = `${moduleIndex}-${topicIndex}-${subIndex}`
//                               return (
//                                 <div key={sub.id} className="lesson-subtopic">
//                                   <div
//                                     className="lesson-subheader"
//                                     onClick={() => toggleSubtopic(moduleIndex, topicIndex, subIndex)}
//                                   >
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                       {sub.image ? (
//                                         <img
//                                           src={`${import.meta.env.VITE_BASE_URL}/${sub.image}`}
//                                           alt={sub.name}
//                                           onError={(e) => (e.currentTarget.src = '/logo.png')}
//                                           style={{ height: '30px', width: '30px' }}
//                                         />
//                                       ) : (
//                                         <div style={{ width: '30px', height: '30px' }} />
//                                       )}
//                                       {sub.name}
//                                     </div>
//                                     {openSubtopics.includes(subKey) ? <FaChevronUp /> : <FaChevronDown />}
//                                   </div>

//                                   {openSubtopics.includes(subKey) && (
//                                     <div className="lesson-subtopic-files">
//                                       {renderFiles(sub.files)}
//                                     </div>
//                                   )}
//                                 </div>
//                               )
//                             })}
//                           </>
//                         )}
//                       </div>
//                     )
//                   })}
//                 </>
//               )}
//             </div>
//           ))}
//         </div>
//       )
//     }

//     return null
//   }

//   return (
//     <div className="lesson-container">
//       <div className="tabs">
//         <button
//           onClick={() => setActiveTab('chapters')}
//           className={activeTab === 'chapters' ? 'active' : ''}
//         >
//           Chapters <span className="count">{data.modules?.length || 0}</span>
//         </button>
//       </div>
//       <div className="content">{renderContent()}</div>
//     </div>
//   )
// }

// export default Lesson

import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FaPlay,
  FaFilePdf,
  FaFilePowerpoint,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa'
import './lessons.css'

const Lesson = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const course = state?.courseDetails || {}

  const [openModules, setOpenModules] = useState([])
  const [openTopics, setOpenTopics] = useState([])
  const [openSubtopics, setOpenSubtopics] = useState([])

  if (!course || !course.modules) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>No course data found</h2>
        <p>Please select a course properly.</p>
      </div>
    )
  }

  const BASE_URL = import.meta.env.VITE_BASE_URL || ''

  const toggleModule = (index) => {
    setOpenModules(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const toggleTopic = (mIndex, tIndex) => {
    const key = `${mIndex}-${tIndex}`
    setOpenTopics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const toggleSubtopic = (mIndex, tIndex, sIndex) => {
    const key = `${mIndex}-${tIndex}-${sIndex}`
    setOpenSubtopics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
      case 'mp4':
      case 'mov':
        return <FaPlay />
      case 'pdf':
        return <FaFilePdf />
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint />
      default:
        return <FaFilePdf />
    }
  }

  const renderFiles = (files) => {
    if (!files || files.length === 0) return null

    return files.map((file, i) => {
      // Build proper preview URL (Google Drive / normal file)
      const url = file.file_link
        ? file.file_link.replace(/\/view.*$/, '/preview')
        : `${BASE_URL}${file.file}`

      const name = file.name || 'Untitled File'
      const type = file.type || url.split('.').pop()

      const handleClick = () => {
        if (!url) return

        // Collect all files in the course for the player playlist
        const allFiles = collectAllFiles()

        const currentFileData = {
          url,
          name,
          type,
          duration: file.duration || null,
          allFiles,
        }

        navigate('/lesson-player', { state: currentFileData })
      }

      const collectAllFiles = () => {
        const all = []
        course.modules.forEach(m => {
          m.files?.forEach(f => all.push({ ...f, parent: m.name, url: f.file_link || `${BASE_URL}${f.file}` }))
          m.topics?.forEach(t => {
            t.files?.forEach(f => all.push({ ...f, parent: t.name, url: f.file_link || `${BASE_URL}${f.file}` }))
            t.subtopics?.forEach(s => {
              s.files?.forEach(f => all.push({ ...f, parent: s.name, url: f.file_link || `${BASE_URL}${f.file}` }))
            })
          })
        })
        return all.map(f => ({
          name: f.name || 'File',
          type: f.type || f.url.split('.').pop(),
          url: f.url.replace(/\/view.*$/, '/preview'),
          duration: f.duration || '',
          parent: f.parent,
        }))
      }

      return (
        <div
          key={i}
          className="lesson-file-row"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          <div>
            <p>{name}</p>
            {file.duration && <small>{file.duration}</small>}
          </div>
          <div className="file-icon">
            {getFileIcon(type)}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="lessons-container">
      <h2 className="lessons-heading">{course.heading || 'Course Lessons'}</h2>

      {course.modules?.map((module, mIndex) => (
        <div key={module.id || mIndex} className="lesson-module">
          {/* Module Header */}
          <div
            className="lesson-card"
            onClick={() => toggleModule(mIndex)}
            style={{ cursor: 'pointer' }}
          >
            <div className="lesson-left">
              <img
               src={`${BASE_URL}/${module.image}`}
                alt={module.name}
                className="lesson-image"

              />
              <div>
                <h4>{module.name}</h4>
              </div>
            </div>
            <div className="lesson-toggle">
              {openModules.includes(mIndex) ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>

          {/* Expanded Module Content */}
          {openModules.includes(mIndex) && (
            <div className="lesson-expand">
              {renderFiles(module.files)}

              {/* Topics */}
              {module.topics?.map((topic, tIndex) => {
                const topicKey = `${mIndex}-${tIndex}`
                return (
                  <div key={topic.id || tIndex} className="lesson-topic">
                    <div
                      className="lesson-card"
                      onClick={() => toggleTopic(mIndex, tIndex)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="lesson-left-topic">
                        <img
                          src={`${BASE_URL}${topic.image}`}
                          alt={topic.name}
                          className="lesson-image"
                        
                        />
                        <div>
                          <h4>{topic.name}</h4>
                        </div>
                      </div>
                      <div className="lesson-toggle">
                        {openTopics.includes(topicKey) ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>

                    {/* Expanded Topic Content */}
                    {openTopics.includes(topicKey) && (
                      <div className="lesson-expand">
                        {renderFiles(topic.files)}

                        {/* Subtopics */}
                        {topic.subtopics?.map((sub, sIndex) => {
                          const subKey = `${mIndex}-${tIndex}-${sIndex}`
                          return (
                            <div key={sub.id || sIndex} className="lesson-subtopic">
                              <div
                                className="lesson-card"
                                onClick={() => toggleSubtopic(mIndex, tIndex, sIndex)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="lesson-left-topic">
                                  <img
                                    src={`${BASE_URL}${sub.image}`}
                                    alt={sub.name}
                                    className="lesson-image"

                                  />
                                  <div>
                                    <h4>{sub.name}</h4>
                                  </div>
                                </div>
                                <div className="lesson-toggle">
                                  {openSubtopics.includes(subKey) ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                              </div>

                              {/* Expanded Subtopic Content */}
                              {openSubtopics.includes(subKey) && (
                                <div className="lesson-expand">
                                  {renderFiles(sub.files)}
                                </div>
                              )}
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
  )
}

export default Lesson
