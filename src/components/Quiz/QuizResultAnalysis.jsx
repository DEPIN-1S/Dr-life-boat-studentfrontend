


import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheck, FaTimes, FaLock, FaChevronLeft, FaChevronRight, FaClock, FaTrophy, FaChartPie, FaArrowLeft, FaHome } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';
const IMAGE_BASE = 'https://lunarsenterprises.com:6028';

const QuizResultAnalysis = () => {
  const navigate = useNavigate();
  const { submissionId } = useParams();
  const [quizDetails, setQuizDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSolutions, setShowSolutions] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState('analysis');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!submissionId) {
      Swal.fire('Error', 'Invalid submission', 'error');
      navigate('/quiz');
      return;
    }

    const fetchData = async () => {
      const token = sessionStorage.getItem('token');
      setLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE}/drlifeboat/student/quiz/submission/data`,
          { submittedQuiz_id: parseInt(submissionId) },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.result && res.data.data?.length > 0) {
          const processed = res.data.data.map(processQuestionData);
          setQuizDetails(processed);
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to load results', 'error');
        navigate('/quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId, navigate]);

  const processQuestionData = (q) => {
    // Question text
    let questionText = Array.isArray(q.q_question) ? q.q_question.join('<br />') : q.q_question || '';
    q.q_question = questionText.replace(/\n/g, '<br />');

    // Images
    q.questionImages = (q.q_question_image || []).map(img => img.qi_file).filter(Boolean);
    q.explanationImages = (q.q_explanation_image || []).map(img => img.qi_file).filter(Boolean);
    q.ruleoutImages = (q.q_ruleout_image || []).map(img => img.qi_file).filter(Boolean);

    // Options - real array from API
    let options = q.q_options || [];
    if (typeof options === 'string') options = JSON.parse(options);

    q.q_options = (options || []).map(opt => ({
      id: opt.qo_id,
      text: opt.qo_option || '',
      image: opt.qo_image || null,
      isCorrect: opt.qo_is_correct == 1
    }));

    // CRITICAL FIX: qa_answer is a STRINGIFIED JSON → parse it!
    let userAnswerRaw = q.qa_answer;
    let userSelectedOptions = [];

    if (userAnswerRaw && typeof userAnswerRaw === 'string') {
      try {
        const parsed = JSON.parse(userAnswerRaw);
        if (Array.isArray(parsed)) {
          userSelectedOptions = parsed.map(item => item.qo_option).filter(Boolean);
        }
      } catch (e) {
        console.warn('Failed to parse qa_answer:', userAnswerRaw);
      }
    }

    q.userSelected = userSelectedOptions;
    q.wasAttempted = userSelectedOptions.length > 0;
    q.isCorrectAnswer = q.qa_is_correct === 1;

    // Explanation
    q.explanation = Array.isArray(q.q_answer_explanation)
      ? q.q_answer_explanation.join('<br />')
      : q.q_answer_explanation || 'No explanation provided.';

    return q;
  };

  const toggleSolution = (idx) => {
    setShowSolutions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const goPrev = () => currentQuestion > 0 && setCurrentQuestion(c => c - 1);
  const goNext = () => currentQuestion < quizDetails.length - 1 && setCurrentQuestion(c => c + 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Results...</p>
        </div>
      </div>
    );
  }

  if (!quizDetails.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h2>
          <p className="text-gray-600">Unable to load quiz data</p>
        </div>
      </div>
    );
  }

  const correctCount = quizDetails.filter(q => q.isCorrectAnswer).length;
  const attemptedCount = quizDetails.filter(q => q.wasAttempted).length;
  const incorrectCount = attemptedCount - correctCount;
  const unansweredCount = quizDetails.length - attemptedCount;

  const userScore = quizDetails.reduce((sum, q) => sum + (q.qa_mark || 0), 0);
  const totalScore = quizDetails.reduce((sum, q) => sum + (q.q_mark || 0), 0);
  const percentage = totalScore > 0 ? ((userScore / totalScore) * 100).toFixed(1) : 0;

  const pieData = [
    { name: 'Correct', value: correctCount, fill: '#10b981' },
    { name: 'Incorrect', value: incorrectCount, fill: '#ef4444' },
    { name: 'Unanswered', value: unansweredCount, fill: '#f59e0b' },
  ];

  const currentQ = quizDetails[currentQuestion] || {};
  const userAnswers = currentQ.userSelected || [];

  return (
    <>
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => navigate('/quiz')} className="flex items-center gap-2 text-gray-700 font-semibold hover:text-blue-600">
              <FaArrowLeft /> Back
            </button>
            <h1 className="font-bold text-gray-800">Quiz Results</h1>
            <div className="w-16"></div>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pt-16 pb-20' : 'py-6'}`}>
        <div className="max-w-5xl mx-auto px-4">

          {!isMobile && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Result Analysis</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaClock /><span>{new Date().toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-1 mb-6 flex gap-2">
            <button onClick={() => setActiveTab('analysis')} className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'analysis' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
              <FaChartPie /> Analysis
            </button>
            <button onClick={() => setActiveTab('detailed')} className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all ${activeTab === 'detailed' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
              Detailed Review
            </button>
          </div>

          {/* ANALYSIS TAB */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrophy className="text-3xl" />
                </div>
                <p className="text-sm font-medium mb-2 opacity-90">Your Score</p>
                <p className="text-6xl font-bold mb-3">{percentage}</p>
                <p className="text-lg font-semibold">{userScore} / {totalScore} marks</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Questions', value: quizDetails.length, color: 'bg-gray-600' },
                  { label: 'Correct', value: correctCount, color: 'bg-green-600' },
                  { label: 'Incorrect', value: incorrectCount, color: 'bg-red-600' },
                  { label: 'Unanswered', value: unansweredCount, color: 'bg-amber-600' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.color} rounded-xl shadow-md p-6 text-center text-white`}>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm font-medium opacity-90">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Performance Overview</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={5} label={({ value }) => value}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-6 flex-wrap">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: d.fill }}></div>
                      <span className="text-sm font-medium text-gray-700">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setActiveTab('detailed')} className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold shadow-md hover:bg-blue-700">
                View Detailed Review
              </button>
            </div>
          )}

          {/* DETAILED REVIEW */}
          {activeTab === 'detailed' && (
            <div className="space-y-6 pb-24">
              <div className="bg-white rounded-xl shadow-md p-4 sticky top-10 z-40">
                <p className="text-sm font-semibold text-gray-600 mb-3">Question Navigator</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quizDetails.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestion(i)}
                      className={`min-w-12 h-12 rounded-lg font-semibold transition-all ${
                        currentQuestion === i
                          ? 'bg-blue-600 text-white shadow-md scale-110'
                          : q.isCorrectAnswer
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : q.wasAttempted
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-blue-600 p-5 text-white">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Question {currentQuestion + 1} of {quizDetails.length}</h3>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      currentQ.isCorrectAnswer ? 'bg-green-500' :
                      currentQ.wasAttempted ? 'bg-red-500' : 'bg-amber-500'
                    }`}>
                      {currentQ.isCorrectAnswer ? <FaCheck className="text-xl" /> :
                       currentQ.wasAttempted ? <FaTimes className="text-xl" /> :
                       <FaLock className="text-xl" />}
                    </div>
                  </div>
                  <p className="text-right mt-3 font-semibold">
                    Marks: {currentQ.qa_mark || 0} / {currentQ.q_mark || 0}
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="text-lg leading-relaxed text-gray-800 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600"
                    dangerouslySetInnerHTML={{ __html: currentQ.q_question }}
                  />

                  {currentQ.questionImages.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQ.questionImages.map((img, i) => (
                        <img key={i} src={`${IMAGE_BASE}${img}`} alt="Question" className="rounded-lg shadow-md w-full object-contain max-h-96" onError={(e) => e.target.style.display = 'none'} />
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    {currentQ.q_options.map((opt, i) => {
                      const isCorrect = opt.isCorrect;
                      const isSelected = userAnswers.includes(opt.text);

                      let borderColor = 'border-gray-300';
                      let bgColor = 'bg-white';
                      let badge = null;

                      if (currentQ.wasAttempted) {
                        if (isCorrect) {
                          borderColor = 'border-green-500';
                          bgColor = 'bg-green-50';
                          badge = <span className="ml-auto bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">Correct Answer</span>;
                        }
                        if (isSelected && !isCorrect) {
                          borderColor = 'border-red-500';
                          bgColor = 'bg-red-50';
                          badge = <span className="ml-auto bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">Your Answer</span>;
                        }
                      }

                      return (
                        <div key={i} className={`border-2 ${borderColor} ${bgColor} rounded-lg p-4 transition-all`}>
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-md flex items-center justify-center flex-shrink-0">
                              {String.fromCharCode(65 + i)}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 font-medium">{opt.text}</p>
                              {opt.image && (
                                <img src={`${IMAGE_BASE}${opt.image}`} alt="Option" className="mt-3 rounded-lg shadow-sm max-h-64 object-contain" />
                              )}
                            </div>
                            {badge}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => toggleSolution(currentQuestion)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
                  >
                    {showSolutions[currentQuestion] ? 'Hide Solution' : 'Show Solution & Explanation'}
                  </button>

                  {showSolutions[currentQuestion] && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 space-y-5">
                      <h4 className="text-xl font-bold text-blue-900">Explanation</h4>
                      <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: currentQ.explanation }} />

                      {currentQ.explanationImages.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {currentQ.explanationImages.map((img, i) => (
                            <img key={i} src={`${IMAGE_BASE}${img}`} alt="Explanation" className="rounded-lg shadow-md w-full object-contain max-h-96" />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isMobile && activeTab === 'detailed' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={goPrev} disabled={currentQuestion === 0}
              className="flex items-center gap-2 text-blue-600 font-semibold disabled:opacity-40 px-4 py-2 rounded-lg hover:bg-blue-50">
              <FaChevronLeft /> Prev
            </button>
            <button onClick={() => navigate('/quiz')}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 flex items-center gap-2">
              <FaHome /> Home
            </button>
            <button onClick={goNext} disabled={currentQuestion === quizDetails.length - 1}
              className="flex items-center gap-2 text-blue-600 font-semibold disabled:opacity-40 px-4 py-2 rounded-lg hover:bg-blue-50">
              Next <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizResultAnalysis;
