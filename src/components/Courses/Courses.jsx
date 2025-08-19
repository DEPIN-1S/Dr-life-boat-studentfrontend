import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './courses.css' // make sure the CSS file name matches
import axios from 'axios'

function Courses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const handleDetailsClick = (id) => {
    navigate(`/courses/courses_details/${id}`)
  }
  useEffect(() => {
    courseList()
  }, [])
  // const courseL = [
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
  const courseList = () => {
    let Bearer = sessionStorage.getItem('token')
    axios({
      url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/course/list',
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
    <div className="course-grid">
      {courses?.map((course) => (
        <div key={course.cs_id} className="course-card">
          <img
            src={`${import.meta.env.VITE_BASE_URL}/${course.cs_image}`}
            alt={course.cs_heading}
            className="course-image"
          />
          <div className="course-info">
            <h3 className="course-title">{course.cs_heading}</h3>
            <p className="course-author">{course?.author}</p>
            <div className="course-rating">
              <span className="rating">{course?.rating}</span>
              <span className="stars">★★★★★</span>
              <span className="review-count">({course?.reviews})</span>
            </div>
            <div className="course-price">₹{course.cs_fee}</div>
          </div>
          <button className="buy-now-button mb-3">Buy Now</button>
          <button
            className="details-now-button mb-3"
            onClick={() => handleDetailsClick(course.cs_id)}
          >
            Course Details
          </button>
        </div>
      ))}
    </div>
  )
}

export default Courses
