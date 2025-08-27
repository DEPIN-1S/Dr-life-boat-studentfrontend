import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaCheck, FaTimes, FaLock } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';

const Results = () => {
  const navigate = useNavigate();
  const { examId } = useParams(); // This will be se_exam_id from the URL
  const location = useLocation();
  const { state } = location;
  const submittedExamId = state?.submittedExamId || examId; // Use submittedExamId or fallback to URL param
  const [examDetails, setExamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSolutions, setShowSolutions] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>
        Loading...
      </div>
    );
  }

  if (!examDetails || examDetails.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <h2>Results temporarily unavailable</h2>
        <button
          onClick={fetchExamDetails}
          style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}
        >
          Retry
        </button>
        <button
          onClick={() => navigate('/exam')}
          style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
        >
          Back to Exams
        </button>
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
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '900px', margin: '0 auto', padding: '20px', backgroundColor: '#f8f9fa' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {examDetails.map((_, index) => (
          <button
            key={index}
            onClick={() => goToQuestion(index)}
            style={{
              width: '40px',
              height: '40px',
              border: currentQuestion === index ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '50%',
              background: examDetails[index].ea_correct === 1 ? '#28a745' : '#dc3545',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>QUESTION {currentQuestion + 1}</span>
          <div style={{ marginLeft: 'auto' }}>
            {isCorrect ? <FaCheck style={{ color: '#28a745', fontSize: '18px' }} /> : <FaTimes style={{ color: '#dc3545', fontSize: '18px' }} />}
          </div>
        </div>

        <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#333', marginBottom: '25px', whiteSpace: 'pre-line' }}>
          {question.q_question}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
          {parsedOptions.map((option, idx) => {
            const isOptionCorrect = parsedCorrectAnswers.includes(option);
            const isOptionSelected = parsedSubmittedAnswers.includes(option);

            let backgroundColor = '#f8f9fa';
            let borderColor = '#dee2e6';
            let textColor = '#333';

            if (isOptionCorrect) {
              backgroundColor = '#d4edda';
              borderColor = '#28a745';
              textColor = '#155724';
            } else if (isOptionSelected && !isOptionCorrect) {
              backgroundColor = '#f8d7da';
              borderColor = '#dc3545';
              textColor = '#721c24';
            }

            return (
              <div
                key={idx}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '8px', border: `2px solid ${borderColor}`, backgroundColor, color: textColor }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isOptionCorrect ? '#28a745' : isOptionSelected ? '#dc3545' : '#6c757d',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span style={{ flex: 1 }}>{option}</span>
                {isOptionCorrect && (
                  <span style={{ fontSize: '12px', color: '#28a745', fontWeight: '500' }}>{userCorrectPercentage}% got this correct</span>
                )}
                {isOptionSelected && !isOptionCorrect && (
                  <span style={{ fontSize: '12px', color: '#dc3545', fontWeight: '500' }}>{userSelectedPercentage}% marked this</span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => toggleSolution(currentQuestion)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#007bff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '0', marginBottom: '20px' }}
        >
          <FaLock size={12} /> Solution
        </button>

        {showSolutions[currentQuestion] && (
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
            <h4 style={{ color: '#333', marginBottom: '10px', fontSize: '16px' }}>Solution</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#666', whiteSpace: 'pre-line' }}>
              {parsedAnswerExplanation}
              {parsedOptionExplanation && (
                <>
                  <br /><br />
                  {parsedOptionExplanation}
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
          Marks Obtained: {parseFloat(question.ea_mark || 0).toFixed(2)}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
        <button
          onClick={goPrevious}
          disabled={currentQuestion === 0}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            backgroundColor: currentQuestion === 0 ? '#f8f9fa' : 'white',
            color: currentQuestion === 0 ? '#6c757d' : '#333',
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '500',
          }}
        >
          Previous
        </button>

        <button
          onClick={() => navigate('/exam')}
          style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontWeight: '500' }}
        >
          Back to Exams
        </button>

        <button
          onClick={goNext}
          disabled={currentQuestion === examDetails.length - 1}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: currentQuestion === examDetails.length - 1 ? '#6c757d' : '#007bff',
            color: 'white',
            cursor: currentQuestion === examDetails.length - 1 ? 'not-allowed' : 'pointer',
            fontWeight: '500',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Results
