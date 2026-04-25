


import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './enrolledCourseDetails.css'
import Overview from '../Overview/Overview'
import Studyplan from '../StudyPlan/Studyplan'
import axios from 'axios'
import { toast } from 'react-toastify'

import { API_BASE_URL } from '../../utils/apiConfig'
import { getImageUrl } from '../../utils/imageUrl'

const CourseCard = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [courseDetails, setCourseDetails] = useState(null)

  useEffect(() => {
    fetchCourseData()
  }, [])

  const fetchCourseData = async () => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      toast.error('Please login again')
      return
    }

    try {
      const response = await axios({
        url: API_BASE_URL + '/drlifeboat/student/course/data',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: {
          course_id: Number(id), // safer than JSON.parse
        },
      })
      console.log("response : ", response)
      if (response?.data?.result) {
        setCourseDetails(response?.data?.data[0])
      } else {
        toast.info(response?.data?.message || 'Course not found')
      }
    } catch (err) {
      console.error('Error fetching course:', err)
      toast.error('Failed to load course')
    }
  }

  const hashtags = React.useMemo(() => {
    if (!courseDetails?.hashtags) return []
    try {
      return JSON.parse(courseDetails.hashtags)
    } catch {
      return []
    }
  }, [courseDetails])


  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview data={courseDetails} />
      case 'studyPlan':
        return <Studyplan />
      default:
        return null
    }
  }

  if (!courseDetails) {
    return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Loading course...</div>
  }

  return (
    <div className="course-card">
      <div className="course-banner">
        <img
          className="course-description-image"
          src={getImageUrl(courseDetails?.image)}
          alt={courseDetails.heading}
        // onError={(e) => { e.target.src = '/default-course.jpg' }}
        />
        <div className="banner-overlay">
          <div className="badge-container">
            <span className="badge premium">PREMIUM</span>
            <span className="badge recorded">RECORDED</span>
            <span className="badge chapters">
              {courseDetails.chapters || courseDetails.modules?.length || 0} CHAPTERS
            </span>
          </div>
        </div>
      </div>

      <div className="course-details">
        <div className="tags">
          {hashtags.map((tag, i) => (
            <span key={i}>{tag}</span>
          ))}
        </div>

        <h3 className="course-title-overlay">{courseDetails.heading}</h3>

        <div className="price-section">
          {/* <span className="price">₹{courseDetails.fee || 0}</span> */}

          <button
            className={activeTab === 'overview' ? 'active-tab' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>

          <button
            onClick={() =>
              navigate(`/enrolled-courses-description/${id}/lessons`, {
                state: { courseDetails } // This sends data to Lessons page
              })
            }
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

        <div className="course-description">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default CourseCard
