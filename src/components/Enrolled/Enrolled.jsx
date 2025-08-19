import React, { useEffect, useState } from 'react'
import './enrolled.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Enrolled() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])

  const handleCourseDetailsClick = (id) => {
    navigate(`/enrolled-courses-description/${id}`)
  }
  useEffect(() => {
    EnrolledcourseList()
  }, [])
  // const enrolledCourses = [
  //   {
  //     id: 1,
  //     image: 'https://images.shiksha.com/mediadata/images/articles/1636380113phpx6DTa8.jpeg',
  //     title: 'Fundamentals of Human Anatomy',
  //     author: 'Dr. Hitesh Choudhary',
  //     rating: 4.7,
  //     reviews: 10729,
  //     price: '₹399.00',
  //   },
  //   {
  //     id: 2,
  //     image: 'https://aimlay.com/wp-content/uploads/2023/08/medicals-course-.webp',
  //     title: 'Introduction to Pharmacology',
  //     author: 'Dr. John Doe',
  //     rating: 4.5,
  //     reviews: 8520,
  //     price: '₹299.00',
  //   },
  //   {
  //     id: 3,
  //     image: 'https://www.aimlay.com/wp-content/uploads/2023/06/require-the-neet.webp',
  //     title: 'Pathology Essentials',
  //     author: 'Dr. Jane Smith',
  //     rating: 4.6,
  //     reviews: 9200,
  //     price: '₹499.00',
  //   },
  // ]
  const EnrolledcourseList = () => {
    let Bearer = sessionStorage.getItem('token')
    axios({
      url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/course/purchased/list',
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
    <div className="enrolled-grid">
      {courses.map((course) => (
        <div key={course.cs_id} className="enrolled-card">
          <img
            src={`${import.meta.env.VITE_BASE_URL}/${course.cs_image}`}
            alt={course.cs_heading}
            className="enrolled-image"
          />
          <div className="enrolled-info">
            <h3 className="enrolled-title">{course.cs_heading}</h3>
            <p className="enrolled-author">
              {course.cs_description?.split(' ').slice(0, 10).join(' ')}...
            </p>
            <div className="enrolled-rating">
              <span className="rating">{course.rating}</span>
              <span className="stars">★★★★★</span>
              <span className="review-count">({course.reviews ? course.reviews : '30'})</span>
            </div>
            <button
              onClick={() => handleCourseDetailsClick(course.cs_id)}
              className="course-details-button mb-3"
            >
              Course Details
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Enrolled
