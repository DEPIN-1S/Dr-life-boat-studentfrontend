import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './courses.css'
import axios from 'axios'

import { API_BASE_URL } from '../../utils/apiConfig'

function Courses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])

  const handleDetailsClick = (id) => {
    navigate(`/courses/courses_details/${id}`)
  }

  useEffect(() => {
    courseList()
  }, [])

  const courseList = () => {
    let Bearer = sessionStorage.getItem('token')
    axios({
      url: API_BASE_URL + '/drlifeboat/student/course/list',
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
    <div className="courses-container">
      <div className="course-grid">
        {courses?.map((course) => (
          <div key={course.cs_id} className="course-card">
            <div className="course-image-container">
              <img
                src={`${API_BASE_URL}/${course.cs_image}`}
                alt={course.cs_heading}
                className="course-image"
              />
            </div>
            <div className="course-info">
              <h3 className="course-title">{course.cs_heading}</h3>
              <p className="course-author">{course?.author}</p>
              <div className="course-rating">
                <span className="rating">{course?.rating || '0.0'}</span>
                <span className="stars">★★★★★</span>
                <span className="review-count">({course?.reviews || 0})</span>
              </div>
              <div className="course-price">₹{course.cs_fee}</div>
            </div>
            <div className="course-buttons">
              <button className="buy-now-button">Buy Now</button>
              <button
                className="details-now-button"
                onClick={() => handleDetailsClick(course.cs_id)}
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

export default Courses
