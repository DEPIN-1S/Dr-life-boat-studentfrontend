// import React, { useEffect, useState } from 'react'
// import './enrolledCourseDetails.css'
// import Overview from '../Overview/Overview'
// import Lessons from '../Lessons/Lessons'
// import Studyplan from '../StudyPlan/Studyplan'
// import axios from 'axios'
// import { toast } from 'react-toastify'
// import { useParams } from 'react-router-dom'
// import VideoPlayer from '../VideoPlayer'

// const CourseCard = () => {
//   const params = useParams()

//   const [activeTab, setActiveTab] = useState('overview')
//   const [selectedFile, setSelectedFile] = useState(null)
//   const [courseDetails, setCourseDetils] = useState([])

//   useEffect(() => {
//     CourseData()
//   }, [])

//   const CourseData = () => {
//     let Bearer = sessionStorage.getItem('token')

//     axios({
//       url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/course/data',
//       headers: {
//         Accept: 'application/json',
//         Authorization: `Bearer ${Bearer}`,
//       },
//       method: 'POST',
//       data: {
//         course_id: JSON.parse(params.id),
//       },
//     })
//       .then((response) => {
//         if (response.data.result) {
//           setCourseDetils(response.data.data[0])
//         } else {
//           toast.info(response.data.message)
//         }
//       })
//       .catch((err) => {
//         console.log(err, 'error inside couseData')
//       })
//   }

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return <Overview data={courseDetails} />
//       case 'lessons':
//         return <Lessons data={courseDetails} onFileSelect={setSelectedFile} />
//       case 'studyPlan':
//         return <Studyplan />
//       default:
//         return null
//     }
//   }
//   const hashtag = React.useMemo(() => {
//     try {
//       return courseDetails?.hashtags ? JSON.parse(courseDetails.hashtags) : []
//     } catch (e) {
//       console.error('Error parsing hashtags:', e)
//       return []
//     }
//   }, [courseDetails])
//   return (
//     <div className="course-card">
//       <div>
//         {selectedFile ? (
//           <div className="course-description-media">
//             {selectedFile.type.includes('mp4', 'mov', 'avi', 'mkv') ? (
//               // <video
//               //   className="course-description-image"
//               //   controls
//               //   autoPlay
//               //   src={selectedFile.url}
//               //   onContextMenu={(e) => e.preventDefault()}
//               //   controlsList="nodownload noplaybackrate"
//               //   disablePictureInPicture
//               //   style={{ width: '100%', height: 'auto' }}
//               // />
//               <VideoPlayer videoSources={selectedFile.url} />
//             ) : selectedFile.type === 'pdf' ? (
//               <iframe
//                 src={`${selectedFile.url}#toolbar=0&navpanes=0&scrollbar=0`}
//                 title="PDF Viewer"
//                 style={{
//                   width: '100%',
//                   height: '600px',
//                   border: 'none',
//                 }}
//                 sandbox="allow-same-origin allow-scripts"
//                 allow="fullscreen"
//               ></iframe>
//             ) : selectedFile.type === 'ppt' || selectedFile.type === 'pptx' ? (
//               <iframe
//                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
//                   selectedFile.url,
//                 )}`}
//                 title="PPT Viewer"
//                 style={{ width: '100%', height: '600px', border: 'none' }}
//                 sandbox="allow-same-origin allow-scripts"
//               />
//             ) : selectedFile.url.includes('google') ? (
//               <div style={{ width: '100%', height: '580px', position: 'relative' }}>
//                 {/* Video/PDF/PPT iframe */}
//                 <iframe
//                   src={selectedFile.url}
//                   width="100%"
//                   height="580"
//                   allow="autoplay"
//                   title="Drive Content"
//                   allowFullScreen={true}
//                   style={{ border: 'none' }}
//                   sandbox="allow-same-origin allow-scripts"
//                 ></iframe>

//                 {/* Company Logo in Top-Left */}
//                 <div
//                   style={{
//                     position: 'absolute',
//                     top: '10px',
//                     right: '10px',
//                     zIndex: 10,
//                   }}
//                 >
//                   <img
//                     src="/logo1.png"
//                     alt="Company Logo"
//                     style={{ height: '50px', width: 'auto', opacity: 0.9 }}
//                   />
//                 </div>
//               </div>
//             ) : (
//               <p>Unsupported file type</p>
//             )}
//           </div>
//         ) : (
//           <img
//             className="course-description-image"
//             src={`${import.meta.env.VITE_BASE_URL}/${courseDetails?.image}`}
//             alt="Course"
//           />
//         )}
//       </div>

//       <div className="badge-container">
//         <span className="badge premium">PREMIUM</span>
//         <span className="badge recorded">RECORDED</span>
//       </div>

//       <h3 className="course-title">{courseDetails?.heading}</h3>

//       <div className="tags">
//         {hashtag?.map((feature, index) => (
//           <span key={index}>{feature}</span>
//         ))}
//       </div>

//       <div className="rating-section">
//         <span className="rating">0.0</span>
//         <span className="stars">★★★★★</span>
//         <span className="details">(0 ratings)</span>
//         <span className="students">(14 Students)</span>
//       </div>

//       <div className="price-section">
//         <span className="price">
//           ₹{courseDetails?.fee}
//           <span className="original-price">₹5000</span>
//         </span>

//         <button className="buy-btn">Enrolled</button>
//       </div>

//       <div className="tabs">
//         <button
//           className={activeTab === 'overview' ? 'active-tab' : ''}
//           onClick={() => setActiveTab('overview')}
//         >
//           Overview
//         </button>
//         <button
//           className={activeTab === 'lessons' ? 'active-tab' : ''}
//           onClick={() => setActiveTab('lessons')}
//         >
//           Lessons
//         </button>
//         <button
//           className={activeTab === 'studyPlan' ? 'active-tab' : ''}
//           onClick={() => setActiveTab('studyPlan')}
//         >
//           Study Plan
//         </button>
//       </div>

//       <div className="course-description">{renderTabContent()}</div>
//     </div>
//   )
// }

// export default CourseCard



import React, { useEffect, useState } from 'react'
import './enrolledCourseDetails.css'
import Overview from '../Overview/Overview'
import Lessons from '../Lessons/Lessons'
import Studyplan from '../StudyPlan/Studyplan'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import VideoPlayer from '../VideoPlayer'

const CourseCard = () => {
  const params = useParams()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedFile, setSelectedFile] = useState(null)
  const [courseDetails, setCourseDetils] = useState([])

  useEffect(() => {
    CourseData()
  }, [])

  const CourseData = () => {
    let Bearer = sessionStorage.getItem('token')

    axios({
      url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/course/data',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${Bearer}`,
      },
      method: 'POST',
      data: {
        course_id: JSON.parse(params.id),
      },
    })
      .then((response) => {
        if (response.data.result) {
          setCourseDetils(response.data.data[0])
        } else {
          toast.info(response.data.message)
        }
      })
      .catch((err) => {
        console.log(err, 'error inside couseData')
      })
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview data={courseDetails} />
      case 'lessons':
        return <Lessons data={courseDetails} onFileSelect={setSelectedFile} />
      case 'studyPlan':
        return <Studyplan />
      default:
        return null
    }
  }
  const hashtag = React.useMemo(() => {
    try {
      return courseDetails?.hashtags ? JSON.parse(courseDetails.hashtags) : []
    } catch (e) {
      console.error('Error parsing hashtags:', e)
      return []
    }
  }, [courseDetails])
  return (
    <div className="course-card">
      <div className="course-banner">
        {selectedFile ? (
          <div className="course-description-media">
            {selectedFile.type.includes('mp4', 'mov', 'avi', 'mkv') ? (
              <VideoPlayer videoSources={selectedFile.url} />
            ) : selectedFile.type === 'pdf' ? (
              <iframe
                src={`${selectedFile.url}#toolbar=0&navpanes=0&scrollbar=0`}
                title="PDF Viewer"
                style={{
                  width: '100%',
                  height: '600px',
                  border: 'none',
                }}
                sandbox="allow-same-origin allow-scripts"
                allow="fullscreen"
              ></iframe>
            ) : selectedFile.type === 'ppt' || selectedFile.type === 'pptx' ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                  selectedFile.url,
                )}`}
                title="PPT Viewer"
                style={{ width: '100%', height: '600px', border: 'none' }}
                sandbox="allow-same-origin allow-scripts"
              />
            ) : selectedFile.url.includes('google') ? (
              <div style={{ width: '100%', height: '580px', position: 'relative' }}>
                <iframe
                  src={selectedFile.url}
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
                  {/* <img
                    src="/logo1.png"
                    alt="Company Logo"
                    style={{ height: '50px', width: 'auto', opacity: 0.9 }}
                  /> */}
                </div>
              </div>
            ) : (
              <p>Unsupported file type</p>
            )}
          </div>
        ) : (
          <img
            className="course-description-image"
            src={`${import.meta.env.VITE_BASE_URL}/${courseDetails?.image}`}
            alt="Course"
          />
        )}
        <div className="banner-overlay">
          <div className="badge-container">
            <span className="badge premium">PREMIUM</span>
            <span className="badge recorded">RECORDED</span>
            <span className="badge chapters">{courseDetails?.chapters || 7} CHAPTERS</span>
          </div>
        </div>
      </div>

      <div className="course-details">
        <div className="tags">
          {hashtag?.map((feature, index) => (
            <span key={index}>{feature}</span>
          ))}
        </div>
          <h3 className="course-title-overlay">{courseDetails?.heading}</h3>



        <div className="price-section">
          <span className="price">
            ₹{courseDetails?.fee }
          </span>
          {/* <button className="buy-btn">Enrolled</button> */}
          <button
            className={activeTab === 'overview' ? 'active-tab' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'lessons' ? 'active-tab' : ''}
            onClick={() => setActiveTab('lessons')}
          >
            Lessons
          </button>
          <button
            className={activeTab === 'studyPlan' ? 'active-tab' : ''}
            onClick={() => setActiveTab('studyPlan')}
          >
            Study Plan
          </button>
        </div>

        <div className="course-description">{renderTabContent()}</div>
      </div>
    </div>
  )
}

export default CourseCard
