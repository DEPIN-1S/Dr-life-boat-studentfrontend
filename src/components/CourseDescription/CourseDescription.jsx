import React, { useEffect, useState, useCallback } from 'react'
import './CourseDescription.css'
import Overview from '../Overview/Overview'
import Lessons from '../Lessons/Lessons'
import Studyplan from '../StudyPlan/Studyplan'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import VideoPlayer from '../VideoPlayer'

import { API_BASE_URL } from '../../utils/apiConfig'

const CourseCard = () => {
  const params = useParams()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedFile, setSelectedFile] = useState(null)
  const [courseDetails, setCourseDetils] = useState([])
  const [secureUrl, setSecureUrl] = useState(null)
  const [urlLoading, setUrlLoading] = useState(false)

  useEffect(() => {
    CourseData()
  }, [])

  const CourseData = () => {
    let Bearer = sessionStorage.getItem('token')

    axios({
      url: API_BASE_URL + '/drlifeboat/student/course/data',
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

  // Fetch pre-signed URL for S3 files
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
      }
    } catch (err) {
      console.error('Error fetching secure URL:', err)
    } finally {
      setUrlLoading(false)
    }
  }, [])

  // Fetch secure URL when selectedFile changes
  useEffect(() => {
    setSecureUrl(null)
    if (selectedFile?.s3_key) {
      fetchSecureUrl(selectedFile.s3_key)
    }
  }, [selectedFile, fetchSecureUrl])

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

  // Resolve the file URL (pre-signed or Google Drive)
  const getResolvedUrl = () => {
    if (!selectedFile) return null
    if (selectedFile.s3_key) return secureUrl
    return selectedFile.file_link || selectedFile.url || null
  }

  const resolvedUrl = getResolvedUrl()

  return (
    <div className="course-description-container">
      <div className="course-card">
        <div className="media-container">
          {selectedFile ? (
            <div className="course-description-media" onContextMenu={(e) => e.preventDefault()}>
              {urlLoading ? (
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : resolvedUrl ? (
                <>
                  {['mp4', 'mov', 'avi', 'mkv', 'video'].some(ext => selectedFile.type?.includes(ext)) ? (
                    <VideoPlayer src={resolvedUrl} />
                  ) : selectedFile.type === 'pdf' || selectedFile.type === 'document' ? (
                    <iframe
                      src={`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                      title="PDF Viewer"
                      className="responsive-iframe"
                      sandbox="allow-same-origin allow-scripts"
                      allow="fullscreen"
                    ></iframe>
                  ) : selectedFile.type === 'ppt' || selectedFile.type === 'pptx' ? (
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resolvedUrl)}`}
                      title="PPT Viewer"
                      className="responsive-iframe"
                      sandbox="allow-same-origin allow-scripts"
                    />
                  ) : selectedFile.file_link?.includes('google') ? (
                    <div className="google-drive-container">
                      <iframe
                        src={resolvedUrl}
                        allow="autoplay"
                        title="Drive Content"
                        allowFullScreen={true}
                        className="responsive-iframe"
                        sandbox="allow-same-origin allow-scripts"
                      ></iframe>
                      <div className="watermark-logo">
                        <img src="/logo1.png" alt="Company Logo" className="logo-image" />
                      </div>
                    </div>
                  ) : (
                    <p className="unsupported-file">Unsupported file type</p>
                  )}
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                  <p className="text-muted">Content not available</p>
                </div>
              )}
            </div>
          ) : (
            <img
              className="course-description-image"
              src={`${API_BASE_URL}/${courseDetails?.image}`}
              alt="Course"
            />
          )}
        </div>

        <div className="course-content">
          <div className="badge-container">
            <span className="badge premium">PREMIUM</span>
            <span className="badge recorded">RECORDED</span>
          </div>

          <h3 className="course-title">{courseDetails?.heading}</h3>

          <div className="tags">
            {hashtag?.map((feature, index) => (
              <span key={index} className="tag">{feature}</span>
            ))}
          </div>

          <div className="rating-section">
            <span className="rating">0.0</span>
            <span className="stars">★★★★★</span>
            <span className="details">(0 ratings)</span>
            <span className="students">(14 Students)</span>
          </div>

          <div className="price-section">
            <div className="price-info">
              <span className="price">
                ₹{courseDetails?.fee}
                <span className="original-price">₹5000</span>
              </span>
            </div>
            <button className="buy-btn">Buy Now</button>
          </div>

          <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'lessons' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              Modules
            </button>
            <button
              className={`tab-button ${activeTab === 'studyPlan' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('studyPlan')}
            >
              Study Plan
            </button>
          </div>

          <div className="course-description">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
