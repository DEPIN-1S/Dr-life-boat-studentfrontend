import React, { useEffect, useState } from 'react'
import './enrolled.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import { API_BASE_URL } from '../../utils/apiConfig'

function Enrolled() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])

  const handleCourseDetailsClick = (id) => {
    navigate(`/enrolled-courses-description/${id}`)
  }

  useEffect(() => {
    EnrolledcourseList()
  }, [])

  const EnrolledcourseList = () => {
    let Bearer = sessionStorage.getItem('token')
    axios({
      url: API_BASE_URL + '/drlifeboat/student/course/purchased/list',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${Bearer}`,
      },
      method: 'GET',
    })
      .then((response) => {
        if (response.data.result) {
          setCourses(response.data.data)
        } else {
          console.log(response.data.message, 'error message')
        }
      })
      .catch((err) => {
        console.log(err, 'error occurred')
      })
  }

  return (
    <div className="enrolled-container">
      <div className="enrolled-grid">
        {courses.map((course) => (
          <div key={course.cs_id} className="enrolled-card">
            <div className="enrolled-image-container">
              <img
                src={`${API_BASE_URL}/${course.cs_image}`}
                alt={course.cs_heading}
                className="enrolled-image"
              />
            </div>
            <div className="enrolled-info">
              <h3 className="enrolled-title">{course.cs_heading}</h3>
              <p className="enrolled-author">
                {course.cs_description?.split(' ').slice(0, 10).join(' ')}...
              </p>
              <div className="enrolled-rating">
                <span className="rating">{course.rating || '0.0'}</span>
                <span className="stars">★★★★★</span>
                <span className="review-count">({course.reviews || '30'})</span>
              </div>
              <button
                onClick={() => handleCourseDetailsClick(course.cs_id)}
                className="course-details-button"
              >
                Course Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Enrolled
