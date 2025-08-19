import React, { useEffect, useState } from 'react'
import './ExamQuestion.css'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'
import { toast } from 'react-toastify'

const ExamQuestion = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const examMinutes = location.state.ex_duration
  const examId = location?.state?.ex_id
  const [lockedQuestions, setLockedQuestions] = useState(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState({})
  const [markedReview, setMarkedReview] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(examMinutes * 60)
  const [showModal, setShowModal] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  useEffect(() => {
    const savedResponses = localStorage.getItem('examResponses')
    const savedLocked = localStorage.getItem('lockedQuestions')
    const savedMarked = localStorage.getItem('markedReview')
    console.log(savedResponses, 'savedResponses')

    if (savedResponses) setResponses(JSON.parse(savedResponses))
    if (savedLocked) setLockedQuestions(new Set(JSON.parse(savedLocked)))
    if (savedMarked) setMarkedReview(new Set(JSON.parse(savedMarked)))
  }, [])
  useEffect(() => {
    localStorage.setItem('examResponses', JSON.stringify(responses))
  }, [responses])

  useEffect(() => {
    localStorage.setItem('lockedQuestions', JSON.stringify([...lockedQuestions]))
  }, [lockedQuestions])

  useEffect(() => {
    localStorage.setItem('markedReview', JSON.stringify([...markedReview]))
  }, [markedReview])

  const clearExamData = () => {
    localStorage.removeItem('examResponses')
    localStorage.removeItem('lockedQuestions')
    localStorage.removeItem('markedReview')
    localStorage.removeItem('examEndTime')
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentIndex])

  useEffect(() => {
    const savedEndTime = localStorage.getItem('examEndTime')

    if (!savedEndTime) {
      const newEndTime = Date.now() + examMinutes * 60 * 1000
      localStorage.setItem('examEndTime', newEndTime)
    }
  }, [examMinutes])

  useEffect(() => {
    fetchQuestionsList()

    const timer = setInterval(() => {
      const examEndTime = localStorage.getItem('examEndTime')
      if (!examEndTime) return

      const diff = Math.floor((parseInt(examEndTime) - Date.now()) / 1000)

      if (diff <= 0) {
        setTimeLeft(0)
        clearInterval(timer)
        handleAutoSubmit()
      } else {
        setTimeLeft(diff)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchQuestionsList = () => {
    let Bearer = sessionStorage.getItem('token')

    axios({
      url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/exam/data',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${Bearer}`,
      },
      data: { examId },
      method: 'POST',
    })
      .then((response) => {
        if (response.data.result) {
          const ids = response.data.data
          setQuestions(ids)
          if (ids.length > 0) fetchQuestionDetails(ids[0])
        } else {
          toast.info(response.data.message)
        }
      })
      .catch((err) => {
        console.log(err, 'error fetching questions list')
      })
  }

  const fetchQuestionDetails = (questionId) => {
    let Bearer = sessionStorage.getItem('token')

    axios({
      url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/exam/question',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${Bearer}`,
      },
      data: { examId, exam_question_id: questionId },
      method: 'POST',
    })
      .then((response) => {
        if (response.data.result) {
          setCurrentQuestion(response.data.data)
        } else {
          toast.info(response.data.message)
        }
      })
      .catch((err) => {
        console.log(err, 'error fetching question details')
      })
  }
  const submit_Questions = (questionId) => {
    let Bearer = sessionStorage.getItem('token')
    const submittedAnswer = responses[questionId]

    if (submittedAnswer === undefined) {
      console.warn('No answer selected for question', questionId)
      return
    }

    let selectedValues = []
    try {
      const selectedQuestion = currentQuestion
      const qOptions = selectedQuestion?.q_options || []

      if (selectedQuestion.q_type === 'Multiple choice multiple Answer') {
        selectedValues = submittedAnswer.map((idx) => qOptions[idx]).filter(Boolean)
      } else {
        selectedValues = [qOptions[submittedAnswer]].filter(Boolean)
      }

      const savedAnswerValues = JSON.parse(localStorage.getItem('examAnswerValues')) || {}
      savedAnswerValues[questionId] = selectedValues
      localStorage.setItem('examAnswerValues', JSON.stringify(savedAnswerValues))

      console.log(`Storing and submitting answer for Q${questionId}:`, selectedValues)
    } catch (err) {
      console.error('Failed to process selected answer', err)
      return
    }

    const payload = {
      examId: examId,
      exam_question_id: questionId,
      submitted_answer: selectedValues,
      time_taken: timeLeft,
    }

    axios({
      url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/exam/question/submit',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${Bearer}`,
      },
      data: payload,
      method: 'POST',
    })
      .then((response) => {
        if (response.data.result) {
          console.log(`✅ Question ${questionId} submitted with answer:`, selectedValues)
        } else {
          toast.info(response.data.message)
        }
      })
      .catch((err) => {
        console.error('Error submitting question', err)
      })
  }

  useEffect(() => {
    console.log('Current responses:', responses)
  }, [responses])

  const submit_Exam = (isTimeout) => {
    const Bearer = sessionStorage.getItem('token')

    const answeredIds = Array.from(lockedQuestions)
    const pendingIds = questions.filter((qId) => !answeredIds.includes(qId))

    const payload = {
      examId: examId,
      is_timeout: isTimeout ? true : false,
      pending_questions: pendingIds,
    }

    axios({
      url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/exam/submit',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${Bearer}`,
      },
      data: payload,
      method: 'POST',
    })
      .then((response) => {
        if (response.data.result) {
          console.log('Exam submitted successfully.')
        } else {
          toast.info(response.data.message)
        }
      })
      .catch((err) => {
        console.error('Error submitting exam', err)
      })
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleOptionSelect = (optionIndex) => {
    const currentQId = questions[currentIndex]

    if (lockedQuestions.has(currentQId)) return

    if (currentQuestion.q_type === 'Multiple choice multiple Answer') {
      const prevSelections = responses[currentQId] || []
      const newSelections = prevSelections.includes(optionIndex)
        ? prevSelections.filter((idx) => idx !== optionIndex)
        : [...prevSelections, optionIndex]

      setResponses((prev) => ({ ...prev, [currentQId]: newSelections }))
    } else {
      setResponses((prev) => ({ ...prev, [currentQId]: optionIndex }))
    }
  }

  const handleMarkForReview = () => {
    const currentQId = questions[currentIndex]

    setMarkedReview((prev) => new Set(prev).add(currentQId))

    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      fetchQuestionDetails(questions[newIndex])
    }
  }

  const goNext = () => {
    const currentQId = questions[currentIndex]

    if (responses[currentQId] !== undefined) {
      // Submit the current question before moving to the next one
      submit_Questions(currentQId)

      // Lock the current question
      setLockedQuestions((prev) => new Set(prev).add(currentQId))

      // If it was marked for review and is now answered, remove from review
      setMarkedReview((prev) => {
        const newSet = new Set(prev)
        newSet.delete(currentQId)
        return newSet
      })
    }

    // Move to next question
    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      fetchQuestionDetails(questions[newIndex])
    }
  }

  const getStatusClass = (qId) => {
    if (lockedQuestions.has(qId)) return 'green'
    if (markedReview.has(qId)) return 'blue'
    return 'gray'
  }

  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      fetchQuestionDetails(questions[newIndex])
    }
  }

  const jumpTo = (index) => {
    setCurrentIndex(index)
    fetchQuestionDetails(questions[index])
  }

  const handleAutoSubmit = () => {
    submit_Exam(true)
    localStorage.removeItem('examEndTime')
    clearExamData()
    alert('⏳ Time is over! Auto-submitting exam...')
    navigate('/Exam')
  }

  const handleSubmit = () => setShowModal(true)

  const confirmSubmit = () => {
    setShowModal(false)
    localStorage.removeItem('examEndTime')
    clearExamData()
    submit_Exam(false)

    navigate('/Exam')
    Swal.fire({
      icon: 'success',
      title: 'Exam submitted successfully!',
      text: 'Results will be shared with you shortly',
      confirmButtonText: 'OK',
    })
  }

  const cancelSubmit = () => setShowModal(false)
  const baseurl = 'https://lunarsenterprises.com:6028/'

  const totalQuestions = questions.length
  const answeredCount = lockedQuestions.size
  const reviewCount = markedReview.size
  const visitedSet = new Set([...lockedQuestions, ...markedReview])
  const notVisitedCount = totalQuestions - visitedSet.size

  return (
    <>
      <div className="exam-container">
        <div className="exam-header">
          <div className="exam-timer">Remaining Time: {formatTime(timeLeft)}</div>
        </div>

        <div className="exam-body">
          <div className="question-area">
            <div className="question-content">
              <div className="question-number">
                Q.{currentIndex + 1}/{questions.length})
              </div>
              <p className="question-text">{currentQuestion?.q_question}</p>

              {currentQuestion?.q_image ? (
                <div className="image-panel">
                  <div className="image-watermark-inside">www.drlifeboat.com</div>
                  <img src={baseurl + currentQuestion.q_image} alt="Exam Question" />
                </div>
              ) : (
                <div className="image-panel">
                  <div className="image-watermark">www.drlifeboat.com</div>
                </div>
              )}

              <div className="options">
                {currentQuestion?.q_options?.map((opt, idx) => {
                  const currentQId = questions[currentIndex]
                  const selected = responses[currentQId]
                  const isChecked =
                    currentQuestion.q_type === 'Multiple choice multiple Answer'
                      ? selected?.includes(idx)
                      : selected === idx

                  return (
                    <label key={idx} className="option">
                      <input
                        type={
                          currentQuestion.q_type === 'Multiple choice multiple Answer'
                            ? 'checkbox'
                            : 'radio'
                        }
                        name={`answer-${currentIndex}`}
                        checked={!!isChecked}
                        onChange={() => handleOptionSelect(idx)}
                      />
                      <span>
                        {String.fromCharCode(65 + idx)}) {opt}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Fixed bottom action buttons */}
            <div className="fixed-action-buttons">
              <button className="mark-review" onClick={handleMarkForReview}>
                MARK FOR REVIEW & NEXT
              </button>
              <button className="save-next" onClick={goNext}>
                SAVE & NEXT
              </button>
            </div>

            <div className="navigation">
              <button className="nav-btn" onClick={goBack} disabled={currentIndex === 0}>
                <FaChevronLeft /> BACK
              </button>

              <button
                className="nav-btn"
                onClick={goNext}
                disabled={currentIndex === questions.length - 1}
              >
                NEXT <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="image-panel-divider" />
          <div className="status-panel">
            <div className="legend">
              <p className="legend-para">
                <span className="box gray" /> Total Questions<span>{totalQuestions}</span>
              </p>
              <p className="legend-para">
                <span className="box gray" /> Not Visited <span>{notVisitedCount}</span>
              </p>
              <p className="legend-para">
                <span className="box green" /> Answered <span>{answeredCount}</span>
              </p>
              <p className="legend-para">
                <span className="box blue" /> Mark for review <span>{reviewCount}</span>
              </p>
            </div>
            <div className="scrollable-grid">
              <div className="number-grid">
                {questions.map((qId, i) => (
                  <div
                    key={qId}
                    className={`number-box ${getStatusClass(qId)} ${
                      currentIndex === i ? 'active' : ''
                    }`}
                    onClick={() => jumpTo(i)}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            <button className="submit-btn" onClick={handleSubmit}>
              SUBMIT EXAM
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="left-confirmation">
          <h3>Confirm Submission</h3>
          <p>
            Are you sure you want to submit the exam? <br />
            <b>You cannot change answers after submission.</b>
          </p>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={cancelSubmit}>
              Cancel
            </button>
            <button className="confirm-btn" onClick={confirmSubmit}>
              Yes, Submit
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ExamQuestion
