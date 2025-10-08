
// Dashboard.jsx
import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Container } from 'react-bootstrap'
import { FaBookOpen, FaGraduationCap, FaTrophy } from 'react-icons/fa'
import './dashboard.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [course, setCourse] = useState([])

  useEffect(() => {
    EnrolledcourseList()
    courseList()
  }, [])

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
          setCourse(response.data.data)
        } else {
          console.log(response.data.message, 'error message')
        }
      })
      .catch((err) => {
        console.log(err, 'error occurred')
      })
  }

  const stats = [
    {
      icon: <FaBookOpen size={40} className="icon-bg" />,
      label: 'Enrolled Courses',
      count: courses.length,
      path: '/enrolled-courses',
    },
    {
      icon: <FaGraduationCap size={40} className="icon-bg" />,
      label: 'Active Courses',
      count: course.length,
      path: '/courses',
    },
    {
      icon: <FaTrophy size={40} className="icon-bg" />,
      label: 'Completed Courses',
      count: 0,
      path: '/',
    },
  ]

  return (
    <Container fluid className="dashboard-container">
      <div className="dashboard-header">
        <h4 className="dashboard-title">Dashboard</h4>
      </div>

      <Row className="stats-row g-3">
        {stats.map((item, index) => (
          <Col
            key={index}
            xs={12}
            sm={6}
            lg={4}
            className="stat-col"
          >
            <Card
              className="stat-card h-100"
              onClick={() => navigate(item.path)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(item.path)
                }
              }}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="icon-wrapper mb-3">{item.icon}</div>
                <h5 className="stat-count mb-2">{item.count}</h5>
                <p className="stat-label mb-0 text-center">{item.label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Dashboard
