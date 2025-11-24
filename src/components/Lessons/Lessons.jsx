




// import React, { useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import {
//   FaPlay,
//   FaFilePdf,
//   FaFilePowerpoint,
//   FaChevronDown,
//   FaChevronUp,
// } from 'react-icons/fa'
// import './lessons.css'

// const Lesson = () => {
//   const navigate = useNavigate()
//   const { state } = useLocation()
//   const course = state?.courseDetails || {}

//   const [openModules, setOpenModules] = useState([])
//   const [openTopics, setOpenTopics] = useState([])
//   const [openSubtopics, setOpenSubtopics] = useState([])

//   if (!course || !course.modules) {
//     return (
//       <div style={{ padding: '100px 20px', textAlign: 'center' }}>
//         <h2>No course data found</h2>
//         <p>Please select a course properly.</p>
//       </div>
//     )
//   }

//   const BASE_URL = import.meta.env.VITE_BASE_URL || ''

//   const toggleModule = (index) => {
//     setOpenModules(prev =>
//       prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
//     )
//   }

//   const toggleTopic = (mIndex, tIndex) => {
//     const key = `${mIndex}-${tIndex}`
//     setOpenTopics(prev =>
//       prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
//     )
//   }

//   const toggleSubtopic = (mIndex, tIndex, sIndex) => {
//     const key = `${mIndex}-${tIndex}-${sIndex}`
//     setOpenSubtopics(prev =>
//       prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
//     )
//   }

//   const getFileIcon = (type) => {
//     switch (type?.toLowerCase()) {
//       case 'video':
//       case 'mp4':
//       case 'mov':
//         return <FaPlay />
//       case 'pdf':
//         return <FaFilePdf />
//       case 'ppt':
//       case 'pptx':
//         return <FaFilePowerpoint />
//       default:
//         return <FaFilePdf />
//     }
//   }

//   const renderFiles = (files) => {
//     if (!files || files.length === 0) return null

//     return files.map((file, i) => {
//       // Build proper preview URL (Google Drive / normal file)
//       const url = file.file_link
//         ? file.file_link.replace(/\/view.*$/, '/preview')
//         : `${BASE_URL}${file.file}`

//       const name = file.name || 'Untitled File'
//       const type = file.type || url.split('.').pop()

//       const handleClick = () => {
//         if (!url) return

//         // Collect all files in the course for the player playlist
//         const allFiles = collectAllFiles()

//         const currentFileData = {
//           url,
//           name,
//           type,
//           duration: file.duration || null,
//           allFiles,
//         }

//         navigate('/lesson-player', { state: currentFileData })
//       }

//       const collectAllFiles = () => {
//         const all = []
//         course.modules.forEach(m => {
//           m.files?.forEach(f => all.push({ ...f, parent: m.name, url: f.file_link || `${BASE_URL}${f.file}` }))
//           m.topics?.forEach(t => {
//             t.files?.forEach(f => all.push({ ...f, parent: t.name, url: f.file_link || `${BASE_URL}${f.file}` }))
//             t.subtopics?.forEach(s => {
//               s.files?.forEach(f => all.push({ ...f, parent: s.name, url: f.file_link || `${BASE_URL}${f.file}` }))
//             })
//           })
//         })
//         return all.map(f => ({
//           name: f.name || 'File',
//           type: f.type || f.url.split('.').pop(),
//           url: f.url.replace(/\/view.*$/, '/preview'),
//           duration: f.duration || '',
//           parent: f.parent,
//         }))
//       }

//       return (
//         <div
//           key={i}
//           className="lesson-file-row"
//           onClick={handleClick}
//           style={{ cursor: 'pointer' }}
//         >
//           <div>
//             <p>{name}</p>
//             {file.duration && <small>{file.duration}</small>}
//           </div>
//           <div className="file-icon">
//             {getFileIcon(type)}
//           </div>
//         </div>
//       )
//     })
//   }

//   return (
//     <div className="lessons-container">
//       <h2 className="lessons-heading">{course.heading || 'Course Lessons'}</h2>

//       {course.modules?.map((module, mIndex) => (
//         <div key={module.id || mIndex} className="lesson-module">


//           <div
//             className="lesson-card"
//             onClick={() => toggleModule(mIndex)}
//             style={{ cursor: 'pointer' }}
//           >
//             <div className="lesson-left">
//               <img
//                src={`${BASE_URL}/${module.image}`}
//                 alt={module.name}
//                 className="lesson-image"

//               />

//               <div>
//                 <h4>{module.name}</h4>
//               </div>
//             </div>
//             <div className="lesson-toggle">
//               {openModules.includes(mIndex) ? <FaChevronUp /> : <FaChevronDown />}
//             </div>
//           </div>

//           {openModules.includes(mIndex) && (
//             <div className="lesson-expand">
//               {renderFiles(module.files)}


//               {module.topics?.map((topic, tIndex) => {
//                 const topicKey = `${mIndex}-${tIndex}`
//                 console.log(module.topics, topicKey,"bhfe jgcrigirgjrhb");

//                 return (
//                   <div key={topic.id || tIndex} className="lesson-topic">
//                     <div
//                       className="lesson-card"
//                       onClick={() => toggleTopic(mIndex, tIndex)}
//                       style={{ cursor: 'pointer' }}
//                     >
//                       <div className="lesson-left-topic">
//                         <img
//                           src={`${BASE_URL}${topic?.image}`}
//                           alt={topic.name}
//                           className="lesson-image"

//                         />
//                         <div>
//                           <h4>{topic.name}</h4>
//                         </div>
//                       </div>
//                       <div className="lesson-toggle">
//                         {openTopics.includes(topicKey) ? <FaChevronUp /> : <FaChevronDown />}
//                       </div>
//                     </div>

//                     {openTopics.includes(topicKey) && (
//                       <div className="lesson-expand">
//                         {renderFiles(topic.files)}


//                         {topic.subtopics?.map((sub, sIndex) => {
//                           const subKey = `${mIndex}-${tIndex}-${sIndex}`
//                           return (
//                             <div key={sub.id || sIndex} className="lesson-subtopic">
//                               <div
//                                 className="lesson-card"
//                                 onClick={() => toggleSubtopic(mIndex, tIndex, sIndex)}
//                                 style={{ cursor: 'pointer' }}
//                               >
//                                 <div className="lesson-left-topic">
//                                   <img
//                                     src={`${BASE_URL}${sub?.image}`}
//                                     alt={sub.name}
//                                     className="lesson-image"

//                                   />
//                                   <div>
//                                     <h4>{sub.name}</h4>
//                                   </div>
//                                 </div>
//                                 <div className="lesson-toggle">
//                                   {openSubtopics.includes(subKey) ? <FaChevronUp /> : <FaChevronDown />}
//                                 </div>
//                               </div>


//                               {openSubtopics.includes(subKey) && (
//                                 <div className="lesson-expand">
//                                   {renderFiles(sub.files)}
//                                 </div>
//                               )}
//                             </div>
//                           )
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   )
// }
// export default Lesson




import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaPlay, FaFilePdf, FaFilePowerpoint, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import './lessons.css'

const Lesson = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const course = state?.courseDetails || {}
  const [openModules, setOpenModules] = useState([])
  const [openTopics, setOpenTopics] = useState([])
  const [openSubtopics, setOpenSubtopics] = useState([])
  const BASE_URL = import.meta.env.VITE_BASE_URL 

  if (!course || !course.modules) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>No course found</div>
  }

  const toggleModule = (i) => setOpenModules(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  const toggleTopic = (m, t) => setOpenTopics(prev => prev.includes(`${m}-${t}`) ? prev.filter(x => x !== `${m}-${t}`) : [...prev, `${m}-${t}`])
  const toggleSubtopic = (m, t, s) => setOpenSubtopics(prev => prev.includes(`${m}-${t}-${s}`) ? prev.filter(x => x !== `${m}-${t}-${s}`) : [...prev, `${m}-${t}-${s}`])

  const SafeImage = ({ src, alt }) => {
    if (!src || src === '') {
      return <div className="lesson-image-placeholder">Module</div>
    }
    const url = src.startsWith('http') ? src : src.includes('uploads/') ? `${BASE_URL}/${src}` : `${BASE_URL}/uploads/${src}`
    return <img src={url} alt={alt} className="lesson-image" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
  }

  const getIcon = (type) => {
    if (type?.includes('video') || type?.includes('mp4')) return <FaPlay />
    if (type?.includes('pdf')) return <FaFilePdf />
    if (type?.includes('ppt')) return <FaFilePowerpoint />
    return <FaFilePdf />
  }

  const goToPlayer = (file) => {
    const url = file.file_link ? file.file_link.replace('/view', '/preview') : `${BASE_URL}/${file.file}`
    navigate('/lesson-player', { state: { url, name: file.name || 'File', type: file.type } })
  }

  const renderFiles = (files) => {
    if (!files || files.length === 0) return null
    return files.map((f, i) => (
      <div key={i} className="lesson-file-row" onClick={() => goToPlayer(f)}>
        <div>
          <p>{f.name || 'Untitled File'}</p>
          {f.duration && <small>{f.duration}</small>}
        </div>
        <div className="file-icon">{getIcon(f.type || f.file)}</div>
      </div>
    ))
  }

  return (
    <div className="lessons-container">
      <h2 className="lessons-heading">{course.heading}</h2>

      {course.modules.map((module, mIdx) => (
        <div key={mIdx} className="lesson-module">
          <div className="lesson-card" onClick={() => toggleModule(mIdx)}>
            <div className="lesson-left">
              <SafeImage src={module.image} alt={module.name} />
              <div>
                <h4>{module.name}</h4>
                <small>{module.topics?.length || 0} Topics</small>
              </div>
            </div>
            <div className="lesson-toggle">
              {openModules.includes(mIdx) ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>

          {openModules.includes(mIdx) && (
            <div className="lesson-expand">
              {renderFiles(module.files)}
              {module.topics?.map((topic, tIdx) => {
                const tKey = `${mIdx}-${tIdx}`
                return (
                  <div key={tIdx}>
                    <div className="lesson-card" onClick={() => toggleTopic(mIdx, tIdx)}>
                      <div className="lesson-left-topic">
                        <SafeImage src={topic.image} alt={topic.name} />
                        <h4>{topic.name}</h4>
                      </div>
                      <div className="lesson-toggle">
                        {openTopics.includes(tKey) ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>

                    {openTopics.includes(tKey) && (
                      <div className="lesson-expand">
                        {renderFiles(topic.files)}
                        {topic.subtopics?.map((sub, sIdx) => {
                          const sKey = `${mIdx}-${tIdx}-${sIdx}`
                          return (
                            <div key={sIdx}>
                              <div className="lesson-card" onClick={() => toggleSubtopic(mIdx, tIdx, sIdx)}>
                                <div className="lesson-left-topic">
                                  <SafeImage src={sub.image} alt={sub.name} />
                                  <h4>{sub.name}</h4>
                                </div>
                                <div className="lesson-toggle">
                                  {openSubtopics.includes(sKey) ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                              </div>
                              {openSubtopics.includes(sKey) && <div className="lesson-expand">{renderFiles(sub.files)}</div>}
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
