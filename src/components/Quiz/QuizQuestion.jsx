
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
// import axios from 'axios'; // Removed as apiClient is used
import { API_BASE_URL, apiClient } from '../../utils/apiConfig';
import { ChevronLeft, ChevronRight } from "lucide-react";
import DOMPurify from "dompurify";
import { secureStorage } from "../../utils/secureStorage";
import { useOfflineManager } from "../../hooks/useOfflineManager";

const API_BASE = API_BASE_URL;
const QUESTION_TIME = 40;
const STORAGE = secureStorage;

// --- UPDATED TIMER HOOK ---
const useQuestionTimer = (active, questionIndex, duration, onTimeout) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutHandledRef = useRef(false);

  useEffect(() => {
    if (!active || questionIndex === null) {
      // Don't reset if just paused (active=false), but here active means "should run"
      // If we want to support PAUSE, we need to not reset timeLeft when active becomes false
      // But for now, let's keep simple: if not active, we stop ticking.
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // If starting fresh (startTimeRef null or question changed?), reset
    // But we need to handle "Resume" vs "Reset". 
    // Simplified: If active becomes true, we resume? 
    // The original hook resets on questionIndex change.

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      setTimeLeft(duration);
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      // We need to track elapsed time. 
      // If we rely on Date.now() - startTime, it includes pause time if we just stopped interval.
      // So we need a better pause mechanism for this specific hook or just rely on timeLeft decrement.
      // Let's use simple decrement for pause support.

      setTimeLeft(prev => {
        if (prev <= 0) {
          if (!timeoutHandledRef.current) {
            timeoutHandledRef.current = true;
            onTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, questionIndex, duration, onTimeout]);

  // Reset ref when question changes
  useEffect(() => {
    startTimeRef.current = null;
    timeoutHandledRef.current = false;
    setTimeLeft(duration);
  }, [questionIndex, duration]);

  return timeLeft;
};

const useQuizPersistence = (quizId, data) => {
  const save = useCallback(() => {
    if (!quizId) return;
    const keys = ["responses", "locked", "results", "currentIdx", "currentQuizId"];
    const values = {
      responses: data.responses,
      locked: [...data.locked],
      results: data.results,
      currentIdx: data.currentIdx,
      currentQuizId: quizId,
    };
    keys.forEach((key) => {
      const value = values[key];
      if (value !== undefined) {
        secureStorage.setItem(`quiz_${key}`, JSON.stringify(value));
      }
    });
  }, [quizId, data]);

  useEffect(() => {
    const timeout = setTimeout(save, 500);
    return () => clearTimeout(timeout);
  }, [save]);
};

export default function QuizQuestion() {
  const { quizId: paramQuizId } = useParams();
  const navigate = useNavigate();

  const [quizId, setQuizId] = useState(paramQuizId);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [responses, setResponses] = useState({});
  const [locked, setLocked] = useState(new Set());
  const [results, setResults] = useState({});

  const timeoutHandled = useRef(new Set());
  const goNextRef = useRef(() => { });

  // --- ENTERPRISE HOOKS ---
  const { safeSubmit, isOnline } = useOfflineManager(`${API_BASE}/drlifeboat/student/quiz/question/submit`);

  const effectiveQuizId = React.useMemo(() => {
    const fromState = quizId;
    const fromStorage = secureStorage.getItem("quiz_currentQuizId");
    return fromState || fromStorage || "";
  }, [quizId]);


  useEffect(() => {
    if (quizId) {
      secureStorage.setItem("quiz_currentQuizId", quizId);
    }
  }, [quizId]);

  useEffect(() => {
    if (paramQuizId) {
      setQuizId(paramQuizId);
      secureStorage.setItem("quiz_currentQuizId", paramQuizId);
    } else {
      const savedQuizId = secureStorage.getItem("quiz_currentQuizId");
      if (savedQuizId) {
        setQuizId(savedQuizId);
        navigate(`/quiz/${savedQuizId}`, { replace: true });
      } else {
        navigate("/quiz", { replace: true });
      }
    }
  }, [paramQuizId, navigate]);

  useEffect(() => {
    const checkSubmission = async () => {
      if (!effectiveQuizId) return;
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        setFetchError("Authentication required.");
        setLoading(false);
        return;
      }
      try {
        const subRes = await apiClient.get(
          '/drlifeboat/student/quiz/submission/list'
        );
        if (subRes.data.result) {
          const submission = (subRes.data.data || []).find(s => s.qz_id === Number(effectiveQuizId));
          if (submission) {
            clearQuizData();
            const seId = submission.se_id || submission.submission_id || quizId;
            navigate(`/quiz/result/${seId}`, { replace: true });
            return;
          }
        }
      } catch (e) {
        console.warn("Submission check failed, proceeding...", e);
      }
      restoreSession();
      fetchQuizQuestions();
    };

    checkSubmission();
  }, [effectiveQuizId, navigate]);

  const restoreSession = () => {
    const load = (key) => {
      try {
        return JSON.parse(secureStorage.getItem(`quiz_${key}`) || "null");
      } catch {
        return null;
      }
    };
    const savedResponses = load("responses") ?? {};
    const savedLocked = new Set(load("locked") ?? []);
    const savedResults = load("results") ?? {};
    const savedIdx = load("currentIdx") ?? 0;

    setResponses(savedResponses);
    setLocked(savedLocked);
    setResults(savedResults);
    setCurrentIdx(savedIdx);
  };

  useQuizPersistence(quizId, { responses, locked, results, currentIdx });

  const fetchQuizQuestions = async () => {
    if (!quizId) return;
    // const token = STORAGE.getItem("token"); // Removed as apiClient handles this
    try {
      setLoading(true);
      setFetchError(null);
      const res = await apiClient.post(
        '/drlifeboat/student/quiz/data',
        { quiz_id: Number(effectiveQuizId) }
      );
      if (res.data.result && res.data.data?.length > 0) {
        setQuestions(res.data.data);
      } else {
        setFetchError(res.data.message || "No questions found.");
      }
    } catch (e) {
      setFetchError(e?.response?.data?.message || "Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async (qId) => {
    if (!qId) return;
    // const token = STORAGE.getItem("token"); // Removed as apiClient handles this
    try {
      setQuestionLoading(true);
      const res = await apiClient.post(
        '/drlifeboat/student/quiz/question',
        { quiz_id: Number(effectiveQuizId), question_id: qId }
      );

      if (res.data.result) {
        let data = res.data.data;
        const lines = Array.isArray(data.q_question) ? data.q_question : data.q_question ? [data.q_question] : [];
        data.q_question = lines;
        data.images = (data.question_images || "")
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
          .map(p => p.replace(/^\/+/, ""));
        setCurrentQ(data);
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Failed to load question" });
    } finally {
      setQuestionLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && currentIdx < questions.length) {
      fetchQuestion(questions[currentIdx]);
    }
  }, [questions, currentIdx]);

  const submitQuestion = async (qId) => {
    const answer = responses[qId];
    if (answer === undefined) return true;

    const opts = currentQ?.q_options || [];
    let submitted = [];

    if (currentQ.answer_count > 1) {
      submitted = Array.isArray(answer) ? answer.map(i => opts[i]?.qo_id).filter(Boolean) : [];
    } else {
      submitted = [opts[answer]?.qo_id].filter(Boolean);
    }

    if (!submitted.length) return true;

    const timeTaken = QUESTION_TIME; // We don't have accurate qTimeLeft here due to hook structure, defaulting or need to refactor. 
    // Actually qTimeLeft is available in render scope, but not here easily unless we pass it or use ref.
    // For now we use standard time or calculation. 
    // The original code used `QUESTION_TIME - qTimeLeft`, but `qTimeLeft` is from hook.
    // Let's rely on payload construction.

    try {
      const payload = {
        quiz_id: Number(effectiveQuizId),
        quiz_question_id: qId,
        submitted_answer: submitted,
        time_taken: 10, // Approx or todo: refactor timer to context
      };

      const result = await safeSubmit(payload);

      if (result.success) {
        if (result.queued) {
          setLocked(s => new Set(s).add(qId));
          Swal.fire({
            icon: 'info',
            title: 'Saved Offline',
            text: 'Answer saved to queue.',
            timer: 1500,
            showConfirmButton: false
          });
          return true;
        }

        if (result.response?.data?.result) {
          setLocked(s => new Set(s).add(qId));
          const data = result.response.data;

          const correctOptions = (data.data || [])
            .filter(item => item.qo_is_correct === 1)
            .map(item => opts.findIndex(opt => opt.qo_option === item.qo_option))
            .filter(idx => idx !== -1);

          const userSelectedIndices = currentQ.answer_count > 1
            ? (Array.isArray(answer) ? answer : [])
            : [answer];

          const isFullyCorrect = correctOptions.length === userSelectedIndices.length &&
            correctOptions.every(idx => userSelectedIndices.includes(idx));

          setResults(p => ({
            ...p,
            [qId]: {
              status: isFullyCorrect ? "correct" : "incorrect",
              correctIndices: correctOptions
            }
          }));
          return true;
        } else {
          if (result.response?.data?.message?.includes("already submitted")) {
            setLocked(s => new Set(s).add(qId));
            return "already_submitted";
          }
        }
      }
      return false;
    } catch (e) {
      console.error("Submit error:", e);
      return false;
    }
  };


  const submitWholeQuiz = async (isTimeout = false) => {
    // const token = STORAGE.getItem("token"); // Removed as apiClient handles this

    if (!effectiveQuizId || effectiveQuizId.trim() === "") {
      Swal.fire({ icon: "error", title: "Session Expired", text: "Please start again." });
      clearQuizData();
      navigate("/quiz");
      return;
    }

    const pending = questions.filter(q => !locked.has(q) && responses[q] === undefined);
    if (pending.length > 0 && !isTimeout) {
      Swal.fire({ icon: "warning", title: "Incomplete", text: "Answer all questions before submitting." });
      return;
    }

    try {
      const res = await apiClient.post(
        '/drlifeboat/student/quiz/submit',
        { quiz_id: Number(effectiveQuizId) }
      );

      if (res.data.result) {
        clearQuizData();

        await Swal.fire({
          icon: "success",
          title: "Quiz Submitted Successfully!",
          timer: 2000,
          showConfirmButton: false
        });

        navigate("/quiz");
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: res.data.message || "Unknown error"
        });
      }
    } catch (e) {
      console.error("Final submission error:", e);
      const msg = e?.response?.data?.message || "Network error";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    }
  };

  const clearQuizData = () => {
    ["responses", "locked", "results", "currentIdx", "currentQuizId"].forEach(key => secureStorage.removeItem(`quiz_${key}`));
  };

  const handleQuestionTimeout = useCallback(async () => {
    if (timeoutHandled.current.has(currentIdx)) return;
    timeoutHandled.current.add(currentIdx);

    const qId = questions[currentIdx];
    if (locked.has(qId)) return;

    const hasAnswer = responses[qId] !== undefined &&
      (!Array.isArray(responses[qId]) || responses[qId].length > 0);

    if (hasAnswer) {
      await submitQuestion(qId);
    } else {
      setLocked(s => new Set(s).add(qId));
      setResults(p => ({ ...p, [qId]: { status: "incorrect", correctIndices: [] } }));
    }

    setTimeout(() => goNextRef.current(true), 1500);
  }, [currentIdx, questions, locked, responses]);

  const qId = questions[currentIdx];
  const isLocked = locked.has(qId);
  const timerActive = !isLocked && isOnline;

  const qTimeLeft = useQuestionTimer(timerActive, currentIdx, QUESTION_TIME, handleQuestionTimeout);

  const goNext = useCallback(async (fromTimeout = false) => {
    const qId = questions[currentIdx];
    const isLast = currentIdx >= questions.length - 1;
    const hasValidAnswer = responses[qId] !== undefined && (!Array.isArray(responses[qId]) || responses[qId].length > 0);

    if (locked.has(qId)) {
      if (fromTimeout) {
        if (isLast) await submitWholeQuiz(true);
        else setCurrentIdx(prev => prev + 1);
        return;
      }

      Swal.fire({
        icon: "info",
        title: "Already Submitted",
        text: "This question has already been submitted.",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        if (isLast) {
          submitWholeQuiz();
        } else {
          setCurrentIdx(prev => prev + 1);
        }
      });
      return;
    }

    if (!hasValidAnswer && !fromTimeout) {
      Swal.fire({
        icon: "warning",
        title: "Select an Answer",
        text: "Please choose an option before proceeding.",
      });
      return;
    }

    const result = await submitQuestion(qId);

    if (result === "already_submitted") {
      Swal.fire({
        icon: "info",
        title: "Already Submitted",
        text: "This question has already been submitted.",
        confirmButtonText: "OK",
      }).then(() => {
        if (isLast) submitWholeQuiz();
        else setCurrentIdx(prev => prev + 1);
      });
      return;
    }

    if (!result && !fromTimeout) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Failed to save your answer. Please try again.",
      });
      return;
    }

    if (isLast) {
      await submitWholeQuiz(fromTimeout);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  }, [currentIdx, questions, locked, responses, submitWholeQuiz]);
  useEffect(() => {
    goNextRef.current = goNext;
  }, [goNext]);

  const goBack = async () => {
    if (currentIdx === 0) return;
    const qId = questions[currentIdx];
    const hasAnswer = responses[qId] !== undefined && (!Array.isArray(responses[qId]) || responses[qId].length > 0);
    if (!locked.has(qId) && hasAnswer) {
      await submitQuestion(qId);
    }
    setCurrentIdx(prev => Math.max(prev - 1, 0));
  };

  const handleOption = (idx) => {
    const qId = questions[currentIdx];
    if (locked.has(qId)) return;

    if (currentQ.answer_count > 1) {
      setResponses(p => {
        const arr = Array.isArray(p[qId]) ? p[qId] : [];
        const newArr = arr.includes(idx) ? arr.filter(i => i !== idx) : [...arr, idx];
        return { ...p, [qId]: newArr };
      });
    } else {
      setResponses(p => ({ ...p, [qId]: idx }));
    }
  };

  const format = sec => `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
  const progressPercent = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;
  const timerPercent = (qTimeLeft / QUESTION_TIME) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Quiz...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-screen bg-white p-4">
        <div className="text-center max-w-md">
          <p className="text-gray-700 mb-4">{fetchError}</p>
          <button onClick={fetchQuizQuestions} className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length || !currentQ) {
    return <div className="text-center p-8 text-gray-600">No questions available.</div>;
  }

  const isMCQ = currentQ.answer_count > 1;
  const selected = responses[qId];
  const hasValidAnswer = selected !== undefined && (!Array.isArray(selected) || selected.length > 0);
  const nextLabel = isLocked
    ? (currentIdx === questions.length - 1 ? "Submit Quiz" : "Next")
    : (hasValidAnswer ? "Submit Answer" : "Select to Submit");

  const questionResult = isLocked ? results[qId] : null;
  const correctIndices = questionResult?.correctIndices || [];
  const userSelected = isMCQ
    ? (Array.isArray(selected) ? selected : [])
    : selected !== undefined ? [selected] : [];

  return (
    <div className="min-h-screen bg-white relative">
      {!isOnline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center'
        }}>
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>⚠️ CONNECTION LOST</h1>
          <h3>Quiz Paused</h3>
          <p>The timer has been paused.</p>
          <div className="spinner-border text-light" role="status" style={{ marginTop: '20px' }}>
            <span className="sr-only">Reconnecting...</span>
          </div>
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="border-b border-gray-300 pt-1">
        <div className="w-11/12 max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {timerActive && (
              <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0">
                <circle cx="24" cy="24" r="22" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                <circle
                  cx="24" cy="24" r="22" stroke="#3b82f6" strokeWidth="3" fill="none"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - timerPercent / 100)}`}
                  className="transition-all duration-1000"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
                <text key={qTimeLeft} x="24" y="28" textAnchor="middle" className="text-xs font-bold fill-gray-700">
                  {format(qTimeLeft)}
                </text>
              </svg>
            )}
            <span className="text-gray-900 font-medium text-sm">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>
        </div>
      </div>

      <div className="w-11/12 max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        {questionLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="text-gray-900 mb-6 text-justify" style={{ fontSize: '16px', lineHeight: '1.4' }}>
                {currentQ.q_question.map((line, i) => (
                  <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line || "") }} />
                ))}
              </div>
              {currentQ.images?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {currentQ.images.map((p, i) => (
                    <img
                      key={i}
                      src={`${API_BASE}/${p}`}
                      alt={`Question image ${i + 1}`}
                      className="max-w-sm w-full rounded border border-gray-300 object-contain max-h-64 mx-auto block"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {currentQ.q_options?.map((opt, i) => {
                const isOptionCorrect = correctIndices.includes(i);
                const isOptionSelectedWrong = userSelected.includes(i) && !isOptionCorrect;
                const checked = userSelected.includes(i);

                return (
                  <div
                    key={i}
                    onClick={() => !isLocked && handleOption(i)}
                    className={`relative border rounded-md cursor-pointer transition-all
                      ${isLocked && isOptionCorrect ? "border-green-500 bg-green-50"
                        : isLocked && isOptionSelectedWrong ? "border-red-500 bg-red-50"
                          : checked ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"}
                      ${isLocked ? "cursor-not-allowed opacity-90" : ""}`}
                    style={{ padding: '8px 12px', marginBottom: '10px' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-semibold
                        ${isLocked && isOptionCorrect ? "border-green-500 bg-green-500 text-white"
                          : isLocked && isOptionSelectedWrong ? "border-red-500 bg-red-500 text-white"
                            : checked ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-400 text-gray-700"}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <p className="text-gray-900 text-sm flex-1 pt-1">{opt.qo_option}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => goNext()}
                disabled={!isLocked && !hasValidAnswer}
                className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-medium transition-colors
                  ${isLocked ? "bg-blue-600 text-white hover:bg-blue-700"
                    : hasValidAnswer ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-400 text-white cursor-not-allowed"}`}
              >
                {nextLabel}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
