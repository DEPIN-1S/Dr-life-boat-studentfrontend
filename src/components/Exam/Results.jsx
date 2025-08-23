import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaCheck, FaTimes } from 'react-icons/fa'
import axios from 'axios'
import './Results.css'

const Results = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const examId = location?.state?.ex_id
  const [examDetails, setExamDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!examId) {
      alert('Exam ID is missing')
      navigate('/exam')
      return
    }

    fetchExamDetails()
  }, [examId, navigate])

  const fetchExamDetails = () => {
    const Bearer = sessionStorage.getItem('token')

    axios({
      url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/exam/submission/data',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${Bearer}`,
      },
      data: { submittedExam_id: examId },
      method: 'POST',
    })
      .then((response) => {
        if (response.data.result) {
          setExamDetails(response.data.data)
        } else {
          alert(response.data.message)
          navigate('/exam')
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching exam details:', err)
        alert('Failed to fetch exam results')
        navigate('/exam')
        setLoading(false)
      })
  }

  const formatTime = (timeString) => {
    return timeString || '00:00:00'
  }

  if (loading) {
    return <div className="result-container">Loading...</div>
  }

  if (!examDetails || examDetails.length === 0) {
    return <div className="result-container">No results found for this exam.</div>
  }

  const totalMarks = examDetails.reduce((sum, item) => sum + parseFloat(item.ea_mark || 0), 0)
  const totalQuestions = examDetails.length
  const correctAnswers = examDetails.filter((item) => item.ea_correct === 1).length
  const incorrectAnswers = totalQuestions - correctAnswers
  const totalTimeTaken = examDetails[0]?.ea_time_taken || '00:00:00'

  return (
    <div className="result-container">
      <div className="result-header">
        <h2>Exam Results</h2>
        <div className="result-summary">
          <div className="summary-item">
            <span>Total Score:</span> {totalMarks.toFixed(2)} / {totalQuestions}
          </div>
          <div className="summary-item">
            <span>Correct Answers:</span> {correctAnswers}
          </div>
          <div className="summary-item">
            <span>Incorrect Answers:</span> {incorrectAnswers}
          </div>
          <div className="summary-item">
            <span>Time Taken:</span> {formatTime(totalTimeTaken)}
          </div>
        </div>
      </div>

      <div className="result-body">
        {examDetails.map((question, index) => {
          const isCorrect = question.ea_correct === 1
          const parsedOptions = JSON.parse(question.q_options || '[]')
          const parsedCorrectAnswers = JSON.parse(question.q_answer || '[]')
          const parsedSubmittedAnswers = JSON.parse(question.ea_submitted_answer || '[]')

          return (
            <div key={question.ea_question_id} className="result-card">
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                <span className="question-text">{question.q_question}</span>
                <span className={`status-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? <FaCheck /> : <FaTimes />}
                </span>
              </div>
              {question.q_image && (
                <div className="image-panel">
                  <div className="image-watermark">www.drlifeboat.com</div>
                  <img
                    src={`https://lunarsenterprises.com:6028/${question.q_image}`}
                    alt="Question"
                  />
                </div>
              )}
              <div className="options">
                {parsedOptions.map((option, idx) => {
                  const isOptionCorrect = parsedCorrectAnswers.includes(option)
                  const isOptionSelected = parsedSubmittedAnswers.includes(option)

                  return (
                    <div
                      key={idx}
                      className={`option ${
                        isOptionCorrect ? 'correct-option' : isOptionSelected ? 'incorrect-option' : ''
                      }`}
                    >
                      <span>{String.fromCharCode(65 + idx)}. {option}</span>
                      {isOptionCorrect && <FaCheck className="option-icon correct" />}
                      {isOptionSelected && !isOptionCorrect && (
                        <FaTimes className="option-icon incorrect" />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="marks">
                Marks Obtained: {parseFloat(question.ea_mark || 0).toFixed(2)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="result-footer">
        <button className="back-btn" onClick={() => navigate('/exam')}>
          Back to Exams
        </button>
      </div>
    </div>
  )
}

export default Results
