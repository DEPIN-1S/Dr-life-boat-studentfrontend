import React, { useEffect, useState } from 'react';
import './ExamQuestion.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const ExamQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const exam = location?.state; // Expecting entire exam object
  const examId = exam?.ex_id;
  const examMinutes = exam?.ex_duration || 0; // Default to 0 if undefined
  const [lockedQuestions, setLockedQuestions] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [markedReview, setMarkedReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(examMinutes * 60 || 0); // Initialize with 0 if examMinutes is invalid
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    // Check if examId is valid
    if (!examId) {
      console.log('Exam ID is missing');
      navigate('/exam');
      return;
    }

    // Load saved state from localStorage
    const savedResponses = localStorage.getItem('examResponses');
    const savedLocked = localStorage.getItem('lockedQuestions');
    const savedMarked = localStorage.getItem('markedReview');
    const savedEndTime = localStorage.getItem('examEndTime');

    if (savedResponses) setResponses(JSON.parse(savedResponses));
    if (savedLocked) setLockedQuestions(new Set(JSON.parse(savedLocked)));
    if (savedMarked) setMarkedReview(new Set(JSON.parse(savedMarked)));

    localStorage.setItem('currentExamId', examId);

    // Set exam end time if not already set
    if (!savedEndTime) {
      const newEndTime = Date.now() + examMinutes * 60 * 1000;
      localStorage.setItem('examEndTime', newEndTime);
    }

    // Fetch questions and start timer
    fetchQuestionsList();

    const timer = setInterval(() => {
      const examEndTime = localStorage.getItem('examEndTime');
      if (!examEndTime) return;

      const diff = Math.floor((parseInt(examEndTime) - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
        handleAutoSubmit();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [examId, navigate, examMinutes]);

  useEffect(() => {
    // Update localStorage when responses, lockedQuestions, or markedReview change
    localStorage.setItem('examResponses', JSON.stringify(responses));
    localStorage.setItem('lockedQuestions', JSON.stringify([...lockedQuestions]));
    localStorage.setItem('markedReview', JSON.stringify([...markedReview]));
  }, [responses, lockedQuestions, markedReview]);

  useEffect(() => {
    // Scroll to top and update question start time when currentIndex changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuestionStartTime(Date.now());
    if (questions.length > 0) fetchQuestionDetails(questions[currentIndex]);
  }, [currentIndex, questions]);

  const clearExamData = () => {
    localStorage.removeItem('examResponses');
    localStorage.removeItem('lockedQuestions');
    localStorage.removeItem('markedReview');
    localStorage.removeItem('examEndTime');
    localStorage.removeItem('currentExamId');
  };

  const fetchQuestionsList = () => {
    let Bearer = sessionStorage.getItem('token');

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
          const ids = response.data.data;
          setQuestions(ids);
          if (ids.length > 0) fetchQuestionDetails(ids[0]);
        } else {
          console.log(response.data.message);
        }
      })
      .catch((err) => {
        console.error('Error fetching questions list:', err);
        console.log('Error fetching questions list');
      });
  };

  const fetchQuestionDetails = (questionId) => {
    let Bearer = sessionStorage.getItem('token');

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
          setCurrentQuestion(response.data.data);
        } else {
          console.log(response.data.message);
        }
      })
      .catch((err) => {
        console.error('Error fetching question details:', err);
        console.log('Error fetching question details');
      });
  };

  const secondsToTimeString = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const submitQuestions = async (questionId) => {
    let Bearer = sessionStorage.getItem('token');
    const submittedAnswer = responses[questionId];

    if (submittedAnswer === undefined) {
      console.warn('No answer selected for question', questionId);
      return false;
    }

    let selectedValues = [];
    try {
      const selectedQuestion = currentQuestion;
      const qOptions = selectedQuestion?.q_options || [];

      if (selectedQuestion.q_type === 'Multiple choice multiple Answer') {
        selectedValues = submittedAnswer.map((idx) => qOptions[idx]).filter(Boolean);
      } else {
        selectedValues = [qOptions[submittedAnswer]].filter(Boolean);
      }

      const savedAnswerValues = JSON.parse(localStorage.getItem('examAnswerValues')) || {};
      savedAnswerValues[questionId] = selectedValues;
      localStorage.setItem('examAnswerValues', JSON.stringify(savedAnswerValues));

      console.log(`Storing and submitting answer for Q${questionId}:`, selectedValues);
    } catch (err) {
      console.error('Failed to process selected answer', err);
      return false;
    }

    const timeTakenSeconds = Math.floor((Date.now() - questionStartTime) / 1000);
    const timeTaken = secondsToTimeString(timeTakenSeconds);

    const payload = {
      examId: examId,
      exam_question_id: questionId,
      submitted_answer: selectedValues,
      time_taken: timeTaken,
    };

    try {
      const response = await axios({
        url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/exam/question/submit',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Bearer}`,
        },
        data: payload,
        method: 'POST',
      });
      if (response.data.result) {
        console.log('Question submitted successfully:', questionId);
        return true;
      } else {
        console.error('Failed to submit question:', response.data.message);
        console.log(response.data.message || 'Failed to submit answer');
        return false;
      }
    } catch (err) {
      console.error('Error submitting question:', err);
      console.log('Error submitting answer: ' + err.message);
      return false;
    }
  };

  const submitExam = async (isTimeout) => {
    const Bearer = sessionStorage.getItem('token');
    const answeredIds = Array.from(lockedQuestions);
    const pendingIds = questions.filter((qId) => !answeredIds.includes(qId));

    const payload = {
      examId: examId,
      is_timeout: isTimeout ? true : false,
      pending_questions: pendingIds,
    };

    try {
      const response = await axios({
        url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/exam/submit',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Bearer}`,
        },
        data: payload,
        method: 'POST',
      });

      if (response.data.result && response.data.data) {
        localStorage.setItem(`examResults_${examId}`, JSON.stringify(response.data.data));
      }

      return response.data;
    } catch (err) {
      console.error('Error submitting exam:', err);
      throw new Error(err.message || 'Failed to submit exam');
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex) => {
    const currentQId = questions[currentIndex];

    if (lockedQuestions.has(currentQId)) return;

    if (currentQuestion.q_type === 'Multiple choice multiple Answer') {
      const prevSelections = responses[currentQId] || [];
      const newSelections = prevSelections.includes(optionIndex)
        ? prevSelections.filter((idx) => idx !== optionIndex)
        : [...prevSelections, optionIndex];

      setResponses((prev) => ({ ...prev, [currentQId]: newSelections }));
    } else {
      setResponses((prev) => ({ ...prev, [currentQId]: optionIndex }));
    }
  };

  const handleMarkForReview = () => {
    const currentQId = questions[currentIndex];

    setMarkedReview((prev) => new Set(prev).add(currentQId));

    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      fetchQuestionDetails(questions[newIndex]);
    }
  };

  const goNext = async () => {
    const currentQId = questions[currentIndex];

    if (responses[currentQId] !== undefined) {
      const success = await submitQuestions(currentQId);
      if (success) {
        setLockedQuestions((prev) => new Set(prev).add(currentQId));
        setMarkedReview((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentQId);
          return newSet;
        });
      } else {
        return; // Stay on current question if submission fails
      }
    }

    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      fetchQuestionDetails(questions[newIndex]);
    }
  };

  const getStatusClass = (qId) => {
    if (lockedQuestions.has(qId)) return 'green';
    if (markedReview.has(qId)) return 'blue';
    return 'gray';
  };

  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      fetchQuestionDetails(questions[newIndex]);
    }
  };

  const jumpTo = (index) => {
    setCurrentIndex(index);
    fetchQuestionDetails(questions[index]);
  };

  const handleAutoSubmit = async () => {
    try {
      const response = await submitExam(true);
      if (response.result) {
        localStorage.removeItem('examEndTime');
        clearExamData();
        console.log('⏳ Time is over! Auto-submitting exam...');
        navigate(`/exam/result/${examId}`);
      } else {
        console.log(response.message || 'Failed to auto-submit exam');
      }
    } catch (err) {
      console.log('Error during auto-submit: ' + err.message);
    }
  };

  const handleSubmit = () => setShowModal(true);

  const confirmSubmit = async () => {
    setShowModal(false);
    try {
      const response = await submitExam(false);
      if (response.result) {
        localStorage.removeItem('examEndTime');
        clearExamData();
        Swal.fire({
          icon: 'success',
          title: 'Exam submitted successfully!',
          text: 'Results will be shared with you shortly',
          confirmButtonText: 'OK',
        }).then(() => {
          navigate(`/exam/result/${examId}`);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: response.message || 'Please resolve issues and try again',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error submitting exam: ' + err.message,
      });
    }
  };

  const cancelSubmit = () => setShowModal(false);
  const baseurl = 'https://lunarsenterprises.com:6028/';

  const totalQuestions = questions.length;
  const answeredCount = lockedQuestions.size;
  const reviewCount = markedReview.size;
  const visitedSet = new Set([...lockedQuestions, ...markedReview]);
  const notVisitedCount = totalQuestions - visitedSet.size;

  return (
    <>
      <div className="exam-container">
        <div className="exam-header">
          <div className="exam-timer">Remaining Time: {formatTime(timeLeft)}</div>
        </div>

        <div className="exam-body">
          <div className="question-area">
            <div className="question-content">
              <div className="question-number">Q.{currentIndex + 1}/{questions.length}</div>
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
                  const currentQId = questions[currentIndex];
                  const selected = responses[currentQId];
                  const isChecked =
                    currentQuestion.q_type === 'Multiple choice multiple Answer'
                      ? selected?.includes(idx)
                      : selected === idx;

                  return (
                    <label key={idx} className="option">
                      <input
                        type={
                          currentQuestion.q_type === 'Multiple choice multiple Answer' ? 'checkbox' : 'radio'
                        }
                        name={`answer-${currentIndex}`}
                        checked={!!isChecked}
                        onChange={() => handleOptionSelect(idx)}
                      />
                      <span>
                        {String.fromCharCode(65 + idx)}) {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

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
                    className={`number-box ${getStatusClass(qId)} ${currentIndex === i ? 'active' : ''}`}
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
  );
};

export default ExamQuestion;
