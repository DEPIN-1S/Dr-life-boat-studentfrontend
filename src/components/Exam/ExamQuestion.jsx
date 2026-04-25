// ExamQuestion.jsx
import React, { useEffect, useState, useRef } from 'react';
import './ExamQuestion.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { CSpinner } from '@coreui/react';
import AdaptiveExam from '../../util/exam'; // updated class filename
import { useOfflineManager } from '../../hooks/useOfflineManager';
import { secureStorage } from '../../utils/secureStorage';
import { API_BASE_URL } from '../../utils/apiConfig';
import { getImageUrl } from '../../utils/imageUrl';

const ExamQuestion = () => {
  const navigate = useNavigate();
  const { examId: paramExamId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { safeSubmit, isOnline } = useOfflineManager(`${API_BASE_URL}/drlifeboat/student/exam/question/submit`);
  const stateExam = location?.state || secureStorage.getItem('currentExam') || {};
  const examId = stateExam?.ex_id;
  const examMinutes = stateExam?.ex_duration || 0;
  const [lockedQuestions, setLockedQuestions] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [markedReview, setMarkedReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(examMinutes * 60 || 0);
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState([]); // flat array of question_ids for palette
  const [currentQuestion, setCurrentQuestion] = useState(null); // full question data fetched from API
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeUp, setTimeUp] = useState(false);
  const timerRef = useRef(null);
  const endTimeRef = useRef(null);
  const [adaptiveExam, setAdaptiveExam] = useState(null);
  const [allQuestionsData, setAllQuestionsData] = useState([]); // original list of { question_id, difficulty_level }

  // BASE URL helper
  const baseUrl = API_BASE_URL;
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!examId) {
      Swal.fire('Error', 'Invalid exam access', 'error').then(() => navigate('/exam'));
      return;
    }

    // restore saved small state (responses/locked/marked)
    // restore saved small state (responses/locked/marked)
    const savedResponses = secureStorage.getItem('examResponses');
    const savedLocked = secureStorage.getItem('lockedQuestions');
    const savedMarked = secureStorage.getItem('markedReview');
    if (savedResponses) setResponses(savedResponses);
    if (savedLocked) setLockedQuestions(new Set(savedLocked));
    if (savedMarked) setMarkedReview(new Set(savedMarked));

    // timer logic (unchanged)
    const EXAM_START_KEY = `examStartTime_${examId}`;
    let examStartTime = parseInt(localStorage.getItem(EXAM_START_KEY) || '0');
    if (!examStartTime || isNaN(examStartTime)) {
      examStartTime = Date.now();
      localStorage.setItem(EXAM_START_KEY, examStartTime.toString());
    }
    if (!examMinutes || examMinutes <= 0) {
      console.error("Invalid exam duration:", examMinutes);
      Swal.fire('Error', 'Exam duration data is missing. Please restart the exam.', 'error').then(() => navigate('/exam'));
      return;
    }
    const totalMs = examMinutes * 60 * 1000;
    const endTime = examStartTime + totalMs;
    endTimeRef.current = endTime;
    const timeLeftNow = Math.floor((endTime - Date.now()) / 1000);
    if (timeLeftNow <= 0) {
      setTimeLeft(0);
      setTimeUp(true);
      handleTimeout();
      return;
    }
    setTimeLeft(timeLeftNow);

    // LOAD adaptive state (either from localStorage or fresh from API)
    loadAdaptiveState();

    // Browser close / reload protection
    const handleBeforeUnload = (e) => {
      // Attempt to save state or blocking alert
      e.preventDefault();
      e.returnValue = ''; // trigger browser confirmation
      // Best-effort silent submit via Beacon if truly closing (hard to distinguish from refresh, but safer)
      // Note: We can't easily distinguish refresh vs close here reliably to force submit,
      // but we can ensure we save state.
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Visibility change handling (optional fallback)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // could sync time here if needed
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) {
        timerRef.current.terminate(); // Terminate worker
        timerRef.current = null;
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, navigate, examMinutes]);

  // Separate effect for Timer Worker initialization to avoid re-creating on every render
  useEffect(() => {
    if (!examId) return;

    const EXAM_START_KEY = `examStartTime_${examId}`;
    let examStartTime = parseInt(secureStorage.getItem(EXAM_START_KEY) || '0');
    if (!examStartTime || isNaN(examStartTime)) {
      examStartTime = Date.now();
      secureStorage.setItem(EXAM_START_KEY, examStartTime.toString());
    }
    const totalMs = examMinutes * 60 * 1000;
    const endTime = examStartTime + totalMs;
    endTimeRef.current = endTime;

    // Calculate initial timeLeft
    const syncTime = () => {
      if (!window.navigator.onLine) return true; // Freeze timer if offline

      const now = Date.now();
      const diff = Math.floor((endTimeRef.current - now) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        setTimeUp(true);
        handleTimeout();
        return false; // active = false
      }
      setTimeLeft(diff);
      return true;
    };

    // Initial sync
    if (!syncTime()) return;

    // Start Worker
    if (!timerRef.current) {
      timerRef.current = new Worker(new URL('./examTimer.worker.js', import.meta.url));
      timerRef.current.onmessage = (e) => {
        if (e.data === 'tick') {
          // Re-calculate from Date.now() for accuracy (worker just triggers the check)
          syncTime();
        }
      };
      timerRef.current.postMessage('start');
    }

    return () => {
      // worker cleanup is in the main mount effect or here if we want strictly scoped
    };
  }, [examId, examMinutes]);

  // Missing handleTimeout definition
  const isSubmittingRef = useRef(false);

  const handleTimeout = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Clear any workers
    if (timerRef.current) {
      timerRef.current.postMessage('stop');
      timerRef.current.terminate();
    }

    setTimeUp(true);

    // Auto-submit logic
    try {
      await submitExam(true); // true = isTimeout

      // Clean up local data
      secureStorage.removeItem(`adaptive_list_${examId}`);
      secureStorage.removeItem(`adaptive_state_${examId}`);
      secureStorage.removeItem(`examStartTime_${examId}`);
      clearExamData();

      Swal.fire({
        icon: 'info',
        title: 'Time is up!',
        text: 'Your exam has been submitted automatically.',
        confirmButtonText: 'View Results',
        allowOutsideClick: false
      }).then(() => {
        // We don't have the result ID easily here unless submitExam returns it. 
        // submitExam saves to sessionStorage logic.
        // We'll redirect to a generic result page or home if ID missing.
        navigate('/exam');
      });
    } catch (error) {
      console.error("Auto-submit failed", error);
      Swal.fire('Error', 'Auto-submission encountered an issue. Please contact support.', 'error');
    }
  };


  // persist simple UI state
  useEffect(() => {
    secureStorage.setItem('examResponses', responses);
    secureStorage.setItem('lockedQuestions', [...lockedQuestions]);
    secureStorage.setItem('markedReview', [...markedReview]);
  }, [responses, lockedQuestions, markedReview]);

  // --- New: loadAdaptiveState combines reading /student/exam/data and localStorage resume ---
  const loadAdaptiveState = async () => {
    try {
      // check saved adaptive state first
      const savedListKey = `adaptive_list_${examId}`;
      const savedStateKey = `adaptive_state_${examId}`;
      const savedListJson = secureStorage.getItem(savedListKey);
      const savedStateJson = secureStorage.getItem(savedStateKey);

      let listData;
      if (savedListJson) {
        listData = savedListJson;
      } else {
        // fetch /student/exam/data
        const res = await axios({
          url: `${baseUrl}/drlifeboat/student/exam/data`,
          method: 'POST',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          data: { examId: parseInt(examId) },
        });

        if (!res.data?.result) {
          setFetchError(res.data?.message || 'Failed to fetch question list');
          setLoading(false);
          return;
        }
        listData = res.data.data || [];
        // save list
        // save list
        secureStorage.setItem(savedListKey, listData);
      }

      setAllQuestionsData(listData);
      // create flat palette questions array (ids)
      const flatIds = listData.map(it => it.question_id);
      setQuestions(flatIds);

      // If saved adaptive state exists -> resume engine from it
      if (savedStateJson) {
        const savedState = savedStateJson;
        const engine = AdaptiveExam.from(listData, savedState);
        setAdaptiveExam(engine);

        // If there's a currentQuestionId in saved state -> fetch its details
        if (savedState.currentQuestionId) {
          await fetchQuestionDetails(savedState.currentQuestionId);
          // set currentIndex to where this id appears in original flatIds if found
          const idx = flatIds.findIndex(id => id === savedState.currentQuestionId);
          if (idx !== -1) setCurrentIndex(idx);
        } else {
          // no currentQuestionId saved, ask engine for next
          const next = engine.getNextQuestion(null);
          if (next) {
            secureStorage.setItem(savedStateKey, engine.serialize());
            fetchQuestionDetails(next.question_id);
            const idx = flatIds.findIndex(id => id === next.question_id);
            if (idx !== -1) setCurrentIndex(idx);
          } else {
            setFetchError('No questions available to start the exam.');
          }
        }
      } else {
        // Fresh start: create engine from listData (start at min level automatically)
        const engine = AdaptiveExam.from(listData, null);
        setAdaptiveExam(engine);
        // pick first
        const first = engine.getNextQuestion(null);
        if (first) {
          // save state and list
          // save state and list
          secureStorage.setItem(savedListKey, listData);
          secureStorage.setItem(savedStateKey, engine.serialize());
          fetchQuestionDetails(first.question_id);
          const idx = flatIds.findIndex(id => id === first.question_id);
          if (idx !== -1) setCurrentIndex(idx);
        } else {
          setFetchError('No questions available to start the exam.');
        }
      }
    } catch (err) {
      console.error('loadAdaptiveState error:', err);
      setFetchError('Failed to load questions. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (qId) => (lockedQuestions.has(qId) ? 'green' : markedReview.has(qId) ? 'blue' : 'gray');


  // const fetchQuestionDetails = async (questionId) => {
  //   try {
  //     const res = await axios({
  //       url: `${baseUrl}/drlifeboat/student/exam/question`,
  //       method: 'POST',
  //       headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  //       data: { examId, exam_question_id: questionId },
  //     });

  //     if (res.data?.result) {
  //       let q = res.data.data;

  //       // Normalize q_question
  //       if (!Array.isArray(q.q_question)) {
  //         q.q_question = typeof q.q_question === 'string' ? [q.q_question] : [];
  //       }

  //       // CRITICAL FIX: Support both old and new image fields
  //       let imagePaths = [];

  //       // Method 1: Old way (string)
  //       if (q.question_images) {
  //         imagePaths = q.question_images
  //           .split(',')
  //           .map(s => s.trim())
  //           .filter(Boolean);
  //       }

  //       // Method 2: New way (array of objects) → PRIORITY
  //       if (Array.isArray(q.q_question_image) && q.q_question_image.length > 0) {
  //         imagePaths = q.q_question_image
  //           .map(img => img.qi_file)
  //           .filter(Boolean);
  //       }

  //       // Optional: fallback to explanation/ruleout images if needed (rare)
  //       // if (imagePaths.length === 0 && q.q_explanation_image?.length) { ... }

  //       const qid = q.id || q.eq_id || q.exam_question_id || questionId;

  //       setCurrentQuestion({
  //         ...q,
  //         id: qid,
  //         questionImages: imagePaths, // This will now work perfectly
  //       });

  //       window.scrollTo({ top: 0, behavior: 'smooth' });
  //       setQuestionStartTime(Date.now());
  //     }
  //   } catch (err) {
  //     console.error('Error fetching question:', err);
  //     Swal.fire('Error', 'Failed to load question.', 'error');
  //   }
  // };
  const fetchQuestionDetails = async (questionId) => {
    if (!questionId) return;

    try {
      const res = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/question`,
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        data: { examId, exam_question_id: questionId },
      });

      // SUCCESS: Fresh question
      if (res.data?.result && res.data.data) {
        const q = res.data.data;

        // Normalize question text
        if (!Array.isArray(q.q_question)) {
          q.q_question = typeof q.q_question === 'string' ? [q.q_question] : [];
        }

        // Handle images (both old and new formats)
        let imagePaths = [];
        if (q.question_images) {
          imagePaths = q.question_images.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (Array.isArray(q.q_question_image) && q.q_question_image.length > 0) {
          imagePaths = q.q_question_image.map(img => img.qi_file).filter(Boolean);
        }

        const qid = q.id || q.eq_id || q.exam_question_id || questionId;

        setCurrentQuestion({
          ...q,
          id: qid,
          questionImages: imagePaths,
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        setQuestionStartTime(Date.now());
        return true;
      }

      // ALREADY ANSWERED → Skip this question, get next one
      if (res.data?.message?.includes("already submitted") ||
        res.data?.message?.toLowerCase().includes("already")) {

        console.log(`Question ${questionId} already answered. Skipping to next...`);

        // Mark as answered locally
        setLockedQuestions(prev => new Set([...prev, questionId]));

        // Ask adaptive engine for next question
        const nextObj = adaptiveExam.getNextQuestion() || adaptiveExam.submitAnswer(null);

        if (nextObj?.question_id) {
          // Save updated engine state
          secureStorage.setItem(`adaptive_state_${examId}`, adaptiveExam.serialize());

          // Load next question
          fetchQuestionDetails(nextObj.question_id);
          const idx = questions.findIndex(q => q === nextObj.question_id);
          if (idx !== -1) setCurrentIndex(idx);
        } else {
          // No more questions → exam complete
          console.log("All questions answered or no more available.");
          setShowModal(true); // Trigger final submit
        }
        return false;
      }

      // Any other error
      console.warn("Unknown response:", res.data);
      Swal.fire('Error', res.data?.message || 'Failed to load question', 'error');

    } catch (err) {
      console.error('fetchQuestionDetails error:', err);

      // Network or unexpected error → try next question as fallback?
      if (err.response?.data?.message?.includes("already submitted")) {
        // Same handling as above
        setLockedQuestions(prev => new Set([...prev, questionId]));
        const nextObj = adaptiveExam.getNextQuestion();
        if (nextObj) {
          fetchQuestionDetails(nextObj.question_id);
        } else {
          setShowModal(true);
        }
      } else {
        Swal.fire('Error', 'Failed to load question. Please try again.', 'error');
      }
    }
  };

  const submitQuestions = async (questionId) => {
    const submittedAnswer = responses[questionId];
    if (submittedAnswer === undefined) {
      console.warn(`No answer selected for question ${questionId}`);
      return false;
    }

    // Prevent double submission
    if (lockedQuestions.has(questionId)) {
      console.log(`Question ${questionId} already submitted. Skipping.`);
      return true; // Treat as success — already locked
    }

    let selectedValues = [];
    try {
      const qOptions = currentQuestion?.q_options || [];
      if (currentQuestion.answer_count > 1) {
        selectedValues = (submittedAnswer || []).map(idx => qOptions[idx]?.qo_id).filter(Boolean);
      } else {
        const optId = qOptions[submittedAnswer]?.qo_id;
        if (optId) selectedValues = [optId];
      }
      if (selectedValues.length === 0) {
        console.warn('No valid option ID found');
        return false;
      }

      const savedAnswerValues = secureStorage.getItem('examAnswerValues') || {};
      savedAnswerValues[questionId] = selectedValues;
      secureStorage.setItem('examAnswerValues', savedAnswerValues);
    } catch (err) {
      console.error('Failed to process answer:', err);
      return false;
    }

    const timeTakenSeconds = Math.floor((Date.now() - questionStartTime) / 1000);

    const payload = {
      examId: examId,
      exam_question_id: questionId,
      submitted_answer: selectedValues,
      time_taken: timeTakenSeconds,
    };

    try {
      // Use useOfflineManager's safeSubmit instead of direct axios
      const result = await safeSubmit(payload);

      if (result.success) {
        // CASE 1: Online & Success
        if (result.response?.data?.result) {
          const isCorrect = result.response.data.is_correct === true;

          // Let engine decide next question
          const nextObj = adaptiveExam.submitAnswer(isCorrect);

          // Save engine state
          secureStorage.setItem(`adaptive_state_${examId}`, adaptiveExam.serialize());

          if (nextObj) {
            fetchQuestionDetails(nextObj.question_id);
            const idx = questions.findIndex(q => q === nextObj.question_id);
            if (idx !== -1) setCurrentIndex(idx);
          } else {
            // Exam is complete
            setShowModal(true);
          }
          return true;
        }

        // CASE 2: Offline & Queued (queued: true)
        else if (result.queued) {
          console.log("Offline mode: Answer queued.");
          // For adaptive exams, we CANNOT proceed to the next question because we need 'isCorrect' from server to determine difficulty.

          // Lock the current question to prevent changes
          setLockedQuestions(prev => new Set([...prev, questionId]));

          // Notify user
          Swal.fire({
            icon: 'info',
            title: 'Saved Offline',
            text: 'Your answer has been saved securely. Please reconnect to proceed (Adaptive Mode requires internet).',
            confirmButtonText: 'OK'
          });

          return true;
        }

        // CASE 3: Online but Server Error (e.g. "already submitted")
        else if (result.response?.data?.message?.includes("already submitted")) {
          console.log("Answer already submitted. Treating as success.");
          setLockedQuestions(prev => new Set([...prev, questionId]));

          if (adaptiveExam) {
            const nextObj = adaptiveExam.getNextQuestion();
            if (nextObj) {
              fetchQuestionDetails(nextObj.question_id);
              const idx = questions.findIndex(q => q === nextObj.question_id);
              if (idx !== -1) setCurrentIndex(idx);
            } else {
              setShowModal(true);
            }
          } else {
            // Reload logic if engine missing
            loadAdaptiveState();
          }
          return true;
        }
        else {
          Swal.fire('Error', result.response?.data?.message || 'Failed to submit answer', 'error');
          return false;
        }
      } else {
        // CASE 4: Critical Local Failure
        Swal.fire('Error', 'Critical: Could not save answer locally.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Submit error:', err);
      Swal.fire('Error', 'An unexpected error occurred.', 'error');
      return false;
    }

  };

  const submitExam = async (isTimeout) => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = API_BASE_URL;
    const answeredIds = Array.from(lockedQuestions);
    const pendingIds = questions.filter((qId) => !answeredIds.includes(qId));
    const payload = { examId, is_timeout: isTimeout, pending_questions: pendingIds };

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
      console.error('Exam submit error:', err);
      throw err;
    }
  };

  const formatTime = (seconds) => {
    const safeSeconds = isNaN(seconds) ? 0 : Math.max(0, seconds);
    const hrs = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- handle option selection (no change) ---
  const handleOptionSelect = (optionIndex) => {
    const currentQId = currentQuestion?.id || questions[currentIndex];
    if (!currentQId) return;
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

  // --- goNext: save answer then mark locked and let engine load next (keeps your behaviour) ---
  const goNext = async () => {
    const currentQId = currentQuestion?.id || questions[currentIndex];
    const hasAnswer = responses[currentQId] !== undefined;
    const isLocked = lockedQuestions.has(currentQId);

    // If not locked and has an answer => submit
    if (!isLocked && hasAnswer) {
      setLoading(true);
      const success = await submitQuestions(currentQId);
      setLoading(false);

      if (!success) {
        Swal.fire('Error', 'Failed to save answer. Try again.', 'error');
        return;
      }

      // Mark answered (locked)
      setLockedQuestions(prev => new Set([...prev, currentQId]));
      setMarkedReview(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentQId);
        return newSet;
      });
    } else if (!hasAnswer && !isLocked) {
      // If no answer and there are no further questions (engine empty) -> force answer modal
      const peek = adaptiveExam?.getNextQuestion(); // just to know if none left
      if (!peek) {
        Swal.fire('Answer Required', 'Please answer this question before submitting the exam.', 'warning');
        return;
      }
    }

    // If engine already advanced inside submitQuestions, the currentQuestion has been updated by submitQuestions
    // Otherwise try to get next by peeking
    if (currentQuestion == null || !adaptiveExam) return;

    // Nothing else to do here: submitQuestions already fetched next question and updated state
  };

  // --- rest of your existing functions (submitExam, handleMarkForReview, navigation etc.) remain unchanged ---
  const handleMarkForReview = () => {
    const currentQId = questions[currentIndex];

    setMarkedReview((prev) => new Set([...prev, currentQId]));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      fetchQuestionDetails(questions[currentIndex + 1]);
    }
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

  // const confirmSubmit = async () => {
  //   setShowModal(false);
  //   try {
  //     const result = await submitExam(false);
  //     if (result.success) {
  //       localStorage.removeItem('examEndTime');
  //       // clear adaptive localstorage keys too:
  //       localStorage.removeItem(`adaptive_list_${examId}`);
  //       localStorage.removeItem(`adaptive_state_${examId}`);
  //       clearExamData();
  //       Swal.fire({ icon: 'success', title: 'Exam submitted!', text: 'Redirecting...' }).then(() => {
  //         navigate(`/exam/result/${result.seId}`, { state: { submittedExamId: result.seId } });
  //       });
  //     } else {
  //       Swal.fire({ icon: 'error', title: 'Submission Failed', text: 'Please resolve issues and try again' });
  //     }
  //   } catch (err) {
  //     Swal.fire({ icon: 'error', title: 'Error', text: err.message });
  //   }
  // };

  const confirmSubmit = async () => {
    setShowModal(false);
    setLoading(true);
    try {
      const result = await submitExam(false);

      if (result.success) {
        // Mark this exam as completed locally (optional fallback)
        const completedExams = secureStorage.getItem('completedExams') || [];
        if (!completedExams.includes(examId)) {
          completedExams.push(examId);
          secureStorage.setItem('completedExams', completedExams);
        }

        // Clear ALL adaptive + exam state
        secureStorage.removeItem(`adaptive_list_${examId}`);
        secureStorage.removeItem(`adaptive_state_${examId}`);
        secureStorage.removeItem(`examStartTime_${examId}`);
        clearExamData();

        Swal.fire({
          icon: 'success',
          title: 'Exam Submitted Successfully!',
          text: 'Taking you to results...',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate(`/exam/result/${result.seId}`, { state: { submittedExamId: result.seId } });
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      console.error("Final submission error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Your answers may be saved, but final submission failed. Please contact support.',
      });
    } finally {
      setLoading(false);
    }
  };


  const clearExamData = () => {
    secureStorage.removeItem('examResponses');
    secureStorage.removeItem('lockedQuestions');
    secureStorage.removeItem('markedReview');
    secureStorage.removeItem('examEndTime');
    secureStorage.removeItem(`examStartTime_${examId}`);
    secureStorage.removeItem('currentExamId');
    secureStorage.removeItem('examAnswerValues');
    secureStorage.removeItem('currentExam');
    secureStorage.removeItem(`adaptive_list_${examId}`);
    secureStorage.removeItem(`adaptive_state_${examId}`);
  };

  // rest of rendering logic remains mostly same (I preserved your UI, timer, palette etc.)
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

  if (fetchError) {
    return (
      <div className="exam-container" style={{ textAlign: 'center', padding: '50px', color: '#dc3545' }}>
        <p>{fetchError}</p>
        <button onClick={() => loadAdaptiveState()} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>Retry</button>
        <button onClick={() => navigate('/exam')} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', marginLeft: '10px' }}>Back</button>
      </div>
    );
  }

  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="exam-container" style={{ textAlign: 'center', padding: '50px', color: '#6c757d' }}>
        <p>No questions available.</p>
        <button style={{ border: "20px", color: "blue", textAlign: 'center' }} onClick={() => navigate('/exam')}>Back to Exams</button>
      </div>
    );
  }




  return (
    <>
      {/* Offline Overlay */}
      {!isOnline && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>⚠️ CONNECTION LOST</h1>
          <h3>Exam Paused</h3>
          <p>Your timer has been stopped to preserve your time.</p>
          <p>Please check your internet connection.</p>
          <div className="spinner-border text-light" role="status" style={{ marginTop: '20px' }}>
            <span className="sr-only">Reconnecting...</span>
          </div>
        </div>
      )}

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
                    <img key={idx} src={getImageUrl(imgPath)} alt={`Exam Question ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }} />
                  ))}
                </div>
              )}

              {/* <div className="options">
                {currentQuestion.q_options?.map((opt, idx) => {
                  const currentQId = currentQuestion.id;
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
                        disabled={lockedQuestions.has(currentQId)}
                      />
                      <span>
                        {String.fromCharCode(65 + idx)}) {opt.qo_option}
                      </span>
                    </label>
                  );
                })}
              </div> */}
              {/* new */}

              <div className="options">
                {currentQuestion.q_options?.map((opt, idx) => {
                  const currentQId = currentQuestion.id;
                  const selected = responses[currentQId];
                  const isChecked = isMultipleChoice
                    ? Array.isArray(selected) && selected.includes(idx)
                    : selected === idx;

                  const hasOptionImage = opt.qo_image && opt.qo_image.trim() !== '';

                  return (
                    <label
                      key={opt.qo_id || idx}
                      className={`option ${hasOptionImage ? 'has-image' : ''} ${isChecked ? 'selected' : ''}`}
                    >
                      <input
                        type={isMultipleChoice ? 'checkbox' : 'radio'}
                        name={`answer-${currentIndex}`}
                        checked={!!isChecked}
                        onChange={() => handleOptionSelect(idx)}
                        disabled={lockedQuestions.has(currentQId)}
                      />
                      <div className="option-content">
                        <span className="option-letter">
                          {String.fromCharCode(65 + idx)})
                        </span>
                        <div className="option-body">
                          <span
                            className="option-text"
                            dangerouslySetInnerHTML={{ __html: opt.qo_option }}
                          />
                          {hasOptionImage && (
                            <div className="option-image-container">
                              <img
                                src={getImageUrl(opt.qo_image)}
                                alt={`Option ${String.fromCharCode(65 + idx)}`}
                                className="option-image"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="fixed-action-buttons">
              <button className="mark-review" onClick={handleMarkForReview} disabled={lockedQuestions.has(questions[currentIndex])}>
                MARK FOR REVIEW & NEXT
              </button>
              <button className="save-next" onClick={goNext}>
                {saveNextButtonText}
              </button>
            </div>

          </div>

          <div className="image-panel-divider" />
          <div className="status-panel">
            <div className="legend">
              <p className="legend-para"><span className="box gray" /> Total Questions<span>{totalQuestions}</span></p>
              <p className="legend-para"><span className="box gray" /> Not Visited <span>{notVisitedCount}</span></p>
              <p className="legend-para"><span className="box green" /> Answered <span>{answeredCount}</span></p>
              <p className="legend-para"><span className="box blue" /> Mark for review <span>{reviewCount}</span></p>
            </div>

            <div className="scrollable-grid">
              <div className="number-grid">
                {questions.map((qId, i) => (
                  <div
                    key={qId}
                    className={`number-box ${getStatusClass(qId)} ${currentQuestion?.id === qId ? 'active' : ''}`}
                    onClick={() => {
                      const q = allQuestionsData.find(q => q.question_id === qId);
                      if (q) {
                        fetchQuestionDetails(qId);
                        setCurrentIndex(i);
                      }
                    }}
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
          <p>Are you sure? <b>No changes after submission.</b></p>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="confirm-btn" onClick={confirmSubmit}>Yes, Submit</button>
          </div>
        </div>
      )}
    </>


  );
};

export default ExamQuestion;
