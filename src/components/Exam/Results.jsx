import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaCheck, FaTimes, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';

const Results = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const location = useLocation();
  const { state } = location;
  const submittedExamId = state?.submittedExamId || examId;
  const [examDetails, setExamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSolutions, setShowSolutions] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!submittedExamId) {
      console.log('Submitted Exam ID is missing');
      navigate('/exam');
      return;
    }

    const cachedResults = sessionStorage.getItem(`examResults_${submittedExamId}`);
    if (cachedResults) {
      setExamDetails(JSON.parse(cachedResults));
      setLoading(false);
    }

    fetchExamDetails();
  }, [submittedExamId, navigate]);

  const fetchExamDetails = async () => {
    const Bearer = sessionStorage.getItem('token');
    setLoading(true);

    try {
      const response = await axios({
        url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/exam/submission/data',
        headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
        data: { submittedExam_id: submittedExamId },
        method: 'POST',
      });

      console.log('Full API Response:', response.data);
      if (response.data.result) {
        setExamDetails(response.data.data);
        sessionStorage.setItem(`examResults_${submittedExamId}`, JSON.stringify(response.data.data));
        console.log('Exam Details:', response.data.data);
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: response.data.message || 'Failed to fetch exam results' });
        navigate('/exam');
      }
    } catch (err) {
      console.error('Error fetching exam details:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch exam results. Please try again later.' });
      navigate('/exam');
    } finally {
      setLoading(false);
    }
  };

  const safeParse = (jsonStr) => {
    try {
      if (typeof jsonStr !== 'string' || !jsonStr) {
        return [];
      }
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse JSON:', jsonStr, e);
      return [];
    }
  };

  const toggleSolution = (index) => {
    setShowSolutions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const goToQuestion = (questionIndex) => {
    setCurrentQuestion(questionIndex);
  };

  const goNext = () => {
    if (currentQuestion < examDetails.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        fontFamily: "'Segoe UI', sans-serif"
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span>Loading Results...</span>
        </div>
      </div>
    );
  }

  if (!examDetails || examDetails.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        fontFamily: "'Segoe UI', sans-serif",
        padding: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Results temporarily unavailable</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={fetchExamDetails}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/exam')}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const question = examDetails[currentQuestion];
  const isCorrect = question.ea_correct === 1;
  const parsedOptions = safeParse(question.q_options);
  const parsedCorrectAnswers = safeParse(question.q_answer);
  const parsedSubmittedAnswers = safeParse(question.ea_answer);
  const parsedAnswerExplanation = safeParse(question.q_answer_explanation).join('\n');
  const parsedOptionExplanation = safeParse(question.q_option_explanation).join('\n');

  const totalQuestions = examDetails.length;
  const userCorrectCount = examDetails.filter((q) => q.ea_correct === 1).length;
  const userCorrectPercentage = totalQuestions > 0 ? Math.round((userCorrectCount / totalQuestions) * 100) : 0;

  const selectedOptionsCount = examDetails.reduce((count, q) => {
    const submitted = safeParse(q.ea_answer);
    return count + (submitted.length > 0 ? 1 : 0);
  }, 0);
  const userSelectedPercentage = totalQuestions > 0 ? Math.round((selectedOptionsCount / totalQuestions) * 100) : 0;

  return (
    <>
      {/* Mobile Navigation Bar */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e9ecef'
        }}>
          <button
            onClick={goPrevious}
            disabled={currentQuestion === 0}
            style={{
              background: 'none',
              border: 'none',
              color: currentQuestion === 0 ? '#ccc' : '#007bff',
              fontSize: '18px',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FaChevronLeft />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Prev</span>
          </button>

          <button
            onClick={() => navigate('/exam')}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Back to Exams
          </button>

          <button
            onClick={goNext}
            disabled={currentQuestion === examDetails.length - 1}
            style={{
              background: 'none',
              border: 'none',
              color: currentQuestion === examDetails.length - 1 ? '#ccc' : '#007bff',
              fontSize: '18px',
              cursor: currentQuestion === examDetails.length - 1 ? 'not-allowed' : 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Next</span>
            <FaChevronRight />
          </button>
        </div>
      )}

      <div style={{
        fontFamily: "'Segoe UI', sans-serif",
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? '80px 15px 20px 15px' : '20px',
        minHeight: '100vh'
      }}>

        {/* Question Navigation Slider */}
        <div style={{
          marginBottom: '30px',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '8px',
            padding: '10px 0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}>
            {examDetails.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: currentQuestion === index ? '3px solid #007bff' : '2px solid #ddd',
                  borderRadius: '50%',
                  background: 'white',
                  color: examDetails[index].ea_correct === 1 ? '#28a745' : '#dc3545',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: currentQuestion === index ? '0 0 0 2px rgba(0,123,255,0.25)' : 'none'
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main Question Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: isMobile ? '20px' : '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>

          {/* Question Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '1px solid #f1f3f4'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              QUESTION {currentQuestion + 1} OF {totalQuestions}
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isCorrect ? '#e8f5e8' : '#ffeaea',
                border: `2px solid ${isCorrect ? '#28a745' : '#dc3545'}`
              }}>
                {isCorrect ?
                  <FaCheck style={{ color: '#28a745', fontSize: '16px' }} /> :
                  <FaTimes style={{ color: '#dc3545', fontSize: '16px' }} />
                }
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div style={{
            fontSize: isMobile ? '16px' : '18px',
            lineHeight: '1.7',
            color: '#2c3e50',
            marginBottom: '30px',
            whiteSpace: 'pre-line',
            fontWeight: '500'
          }}>
            {question.q_question}
          </div>

          {/* Options */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginBottom: '30px'
          }}>
            {parsedOptions.map((option, idx) => {
              const isOptionCorrect = parsedCorrectAnswers.includes(option);
              const isOptionSelected = parsedSubmittedAnswers.includes(option);

              let borderColor = '#e9ecef';
              let textColor = '#495057';

              if (isOptionCorrect) {
                borderColor = '#28a745';
                textColor = '#28a745';
              } else if (isOptionSelected && !isOptionCorrect) {
                borderColor = '#dc3545';
                textColor = '#dc3545';
              }

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '18px',
                    borderRadius: '12px',
                    border: `2px solid ${borderColor}`,
                    backgroundColor: 'white',
                    color: textColor,
                    transition: 'all 0.3s ease',
                    cursor: 'default'
                  }}
                >
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      border: `2px solid ${borderColor}`,
                      color: textColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span style={{
                    flex: 1,
                    fontSize: '15px',
                    fontWeight: '500'
                  }}>
                    {option}
                  </span>
                  {isOptionCorrect && (
                    <span style={{
                      fontSize: '12px',
                      color: '#28a745',
                      fontWeight: '600',
                      backgroundColor: '#e8f5e8',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      ✓ Correct
                    </span>
                  )}
                  {isOptionSelected && !isOptionCorrect && (
                    <span style={{
                      fontSize: '12px',
                      color: '#dc3545',
                      fontWeight: '600',
                      backgroundColor: '#ffeaea',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      ✗ Selected
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Solution Button */}
          <button
            onClick={() => toggleSolution(currentQuestion)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '12px 20px',
              borderRadius: '25px',
              marginBottom: '25px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            <FaLock size={14} />
            {showSolutions[currentQuestion] ? 'Hide Solution' : 'Show Solution'}
          </button>

          {/* Solution Content */}
          {showSolutions[currentQuestion] && (
            <div style={{
              backgroundColor: '#f8f9ff',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '25px',
              border: '1px solid #e0e7ff',
              borderLeft: '4px solid #667eea'
            }}>
              <h4 style={{
                color: '#4c63d2',
                marginBottom: '15px',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💡 Solution Explanation
              </h4>
              <div style={{
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#4a5568',
                whiteSpace: 'pre-line'
              }}>
                {parsedAnswerExplanation}
                {parsedOptionExplanation && (
                  <>
                    <br /><br />
                    <strong>Option Analysis:</strong><br />
                    {parsedOptionExplanation}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Marks Display */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            border: '1px solid #e9ecef'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#495057'
            }}>
              Marks Obtained:
            </span>
            <span style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: isCorrect ? '#28a745' : '#dc3545',
              backgroundColor: 'white',
              padding: '5px 12px',
              borderRadius: '20px',
              border: `1px solid ${isCorrect ? '#28a745' : '#dc3545'}`
            }}>
              {parseFloat(question.ea_mark || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Buttons */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '15px',
            alignItems: 'center'
          }}>
            <button
              onClick={goPrevious}
              disabled={currentQuestion === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '25px',
                border: '2px solid #e9ecef',
                backgroundColor: currentQuestion === 0 ? '#f8f9fa' : 'white',
                color: currentQuestion === 0 ? '#adb5bd' : '#495057',
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
            >
              <FaChevronLeft size={12} />
              Previous
            </button>

            <button
              onClick={() => navigate('/exam')}
              style={{
                padding: '12px 30px',
                borderRadius: '25px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Back to Exams
            </button>

            <button
              onClick={goNext}
              disabled={currentQuestion === examDetails.length - 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: currentQuestion === examDetails.length - 1 ? '#adb5bd' : '#007bff',
                color: 'white',
                cursor: currentQuestion === examDetails.length - 1 ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
            >
              Next
              <FaChevronRight size={12} />
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Hide scrollbar for question navigation */
          div::-webkit-scrollbar {
            display: none;
          }

          /* Responsive improvements */
          @media (max-width: 768px) {
            .question-nav {
              padding: 5px 0;
            }
          }

          /* Smooth transitions */
          * {
            box-sizing: border-box;
          }

          button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          }
        `}
      </style>
    </>
  );
}

export default Results;



