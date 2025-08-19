import React, { useEffect, useState } from 'react'
import './Exam.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Exam = () => {
  const navigation = useNavigate()
  const [exam, setExam] = useState([])
  const [enrolled, setEnrolled] = useState('')

  useEffect(() => {
    ExamList()
  }, [])

  const ExamList = () => {
    let Bearer = sessionStorage.getItem('token')

    axios({
      url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/exam/list',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${Bearer}`,
      },
      method: 'GET',
    })
      .then((response) => {
        if (response.data.result) {
          setExam(response.data.data)
          setEnrolled(response?.data?.enrolled)
        } else {
          toast.info(response.data.message)
        }
      })
      .catch((err) => {
        console.log(err, 'error inside couseData')
      })
  }
  const baseurl = import.meta.env.VITE_BASE_URL
  return (
    <div className="exam-grid-container">
      <h2 className="exam-grid-title">Available Exams</h2>
      <div className="exam-grid">
        {exam.map((exam) => (
          <div
            key={exam.ex_id}
            className="exam-card"
            onClick={() => navigation('/instructions', { state: exam })}
          >
            <img src={baseurl + '/' + exam.ex_file} alt={exam.ex_name} className="exam-image" />
            <div className="exam-info">
              <h3 className="exam-name">{exam.ex_name}</h3>
              <p className="exam-time">⏱ {exam.ex_duration} min</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Exam
