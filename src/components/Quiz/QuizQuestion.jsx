import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DOMPurify from "dompurify";

const API_BASE = import.meta.env.VITE_BASE_URL || "https://lunarsenterprises.com:6028";
const QUESTION_TIME = 40;
const STORAGE = sessionStorage;

// Timer Hook
const useQuestionTimer = (questionId, duration, onTimeout) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const startTimeRef = useRef(null);
  const timeoutHandledRef = useRef(false);

  useEffect(() => {
    if (!questionId) return;

    startTimeRef.current = Date.now();
    timeoutHandledRef.current = false;
    setTimeLeft(duration);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const left = Math.max(0, duration - elapsed);
      setTimeLeft(left);

      if (left === 0 && !timeoutHandledRef.current) {
        timeoutHandledRef.current = true;
        onTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [questionId, duration, onTimeout]);

  return timeLeft;
};

// Persistence Hook (debounced)
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

    keys.forEach((key, i) => {
      const value = values[key];
      if (value !== undefined) {
        STORAGE.setItem(`quiz_${key}`, JSON.stringify(value));
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

  // === 1. RESTORE QUIZ ID + REDIRECT IF NEEDED ===
  useEffect(() => {
    if (paramQuizId) {
      setQuizId(paramQuizId);
      STORAGE.setItem("quiz_currentQuizId", paramQuizId);
    } else {
      const savedQuizId = STORAGE.getItem("quiz_currentQuizId");
      if (savedQuizId) {
        setQuizId(savedQuizId);
        navigate(`/quiz/${savedQuizId}`, { replace: true });
      } else {
        navigate("/quiz", { replace: true });
      }
    }
  }, [paramQuizId, navigate]);

  // === 2. CHECK IF QUIZ IS ALREADY SUBMITTED ===
  useEffect(() => {
    const checkSubmission = async () => {
      if (!quizId) return;

      const token = STORAGE.getItem("token");
      if (!token) {
        setFetchError("Authentication required.");
        setLoading(false);
        return;
      }

      try {
        const subRes = await axios.get(
          `${API_BASE}/drlifeboat/student/quiz/submission/list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (subRes.data.result) {
          const submission = (subRes.data.data || []).find(s => s.qz_id === quizId);
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

      // Not submitted → load session + questions
      restoreSession();
      fetchQuizQuestions();
    };

    checkSubmission();
  }, [quizId, navigate]);

  // === 3. RESTORE SESSION FROM STORAGE ===
  const restoreSession = () => {
    const load = (key) => {
      try {
        return JSON.parse(STORAGE.getItem(`quiz_${key}`) || "null");
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

  // === 4. PERSISTENCE ===
  useQuizPersistence(quizId, {
    responses,
    locked,
    results,
    currentIdx,
  });

  // === 5. FETCH QUESTIONS ===
  const fetchQuizQuestions = async () => {
    if (!quizId) return;

    const token = STORAGE.getItem("token");
    try {
      setLoading(true);
      setFetchError(null);

      const res = await axios.post(
        `${API_BASE}/drlifeboat/student/quiz/data`,
        { quiz_id: quizId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.result && res.data.data?.length > 0) {
        setQuestions(res.data.data);
      } else {
        const msg = res.data.message || "No questions found.";
        setFetchError(msg);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load quiz.";
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  };

  // === 6. FETCH CURRENT QUESTION ===
  const fetchQuestion = async (qId) => {
    if (!qId) return;
    const token = STORAGE.getItem("token");
    try {
      setQuestionLoading(true);
      const res = await axios.post(
        `${API_BASE}/drlifeboat/student/quiz/question`,
        { quiz_id: quizId, question_id: qId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.result) {
        let data = res.data.data;

        const lines = Array.isArray(data.q_question)
          ? data.q_question
          : data.q_question ? [data.q_question] : [];
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

  // === 7. SUBMIT SINGLE QUESTION ===
  const submitQuestion = async (qId) => {
    const token = STORAGE.getItem("token");
    const answer = responses[qId];
    if (answer === undefined) return false;

    const opts = currentQ?.q_options || [];
    let submitted = [];

    if (currentQ.answer_count > 1) {
      if (Array.isArray(answer)) {
        submitted = answer.map(i => opts[i]?.qo_id).filter(Boolean);
      }
    } else {
      submitted = [opts[answer]?.qo_id].filter(Boolean);
    }

    if (!submitted.length) return false;

    const timeTaken = QUESTION_TIME - qTimeLeft;

    try {
      const res = await axios.post(
        `${API_BASE}/drlifeboat/student/quiz/question/submit`,
        {
          quiz_id: quizId,
          quiz_question_id: qId,
          submitted_answer: submitted,
          time_taken: timeTaken,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.result) {
        setLocked(s => new Set(s).add(qId));
        const correct = res.data.correct === true;
        setResults(p => ({ ...p, [qId]: correct ? "correct" : "incorrect" }));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // === 8. SUBMIT ENTIRE QUIZ ===
  const submitWholeQuiz = async (isTimeout = false) => {
    const token = STORAGE.getItem("token");

    const pending = questions.filter(q => !locked.has(q) && responses[q] === undefined);
    if (pending.length > 0 && !isTimeout) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete",
        text: "Answer all questions before submitting."
      });
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/drlifeboat/student/quiz/submission/data`,
        { quiz_id: quizId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.result) {
        clearQuizData();
        const seId = res.data.se_id || res.data.submission_id || quizId;

        Swal.fire({
          icon: "success",
          title: "Quiz Submitted!",
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate(`/quiz/result/${seId}`);
        });
      } else {
        Swal.fire({ icon: "error", title: "Failed", text: res.data.message });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: "Submission failed." });
    }
  };

  const clearQuizData = () => {
    [
      "responses",
      "locked",
      "results",
      "currentIdx",
      "currentQuizId",
    ].forEach(key => STORAGE.removeItem(`quiz_${key}`));
  };

  // === 9. TIMER & NAVIGATION ===
  const handleQuestionTimeout = async () => {
    const qId = questions[currentIdx];
    if (locked.has(qId) || timeoutHandled.current.has(qId)) return;
    timeoutHandled.current.add(qId);

    const hasAnswer = responses[qId] !== undefined &&
      (!Array.isArray(responses[qId]) || responses[qId].length > 0);

    if (hasAnswer) {
      await submitQuestion(qId);
    } else {
      setLocked(s => new Set(s).add(qId));
      setResults(p => ({ ...p, [qId]: "incorrect" }));
    }

    setTimeout(() => goNext(true), 1500);
  };

  const currentQId = questions[currentIdx];
  const qTimeLeft = useQuestionTimer(currentQId, QUESTION_TIME, handleQuestionTimeout);

  const goNext = async (fromTimeout = false) => {
    const qId = questions[currentIdx];
    const answer = responses[qId];
    const isLast = currentIdx >= questions.length - 1;

    const hasValidAnswer = answer !== undefined &&
      (!Array.isArray(answer) || answer.length > 0);

    if (!locked.has(qId) && hasValidAnswer) {
      const success = await submitQuestion(qId);
      if (!success && !fromTimeout) {
        Swal.fire({ icon: "error", title: "Save failed. Try again." });
        return;
      }
    } else if (!hasValidAnswer && !fromTimeout && !locked.has(qId)) {
      Swal.fire({ icon: "warning", title: "Select an answer" });
      return;
    }

    if (isLast) {
      await submitWholeQuiz(fromTimeout);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const goBack = async () => {
    if (currentIdx === 0) return;

    const qId = questions[currentIdx];
    const hasAnswer = responses[qId] !== undefined &&
      (!Array.isArray(responses[qId]) || responses[qId].length > 0);

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
        const newArr = arr.includes(idx)
          ? arr.filter(i => i !== idx)
          : [...arr, idx];
        return { ...p, [qId]: newArr };
      });
    } else {
      setResponses(p => ({ ...p, [qId]: idx }));
    }
  };

  // === RENDER HELPERS ===
  const format = sec => `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
  const progressPercent = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;
  const timerPercent = (qTimeLeft / QUESTION_TIME) * 100;

  // === LOADING / ERROR ===
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
          <button
            onClick={fetchQuizQuestions}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length || !currentQ) {
    return <div className="text-center p-8 text-gray-600">No questions available.</div>;
  }

  const qId = questions[currentIdx];
  const isMCQ = currentQ.answer_count > 1;
  const selected = responses[qId];
  const isLocked = locked.has(qId);
  const hasValidAnswer = selected !== undefined && (!Array.isArray(selected) || selected.length > 0);
  const nextLabel = isLocked
    ? (currentIdx === questions.length - 1 ? "Submit Quiz" : "Next")
    : (hasValidAnswer ? "Submit Answer" : "Select to Submit");

  return (
    <div className="min-h-screen bg-white relative">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header */}
      <div className="border-b border-gray-300 pt-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0">
              <circle cx="24" cy="24" r="22" stroke="#e5e7eb" strokeWidth="3" fill="none" />
              <circle
                cx="24" cy="24" r="22" stroke="#3b82f6" strokeWidth="3" fill="none"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - timerPercent / 100)}`}
                className="transition-all duration-1000"
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
              <text x="24" y="28" textAnchor="middle" className="text-xs font-bold fill-gray-700">
                {format(qTimeLeft)}
              </text>
            </svg>
            <span className="text-gray-900 font-medium text-sm">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {questionLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Question */}
            <div className="mb-8">
              <h2 className="text-gray-900 text-base font-normal mb-6">
                {currentQ.q_question.map((line, i) => (
                  <div
                    key={i}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line || "") }}
                  />
                ))}
              </h2>

              {currentQ.images?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {currentQ.images.map((p, i) => (
                    <img
                      key={i}
                      src={`${API_BASE}/${p}`}
                      alt={`Question image ${i + 1}`}
                      className="w-full rounded border border-gray-300 object-contain max-h-64"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {currentQ.q_options?.map((opt, i) => {
                const checked = isMCQ
                  ? Array.isArray(selected) && selected.includes(i)
                  : selected === i;
                const optResult = isLocked ? results[qId] : null;
                const isCorrect = isLocked && optResult === "correct" && checked;
                const isIncorrect = isLocked && optResult === "incorrect" && checked;

                return (
                  <div
                    key={i}
                    onClick={() => !isLocked && handleOption(i)}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${isCorrect ? "border-green-500 bg-green-50"
                        : isIncorrect ? "border-red-500 bg-red-50"
                          : checked ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"}
                      ${isLocked ? "cursor-not-allowed opacity-90" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-semibold
                        ${isCorrect ? "border-green-500 bg-green-500 text-white"
                          : isIncorrect ? "border-red-500 bg-red-500 text-white"
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

            {/* Navigation */}
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
                  ${isLocked
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : hasValidAnswer
                      ? "bg-green-600 text-white hover:bg-green-700"
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
