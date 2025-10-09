
// import React, { useEffect, useState,useRef } from 'react';
// import './ExamQuestion.css';
// import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import axios from 'axios';

// const ExamQuestion = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [loading, setLoading] = useState(true);
//   const stateExam = location?.state || JSON.parse(sessionStorage.getItem('currentExam') || '{}');
//   const examId = stateExam?.ex_id;
//   const examMinutes = stateExam?.ex_duration || 0;
//   const [lockedQuestions, setLockedQuestions] = useState(new Set());
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [responses, setResponses] = useState({});
//   const [markedReview, setMarkedReview] = useState(new Set());
//   const [timeLeft, setTimeLeft] = useState(examMinutes * 60 || 0);
//   const [showModal, setShowModal] = useState(false);
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestion, setCurrentQuestion] = useState(null);
//   const [questionStartTime, setQuestionStartTime] = useState(Date.now());
//   const [timeUp, setTimeUp] = useState(false);
//   const [timerId, setTimerId] = useState(null);
//   const endTimeRef = useRef(null);

//   useEffect(() => {
//     console.log('Location state in ExamQuestion:', location.state);
//     console.log('Effective stateExam:', stateExam);

//     if (!examId) {
//       console.log('Exam ID is missing');
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Exam',
//         text: 'Please select a valid exam from the list.',
//       }).then(() => {
//         navigate('/exam');
//       });
//       return;
//     }

//     const savedResponses = sessionStorage.getItem('examResponses');
//     const savedLocked = sessionStorage.getItem('lockedQuestions');
//     const savedMarked = sessionStorage.getItem('markedReview');
//     const savedEndTime = sessionStorage.getItem('examEndTime');

//     if (savedResponses) setResponses(JSON.parse(savedResponses));
//     if (savedLocked) setLockedQuestions(new Set(JSON.parse(savedLocked)));
//     if (savedMarked) setMarkedReview(new Set(JSON.parse(savedMarked)));

//     sessionStorage.setItem('currentExamId', examId.toString());

//     // let endTime = savedEndTime;
//     // if (!endTime || isNaN(parseInt(endTime))) {
//     //   endTime = Date.now() + examMinutes * 60 * 1000;
//     //   sessionStorage.setItem('examEndTime', endTime.toString());
//     // }


//     let calculatedEndTime = savedEndTime;
// if (!calculatedEndTime || isNaN(parseInt(calculatedEndTime))) {
//   calculatedEndTime = Date.now() + examMinutes * 60 * 1000;
//   sessionStorage.setItem('examEndTime', calculatedEndTime.toString());
// }
// endTimeRef.current = calculatedEndTime;

//     // Initial time check
//     const initialDiff = Math.floor((parseInt(calculatedEndTime) - Date.now()) / 1000);
//     if (initialDiff <= 0) {
//       setTimeLeft(0);
//       setTimeUp(true);
//       handleTimeout();
//       return;
//     } else {
//       setTimeLeft(initialDiff);
//     }



//     fetchQuestionsList(examId);

//     // const timer = setInterval(() => {
//     //   const examEndTime = sessionStorage.getItem('examEndTime');
//     //   console.log('Exam end time from sessionStorage:', examEndTime);
//     //   if (!examEndTime) return;

//     //   const diff = Math.floor((parseInt(examEndTime) - Date.now()) / 1000);
//     //   if (diff <= 0) {
//     //     setTimeLeft(0);
//     //     setTimeUp(true);
//     //     clearInterval(timer);
//     //     handleTimeout();
//     //   } else {
//     //     setTimeLeft(diff);
//     //   }
//     // }, 1000);

//     // setTimerId(timer);


// const timer = setInterval(() => {
//   const examEndTime = endTimeRef.current;
//   if (!examEndTime) return;

//   const diff = Math.floor((parseInt(examEndTime) - Date.now()) / 1000);
//   if (diff <= 0) {
//     setTimeLeft(0);
//     setTimeUp(true);
//     clearInterval(timer);
//     handleTimeout();
//   } else {
//     setTimeLeft(diff);
//   }
// }, 1000);

// setTimerId(timer);

//     return () => {
//       if (timerId) clearInterval(timerId);
//     };
//   }, [examId, navigate, examMinutes]);

//   const handleTimeout = async () => {
//     try {
//       const result = await submitExam(true);
//       if (result.success) {
//         sessionStorage.removeItem('examEndTime');
//         clearExamData();
//         Swal.fire({
//           icon: 'warning',
//           title: 'Time Up!',
//           text: 'Exam submitted due to time expiration. Returning to exam list.',
//           confirmButtonText: 'OK',
//           allowOutsideClick: false,
//           allowEscapeKey: false
//         }).then(() => {
//           navigate('/exam');
//         });
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Submission Failed',
//           text: 'Failed to submit exam on timeout. Returning to exam list.',
//           confirmButtonText: 'OK'
//         }).then(() => {
//           clearExamData();
//           navigate('/exam');
//         });
//       }
//     } catch (err) {
//       console.error('Error during timeout submission:', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Error submitting exam on timeout. Returning to exam list.',
//         confirmButtonText: 'OK'
//       }).then(() => {
//         clearExamData();
//         navigate('/exam');
//       });
//     }
//   };

//   useEffect(() => {
//     sessionStorage.setItem('examResponses', JSON.stringify(responses));
//     sessionStorage.setItem('lockedQuestions', JSON.stringify([...lockedQuestions]));
//     sessionStorage.setItem('markedReview', JSON.stringify([...markedReview]));
//   }, [responses, lockedQuestions, markedReview]);

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//     setQuestionStartTime(Date.now());
//     if (questions.length > 0) fetchQuestionDetails(questions[currentIndex]);
//   }, [currentIndex, questions]);

//   const clearExamData = () => {
//     sessionStorage.removeItem('examResponses');
//     sessionStorage.removeItem('lockedQuestions');
//     sessionStorage.removeItem('markedReview');
//     sessionStorage.removeItem('examEndTime');
//     sessionStorage.removeItem('currentExamId');
//     sessionStorage.removeItem('examAnswerValues');
//     sessionStorage.removeItem('currentExam');
//   };

//   const fetchQuestionsList = async (examId) => {
//     const Bearer = sessionStorage.getItem('token');
//     const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';

//     try {
//       setLoading(true);
//       const response = await axios({
//         url: `${baseUrl}/drlifeboat/student/exam/data`,
//         headers: {
//           Accept: 'application/json',
//           Authorization: `Bearer ${Bearer}`,
//         },
//         data: { examId: parseInt(examId) },
//         method: 'POST',
//       });
//       if (response.data.result) {
//         const ids = response.data.data || [];
//         setQuestions(ids);
//         if (ids.length > 0) {
//           fetchQuestionDetails(ids[0]);
//         } else {
//           Swal.fire({
//             icon: 'error',
//             title: 'No Questions',
//             text: 'No questions available for this exam.',
//           }).then(() => navigate('/exam'));
//         }
//       } else {
//         console.log(response.data.message);
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: response.data.message || 'Failed to fetch questions.',
//         }).then(() => navigate('/exam'));
//       }
//     } catch (err) {
//       console.error('Error fetching questions list:', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Failed to fetch questions. Please try again.',
//       }).then(() => navigate('/exam'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchQuestionDetails = async (questionId) => {
//     const Bearer = sessionStorage.getItem('token');
//     const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';

//     try {
//       const response = await axios({
//         url: `${baseUrl}/drlifeboat/student/exam/question`,
//         headers: {
//           Accept: 'application/json',
//           Authorization: `Bearer ${Bearer}`,
//         },
//         data: { examId, exam_question_id: questionId },
//         method: 'POST',
//       });
//       if (response.data.result) {
//         let data = response.data.data;
//         // Handle q_question as array of HTML strings - keep for rendering with dangerouslySetInnerHTML
//         if (!Array.isArray(data.q_question)) {
//           if (typeof data.q_question === 'string') {
//             data.q_question = [data.q_question];
//           } else {
//             data.q_question = [];
//           }
//         }
//         // Handle question_images - split by comma if multiple
//         if (data.question_images) {
//           data.questionImages = data.question_images.split(',').map(img => img.trim()).filter(Boolean);
//         } else {
//           data.questionImages = [];
//         }
//         setCurrentQuestion(data);
//       } else {
//         console.log(response.data.message);
//       }
//     } catch (err) {
//       console.error('Error fetching question details:', err);
//       console.log('Error fetching question details');
//     }
//   };

//   const secondsToTimeString = (seconds) => {
//     const safeSeconds = isNaN(seconds) ? 0 : Math.max(0, seconds);
//     const hrs = Math.floor(safeSeconds / 3600);
//     const mins = Math.floor((safeSeconds % 3600) / 60);
//     const secs = safeSeconds % 60;
//     return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const submitQuestions = async (questionId) => {
//     const Bearer = sessionStorage.getItem('token');
//     const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';
//     const submittedAnswer = responses[questionId];

//     if (submittedAnswer === undefined) {
//       console.warn('No answer selected for question', questionId);
//       return false;
//     }

//     let selectedValues = [];
//     try {
//       const selectedQuestion = currentQuestion;
//       const qOptions = selectedQuestion?.q_options || [];

//       if (selectedQuestion.answer_count > 1) {
//         selectedValues = submittedAnswer.map((idx) => qOptions[idx]?.qo_id || 0).filter(id => id > 0);
//       } else {
//         const optionId = qOptions[submittedAnswer]?.qo_id || 0;
//         if (optionId > 0) {
//           selectedValues = [optionId];
//         }
//       }

//       if (selectedValues.length === 0) {
//         console.warn('No valid option ID found');
//         return false;
//       }

//       const savedAnswerValues = JSON.parse(sessionStorage.getItem('examAnswerValues') || '{}');
//       savedAnswerValues[questionId] = selectedValues;
//       sessionStorage.setItem('examAnswerValues', JSON.stringify(savedAnswerValues));

//       console.log(`Storing and submitting answer for Q${questionId}:`, selectedValues);
//     } catch (err) {
//       console.error('Failed to process selected answer', err);
//       return false;
//     }

//     const timeTakenSeconds = Math.floor((Date.now() - questionStartTime) / 1000);
//     if (isNaN(timeTakenSeconds) || timeTakenSeconds < 0) {
//       console.warn('Invalid time taken, using 0');
//       return false;
//     }

//     const payload = {
//       examId: examId,
//       exam_question_id: questionId,
//       submitted_answer: selectedValues,
//       time_taken: timeTakenSeconds,
//     };

//     try {
//       const response = await axios({
//         url: `${baseUrl}/drlifeboat/student/exam/question/submit`,
//         headers: {
//           Accept: 'application/json',
//           Authorization: `Bearer ${Bearer}`,
//         },
//         data: payload,
//         method: 'POST',
//       });
//       if (response.data.result) {
//         console.log('Question submitted successfully:', questionId);
//         return true;
//       } else {
//         console.error('Failed to submit question:', response.data.message);
//         console.log(response.data.message || 'Failed to submit answer');
//         return false;
//       }
//     } catch (err) {
//       console.error('Error submitting question:', err);
//       console.log('Error submitting answer: ' + err.message);
//       return false;
//     }
//   };

//   const submitExam = async (isTimeout) => {
//     const Bearer = sessionStorage.getItem('token');
//     const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';
//     const answeredIds = Array.from(lockedQuestions);
//     const pendingIds = questions.filter((qId) => !answeredIds.includes(qId));

//     const payload = {
//       examId: examId,
//       is_timeout: isTimeout ? true : false,
//       pending_questions: pendingIds,
//     };

//     try {
//       const response = await axios({
//         url: `${baseUrl}/drlifeboat/student/exam/submit`,
//         headers: {
//           Accept: 'application/json',
//           Authorization: `Bearer ${Bearer}`,
//         },
//         data: payload,
//         method: 'POST',
//       });

//       if (response.data.result) {
//         const seId = response.data.se_id || response.data.submission_id || response.data.data?.se_id;
//         if (seId) {
//           sessionStorage.setItem(`examResults_${seId}`, JSON.stringify(response.data.data || []));
//           return { success: true, seId };
//         } else {
//           console.warn('Submission ID not found in response. Using examId as fallback:', examId);
//           return { success: true, seId: examId }; // Fallback to examId
//         }
//       }
//       console.log(response.data.message || 'Failed to submit exam.');
//       return { success: false };
//     } catch (err) {
//       console.error('Error submitting exam:', err);
//       throw new Error(err.message || 'Failed to submit exam');
//     }
//   };

//   const formatTime = (seconds) => {
//     const safeSeconds = isNaN(seconds) ? 0 : Math.max(0, seconds);
//     const hrs = Math.floor(safeSeconds / 3600);
//     const mins = Math.floor((safeSeconds % 3600) / 60);
//     const secs = safeSeconds % 60;
//     return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleOptionSelect = (optionIndex) => {
//     const currentQId = questions[currentIndex];

//     if (lockedQuestions.has(currentQId)) return;

//     if (currentQuestion.answer_count > 1) {
//       const prevSelections = responses[currentQId] || [];
//       const newSelections = prevSelections.includes(optionIndex)
//         ? prevSelections.filter((idx) => idx !== optionIndex)
//         : [...prevSelections, optionIndex];

//       setResponses((prev) => ({ ...prev, [currentQId]: newSelections }));
//     } else {
//       setResponses((prev) => ({ ...prev, [currentQId]: optionIndex }));
//     }
//   };

//   const handleMarkForReview = () => {
//     const currentQId = questions[currentIndex];

//     setMarkedReview((prev) => new Set([...prev, currentQId]));

//     if (currentIndex < questions.length - 1) {
//       const newIndex = currentIndex + 1;
//       setCurrentIndex(newIndex);
//       fetchQuestionDetails(questions[newIndex]);
//     }
//   };

//   const goNext = async () => {
//     const currentQId = questions[currentIndex];

//     if (responses[currentQId] !== undefined) {
//       const success = await submitQuestions(currentQId);
//       console.log('Submit question result for', currentQId, ':', success);

//       if (success) {
//         setLockedQuestions((prev) => new Set([...prev, currentQId]));
//         setMarkedReview((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(currentQId);
//           return newSet;
//         });
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Save Failed',
//           text: 'Failed to save your answer. Please try again.',
//         });
//         return;
//       }
//     }

//     if (currentIndex < questions.length - 1) {
//       const newIndex = currentIndex + 1;
//       setCurrentIndex(newIndex);
//       fetchQuestionDetails(questions[newIndex]);
//     }
//   };

//   const getStatusClass = (qId) => {
//     if (lockedQuestions.has(qId)) return 'green';
//     if (markedReview.has(qId)) return 'blue';
//     return 'gray';
//   };

//   const goBack = () => {
//     if (currentIndex > 0) {
//       const newIndex = currentIndex - 1;
//       setCurrentIndex(newIndex);
//       fetchQuestionDetails(questions[newIndex]);
//     }
//   };

//   const jumpTo = (index) => {
//     setCurrentIndex(index);
//     fetchQuestionDetails(questions[index]);
//   };

//   const handleSubmit = () => {
//     const totalQuestions = questions.length;
//     const answeredCount = lockedQuestions.size;

//     if (answeredCount < totalQuestions) {
//       Swal.fire({
//         title: 'Incomplete Exam',
//         text: `You have answered ${answeredCount} out of ${totalQuestions} questions. It is recommended to answer all questions before submitting. Are you sure you want to submit?`,
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonText: 'Yes, submit anyway',
//         cancelButtonText: 'Answer more questions'
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setShowModal(true);
//         }
//       });
//     } else {
//       setShowModal(true);
//     }
//   };

//   const confirmSubmit = async () => {
//     setShowModal(false);
//     try {
//       const result = await submitExam(false);
//       console.log('Final exam submission result:', result);

//       if (result.success) {
//         sessionStorage.removeItem('examEndTime');
//         clearExamData();
//         Swal.fire({
//           icon: 'success',
//           title: 'Exam submitted successfully!',
//           text: 'Results will be shared with you shortly',
//           confirmButtonText: 'OK',
//         }).then(() => {
//           navigate(`/exam/result/${result.seId}`, { state: { submittedExamId: result.seId } });
//         });
//         console.log('Navigating to results page for submission ID:', result.seId);

//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Submission Failed',
//           text: 'Please resolve issues and try again',
//         });
//       }
//     } catch (err) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Error submitting exam: ' + err.message,
//       });
//     }
//   };

//   const cancelSubmit = () => setShowModal(false);
//   const baseurl = 'https://lunarsenterprises.com:6028/';

//   const totalQuestions = questions.length;
//   const answeredCount = lockedQuestions.size;
//   const reviewCount = markedReview.size;
//   const visitedSet = new Set([...lockedQuestions, ...markedReview]);
//   const notVisitedCount = totalQuestions - visitedSet.size;
//   const questionLines = Array.isArray(currentQuestion?.q_question) ? currentQuestion.q_question : [];
//   const questionImages = currentQuestion?.questionImages || [];
//   const isMultipleChoice = currentQuestion?.answer_count > 1;

//   if (loading) {
//     return (
//       <div className="exam-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
//           <span className="sr-only">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   if (timeUp) {
//     return (
//       <div className="exam-container" style={{ textAlign: 'center', padding: '50px' }}>
//         <h2>Time's Up!</h2>
//         <p>Submitting your exam...</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="exam-container">
//         <div className="exam-header">
//           <div className="exam-timer">Remaining Time: {formatTime(timeLeft)}</div>
//         </div>
//         <div className="exam-body">
//           <div className="question-area">
//             <div className="question-content">
//               <div className="question-number">Q.{currentIndex + 1}/{questions.length}</div>
//               <div className="question-text">
//                 {questionLines.map((line, idx) => (
//                   <div
//                     key={idx}
//                     dangerouslySetInnerHTML={{ __html: line }}
//                     style={{ margin: '0 0 10px 0', lineHeight: '1.6' }}
//                   />
//                 ))}
//               </div>
//               {questionImages.length > 0 && (
//                 <div className="image-panel">
//                   <div className="image-watermark-inside">www.drlifeboat.com</div>
//                   {questionImages.map((imgPath, idx) => (
//                     <img key={idx} src={`${baseurl}${imgPath}`} alt={`Exam Question ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }} />
//                   ))}
//                 </div>
//               )}
//               {!questionImages.length > 0 && (
//                 <div className="image-panel">
//                   <div className="image-watermark">www.drlifeboat.com</div>
//                 </div>
//               )}
//               <div className="options">
//                 {currentQuestion?.q_options?.map((opt, idx) => {
//                   const currentQId = questions[currentIndex];
//                   const selected = responses[currentQId];
//                   const isChecked =
//                     isMultipleChoice
//                       ? selected?.includes(idx)
//                       : selected === idx;

//                   return (
//                     <label key={idx} className="option">
//                       <input
//                         type={isMultipleChoice ? 'checkbox' : 'radio'}
//                         name={`answer-${currentIndex}`}
//                         checked={!!isChecked}
//                         onChange={() => handleOptionSelect(idx)}
//                       />
//                       <span>
//                         {String.fromCharCode(65 + idx)}) {opt.qo_option}
//                       </span>
//                     </label>
//                   );
//                 })}
//               </div>
//             </div>
//             <div className="fixed-action-buttons">
//               <button className="mark-review" onClick={handleMarkForReview}>
//                 MARK FOR REVIEW & NEXT
//               </button>
//               <button className="save-next" onClick={goNext}>
//                 SAVE & NEXT
//               </button>
//             </div>
//             {/* <div className="navigation">
//               <button className="nav-btn" onClick={goBack} disabled={currentIndex === 0}>
//                 <FaChevronLeft /> BACK
//               </button>
//               <button
//                 className="nav-btn"
//                 onClick={goNext}
//                 disabled={currentIndex === questions.length - 1}
//               >
//                 NEXT <FaChevronRight />
//               </button>
//             </div> */}
//           </div>
//           <div className="image-panel-divider" />
//           <div className="status-panel">
//             <div className="legend">
//               <p className="legend-para">
//                 <span className="box gray" /> Total Questions<span>{totalQuestions}</span>
//               </p>
//               <p className="legend-para">
//                 <span className="box gray" /> Not Visited <span>{notVisitedCount}</span>
//               </p>
//               <p className="legend-para">
//                 <span className="box green" /> Answered <span>{answeredCount}</span>
//               </p>
//               <p className="legend-para">
//                 <span className="box blue" /> Mark for review <span>{reviewCount}</span>
//               </p>
//             </div>
//             <div className="scrollable-grid">
//               <div className="number-grid">
//                 {questions.map((qId, i) => (
//                   <div
//                     key={qId}
//                     className={`number-box ${getStatusClass(qId)} ${currentIndex === i ? 'active' : ''}`}
//                     onClick={() => jumpTo(i)}
//                   >
//                     {String(i + 1).padStart(2, '0')}
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <button className="submit-btn" onClick={handleSubmit}>
//               SUBMIT EXAM
//             </button>
//           </div>
//         </div>
//       </div>
//       {showModal && (
//         <div className="left-confirmation">
//           <h3>Confirm Submission</h3>
//           <p>
//             Are you sure you want to submit the exam? <br />
//             <b>You cannot change answers after submission.</b>
//           </p>
//           <div className="modal-actions">
//             <button className="cancel-btn" onClick={cancelSubmit}>
//               Cancel
//             </button>
//             <button className="confirm-btn" onClick={confirmSubmit}>
//               Yes, Submit
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default ExamQuestion;



import React, { useEffect, useState,useRef } from 'react';
import './ExamQuestion.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const ExamQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const stateExam = location?.state || JSON.parse(sessionStorage.getItem('currentExam') || '{}');
  const examId = stateExam?.ex_id;
  const examMinutes = stateExam?.ex_duration || 0;
  const [lockedQuestions, setLockedQuestions] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [markedReview, setMarkedReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(examMinutes * 60 || 0);
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeUp, setTimeUp] = useState(false);
  const [timerId, setTimerId] = useState(null);
  const endTimeRef = useRef(null);

  useEffect(() => {
    console.log('Location state in ExamQuestion:', location.state);
    console.log('Effective stateExam:', stateExam);

    if (!examId) {
      console.log('Exam ID is missing');
      Swal.fire({
        icon: 'error',
        title: 'Invalid Exam',
        text: 'Please select a valid exam from the list.',
      }).then(() => {
        navigate('/exam');
      });
      return;
    }

    const savedResponses = sessionStorage.getItem('examResponses');
    const savedLocked = sessionStorage.getItem('lockedQuestions');
    const savedMarked = sessionStorage.getItem('markedReview');
    const savedEndTime = sessionStorage.getItem('examEndTime');

    if (savedResponses) setResponses(JSON.parse(savedResponses));
    if (savedLocked) setLockedQuestions(new Set(JSON.parse(savedLocked)));
    if (savedMarked) setMarkedReview(new Set(JSON.parse(savedMarked)));

    sessionStorage.setItem('currentExamId', examId.toString());

    // let endTime = savedEndTime;
    // if (!endTime || isNaN(parseInt(endTime))) {
    //   endTime = Date.now() + examMinutes * 60 * 1000;
    //   sessionStorage.setItem('examEndTime', endTime.toString());
    // }


    let calculatedEndTime = savedEndTime;
if (!calculatedEndTime || isNaN(parseInt(calculatedEndTime))) {
  calculatedEndTime = Date.now() + examMinutes * 60 * 1000;
  sessionStorage.setItem('examEndTime', calculatedEndTime.toString());
}
endTimeRef.current = calculatedEndTime;

    // Initial time check
    const initialDiff = Math.floor((parseInt(calculatedEndTime) - Date.now()) / 1000);
    if (initialDiff <= 0) {
      setTimeLeft(0);
      setTimeUp(true);
      handleTimeout();
      return;
    } else {
      setTimeLeft(initialDiff);
    }



    fetchQuestionsList(examId);

    // const timer = setInterval(() => {
    //   const examEndTime = sessionStorage.getItem('examEndTime');
    //   console.log('Exam end time from sessionStorage:', examEndTime);
    //   if (!examEndTime) return;

    //   const diff = Math.floor((parseInt(examEndTime) - Date.now()) / 1000);
    //   if (diff <= 0) {
    //     setTimeLeft(0);
    //     setTimeUp(true);
    //     clearInterval(timer);
    //     handleTimeout();
    //   } else {
    //     setTimeLeft(diff);
    //   }
    // }, 1000);

    // setTimerId(timer);


const timer = setInterval(() => {
  const examEndTime = endTimeRef.current;
  if (!examEndTime) return;

  const diff = Math.floor((parseInt(examEndTime) - Date.now()) / 1000);
  if (diff <= 0) {
    setTimeLeft(0);
    setTimeUp(true);
    clearInterval(timer);
    handleTimeout();
  } else {
    setTimeLeft(diff);
  }
}, 1000);

setTimerId(timer);

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [examId, navigate, examMinutes]);

  const handleTimeout = async () => {
    try {
      const result = await submitExam(true);
      if (result.success) {
        sessionStorage.removeItem('examEndTime');
        clearExamData();
        Swal.fire({
          icon: 'warning',
          title: 'Time Up!',
          text: 'Exam submitted due to time expiration. Returning to exam list.',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(() => {
          navigate('/exam');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Failed to submit exam on timeout. Returning to exam list.',
          confirmButtonText: 'OK'
        }).then(() => {
          clearExamData();
          navigate('/exam');
        });
      }
    } catch (err) {
      console.error('Error during timeout submission:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error submitting exam on timeout. Returning to exam list.',
        confirmButtonText: 'OK'
      }).then(() => {
        clearExamData();
        navigate('/exam');
      });
    }
  };

  useEffect(() => {
    sessionStorage.setItem('examResponses', JSON.stringify(responses));
    sessionStorage.setItem('lockedQuestions', JSON.stringify([...lockedQuestions]));
    sessionStorage.setItem('markedReview', JSON.stringify([...markedReview]));
  }, [responses, lockedQuestions, markedReview]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuestionStartTime(Date.now());
    if (questions.length > 0) fetchQuestionDetails(questions[currentIndex]);
  }, [currentIndex, questions]);

  const clearExamData = () => {
    sessionStorage.removeItem('examResponses');
    sessionStorage.removeItem('lockedQuestions');
    sessionStorage.removeItem('markedReview');
    sessionStorage.removeItem('examEndTime');
    sessionStorage.removeItem('currentExamId');
    sessionStorage.removeItem('examAnswerValues');
    sessionStorage.removeItem('currentExam');
  };

  const fetchQuestionsList = async (examId) => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';

    try {
      setLoading(true);
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/data`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Bearer}`,
        },
        data: { examId: parseInt(examId) },
        method: 'POST',
      });
      if (response.data.result) {
        const ids = response.data.data || [];
        setQuestions(ids);
        if (ids.length > 0) {
          fetchQuestionDetails(ids[0]);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'No Questions',
            text: 'No questions available for this exam.',
          }).then(() => navigate('/exam'));
        }
      } else {
        console.log(response.data.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to fetch questions.',
        }).then(() => navigate('/exam'));
      }
    } catch (err) {
      console.error('Error fetching questions list:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch questions. Please try again.',
      }).then(() => navigate('/exam'));
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionDetails = async (questionId) => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';

    try {
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/question`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Bearer}`,
        },
        data: { examId, exam_question_id: questionId },
        method: 'POST',
      });
      if (response.data.result) {
        let data = response.data.data;
        // Handle q_question as array of HTML strings - keep for rendering with dangerouslySetInnerHTML
        if (!Array.isArray(data.q_question)) {
          if (typeof data.q_question === 'string') {
            data.q_question = [data.q_question];
          } else {
            data.q_question = [];
          }
        }
        // Handle question_images - split by comma if multiple
        if (data.question_images) {
          data.questionImages = data.question_images.split(',').map(img => img.trim()).filter(Boolean);
        } else {
          data.questionImages = [];
        }
        setCurrentQuestion(data);
      } else {
        console.log(response.data.message);
      }
    } catch (err) {
      console.error('Error fetching question details:', err);
      console.log('Error fetching question details');
    }
  };

  const secondsToTimeString = (seconds) => {
    const safeSeconds = isNaN(seconds) ? 0 : Math.max(0, seconds);
    const hrs = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const submitQuestions = async (questionId) => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';
    const submittedAnswer = responses[questionId];

    if (submittedAnswer === undefined) {
      console.warn('No answer selected for question', questionId);
      return false;
    }

    let selectedValues = [];
    try {
      const selectedQuestion = currentQuestion;
      const qOptions = selectedQuestion?.q_options || [];

      if (selectedQuestion.answer_count > 1) {
        selectedValues = submittedAnswer.map((idx) => qOptions[idx]?.qo_id || 0).filter(id => id > 0);
      } else {
        const optionId = qOptions[submittedAnswer]?.qo_id || 0;
        if (optionId > 0) {
          selectedValues = [optionId];
        }
      }

      if (selectedValues.length === 0) {
        console.warn('No valid option ID found');
        return false;
      }

      const savedAnswerValues = JSON.parse(sessionStorage.getItem('examAnswerValues') || '{}');
      savedAnswerValues[questionId] = selectedValues;
      sessionStorage.setItem('examAnswerValues', JSON.stringify(savedAnswerValues));

      console.log(`Storing and submitting answer for Q${questionId}:`, selectedValues);
    } catch (err) {
      console.error('Failed to process selected answer', err);
      return false;
    }

    const timeTakenSeconds = Math.floor((Date.now() - questionStartTime) / 1000);
    if (isNaN(timeTakenSeconds) || timeTakenSeconds < 0) {
      console.warn('Invalid time taken, using 0');
      return false;
    }

    const payload = {
      examId: examId,
      exam_question_id: questionId,
      submitted_answer: selectedValues,
      time_taken: timeTakenSeconds,
    };

    try {
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/question/submit`,
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
    const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';
    const answeredIds = Array.from(lockedQuestions);
    const pendingIds = questions.filter((qId) => !answeredIds.includes(qId));

    const payload = {
      examId: examId,
      is_timeout: isTimeout ? true : false,
      pending_questions: pendingIds,
    };

    try {
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/submit`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Bearer}`,
        },
        data: payload,
        method: 'POST',
      });

      if (response.data.result) {
        const seId = response.data.se_id || response.data.submission_id || response.data.data?.se_id;
        if (seId) {
          sessionStorage.setItem(`examResults_${seId}`, JSON.stringify(response.data.data || []));
          return { success: true, seId };
        } else {
          console.warn('Submission ID not found in response. Using examId as fallback:', examId);
          return { success: true, seId: examId }; // Fallback to examId
        }
      }
      console.log(response.data.message || 'Failed to submit exam.');
      return { success: false };
    } catch (err) {
      console.error('Error submitting exam:', err);
      throw new Error(err.message || 'Failed to submit exam');
    }
  };

  const formatTime = (seconds) => {
    const safeSeconds = isNaN(seconds) ? 0 : Math.max(0, seconds);
    const hrs = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex) => {
    const currentQId = questions[currentIndex];

    if (lockedQuestions.has(currentQId)) return;

    if (currentQuestion.answer_count > 1) {
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

    setMarkedReview((prev) => new Set([...prev, currentQId]));

    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      fetchQuestionDetails(questions[newIndex]);
    }
  };

  const goNext = async () => {
    const currentQId = questions[currentIndex];

    let saveSuccess = true;

    if (!lockedQuestions.has(currentQId) && responses[currentQId] !== undefined) {
      const success = await submitQuestions(currentQId);
      console.log('Submit question result for', currentQId, ':', success);

      if (success) {
        setLockedQuestions((prev) => new Set([...prev, currentQId]));
        setMarkedReview((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentQId);
          return newSet;
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: 'Failed to save your answer. Please try again.',
        });
        saveSuccess = false;
        return;
      }
    }

    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      fetchQuestionDetails(questions[newIndex]);
    } else if (saveSuccess) {
      handleSubmit();
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

  const handleSubmit = () => {
    const totalQuestions = questions.length;
    const answeredCount = lockedQuestions.size;

    if (answeredCount < totalQuestions) {
      Swal.fire({
        title: 'Incomplete Exam',
        text: `You have answered ${answeredCount} out of ${totalQuestions} questions. It is recommended to answer all questions before submitting. Are you sure you want to submit?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, submit anyway',
        cancelButtonText: 'Answer more questions'
      }).then((result) => {
        if (result.isConfirmed) {
          setShowModal(true);
        }
      });
    } else {
      setShowModal(true);
    }
  };

  const confirmSubmit = async () => {
    setShowModal(false);
    try {
      const result = await submitExam(false);
      console.log('Final exam submission result:', result);

      if (result.success) {
        sessionStorage.removeItem('examEndTime');
        clearExamData();
        Swal.fire({
          icon: 'success',
          title: 'Exam submitted successfully!',
          text: 'Results will be shared with you shortly',
          confirmButtonText: 'OK',
        }).then(() => {
          navigate(`/exam/result/${result.seId}`, { state: { submittedExamId: result.seId } });
        });
        console.log('Navigating to results page for submission ID:', result.seId);

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Please resolve issues and try again',
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
  const questionLines = Array.isArray(currentQuestion?.q_question) ? currentQuestion.q_question : [];
  const questionImages = currentQuestion?.questionImages || [];
  const isMultipleChoice = currentQuestion?.answer_count > 1;
  const saveNextButtonText = currentIndex === questions.length - 1 ? 'SAVE & SUBMIT' : 'SAVE & NEXT';

  if (loading) {
    return (
      <div className="exam-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (timeUp) {
    return (
      <div className="exam-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Time's Up!</h2>
        <p>Submitting your exam...</p>
      </div>
    );
  }

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
              <div className="question-text">
                {questionLines.map((line, idx) => (
                  <div
                    key={idx}
                    dangerouslySetInnerHTML={{ __html: line }}
                    style={{ margin: '0 0 10px 0', lineHeight: '1.6' }}
                  />
                ))}
              </div>
              {questionImages.length > 0 && (
                <div className="image-panel">
                  <div className="image-watermark-inside">www.drlifeboat.com</div>
                  {questionImages.map((imgPath, idx) => (
                    <img key={idx} src={`${baseurl}${imgPath}`} alt={`Exam Question ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }} />
                  ))}
                </div>
              )}
              {!questionImages.length > 0 && (
                <div className="image-panel">
                  <div className="image-watermark">www.drlifeboat.com</div>
                </div>
              )}
              <div className="options">
                {currentQuestion?.q_options?.map((opt, idx) => {
                  const currentQId = questions[currentIndex];
                  const selected = responses[currentQId];
                  const isChecked =
                    isMultipleChoice
                      ? selected?.includes(idx)
                      : selected === idx;

                  return (
                    <label key={idx} className="option">
                      <input
                        type={isMultipleChoice ? 'checkbox' : 'radio'}
                        name={`answer-${currentIndex}`}
                        checked={!!isChecked}
                        onChange={() => handleOptionSelect(idx)}
                      />
                      <span>
                        {String.fromCharCode(65 + idx)}) {opt.qo_option}
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
                {saveNextButtonText}
              </button>
            </div>
            {/* <div className="navigation">
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
            </div> */}
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
