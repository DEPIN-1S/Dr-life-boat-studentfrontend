import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaCheck, FaTimes, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../utils/apiConfig';
import { getImageUrl } from '../../utils/imageUrl';

const Results = () => {
  const navigate = useNavigate();
  const { seExamId } = useParams();
  const location = useLocation();
  const { state } = location;
  const submittedExamId = state?.submittedExamId || seExamId;
  const [examDetails, setExamDetails] = useState(null);
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSolutions, setShowSolutions] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState('analysis');
  const [visibleStart, setVisibleStart] = useState(0);
  const windowSize = 20;

  // SAFE fallback prevents crash:
  const safeExamDetails = examDetails || [];
  const visibleQuestions = isMobile
    ? safeExamDetails
    : safeExamDetails.slice(visibleStart, visibleStart + windowSize);



  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!submittedExamId) {
      console.log('Submitted Exam ID is missing');
      Swal.fire({
        icon: 'error',
        title: 'Invalid Access',
        text: 'Please select a valid submitted exam.',
      }).then(() => navigate('/exam'));
      return;
    }





    const cachedResults = sessionStorage.getItem(`examResults_${submittedExamId}`);
    if (cachedResults) {
      let parsed = JSON.parse(cachedResults);
      parsed = parsed.map(q => processQuestionData(q));
      setExamDetails(parsed);
      setLoading(false);
    }

    fetchExamDetails();
    fetchExamInfo();
  }, [submittedExamId, navigate]);

  const processQuestionData = (q) => {
    // Set ea_correct from ea_is_correct
    q.ea_correct = q.ea_is_correct || 0;

    // Handle q_question as array or string, convert to HTML
    let questionText = '';
    if (Array.isArray(q.q_question)) {
      questionText = q.q_question.map(s => typeof s === 'string' ? s.trim() : '').filter(Boolean).join('<br />');
    } else if (typeof q.q_question === 'string') {
      questionText = q.q_question.trim().replace(/\n/g, '<br />');
    } else {
      questionText = '';
    }
    q.q_question = questionText;

    // Handle question images from q_question_image
    q.questionImages = q.q_question_image ? q.q_question_image.map(img => img.qi_file).filter(Boolean) : [];

    // Handle explanation images from q_explanation_image
    q.explanationImages = q.q_explanation_image ? q.q_explanation_image.map(img => img.qi_file).filter(Boolean) : [];

    // Handle ruleout images from q_ruleout_image
    q.ruleoutImages = q.q_ruleout_image ? q.q_ruleout_image.map(img => img.qi_file).filter(Boolean) : [];

    // Handle q_options - already array of objects, normalize
    q.q_options = safeParseOptions(q.q_options);

    // Handle ea_answer - already array, no parse needed
    q.ea_answer = Array.isArray(q.ea_answer) ? q.ea_answer : [];

    // Handle q_answer - null, so correct answers derived from q_options where qo_is_correct === 1
    q.q_answer = null;

    // Handle explanations
    q.q_answer_explanation = safeParseExplanation(q.q_answer_explanation);
    q.q_option_explanation = processOptionExplanation(q.q_option_explanation);

    return q;
  };

  const goPrevWindow = () => {
    if (isMobile) return; // disable for mobile
    setVisibleStart(prev => Math.max(prev - windowSize, 0));
  };

  const goNextWindow = () => {
    if (isMobile) return; // disable for mobile
    setVisibleStart(prev => {
      if (prev + windowSize >= safeExamDetails.length) return prev;
      return prev + windowSize;
    });
  };


  const fetchExamDetails = async () => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = API_BASE_URL;
    setLoading(true);

    try {
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/submission/data`,
        headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
        data: { submittedExam_id: parseInt(submittedExamId) },
        method: 'POST',
      });
      console.log('Fetching exam details with submittedExamId:', submittedExamId);

      console.log('Full API Response:', response.data);
      if (response.data.result) {
        const parsedData = response.data.data.map(q => processQuestionData(q));
        setExamDetails(parsedData);
        sessionStorage.setItem(`examResults_${submittedExamId}`, JSON.stringify(parsedData));
        console.log('Exam Details:', parsedData);

        // Fallback for examInfo if not set from list
        if (!examInfo && parsedData.length > 0) {
          const fallbackInfo = {
            ex_name: 'Exam Results',
            se_score: parsedData.reduce((sum, q) => sum + parseFloat(q.ea_mark || 0), 0),
            ex_total_questions: parsedData.length,
            se_duration: calculateTotalTime(parsedData),
            se_created_at: parsedData[0].ea_submitted_at || new Date().toISOString()
          };
          setExamInfo(fallbackInfo);
        }
      } else {
        console.error('API Error Response:', response.data);
        Swal.fire({ icon: 'error', title: 'Error', text: response.data.message || 'Failed to fetch exam results' });
        navigate('/exam');
      }
    } catch (err) {
      console.error('Error fetching exam details:', err);
      const cachedResults = sessionStorage.getItem(`examResults_${submittedExamId}`);
      if (cachedResults) {
        try {
          const parsed = JSON.parse(cachedResults);
          setExamDetails(parsed.map(q => processQuestionData(q)));
          if (!examInfo && parsed.length > 0) {
            const fallbackInfo = {
              ex_name: 'Exam Results',
              se_score: parsed.reduce((sum, q) => sum + parseFloat(q.ea_mark || 0), 0),
              ex_total_questions: parsed.length,
              se_duration: calculateTotalTime(parsed),
              se_created_at: parsed[0].ea_submitted_at || new Date().toISOString()
            };
            setExamInfo(fallbackInfo);
          }
          setLoading(false);
          Swal.fire({
            icon: 'warning',
            title: 'Using Cached Data',
            text: 'API failed, using saved results.',
          });
          return;
        } catch (parseErr) {
          console.error('Cache parse error:', parseErr);
        }
      }
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch exam results. Please try again later.' });
      navigate('/exam');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalTime = (details) => {
    const totalSeconds = details.reduce((sum, q) => {
      const timeStr = q.ea_time_taken || '00:00:00';
      const [mins, secs] = timeStr.split(':').slice(-2).map(Number); // Handle possible HH:MM:SS
      return sum + (mins * 60 + secs);
    }, 0);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchExamInfo = async () => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = API_BASE_URL;
    try {
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/submission/list`,
        headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
        method: 'GET',
      });
      if (response.data.result) {
        const exams = response.data.data || [];
        // Try matching by se_id first
        let matchingExam = exams.find(exam => exam.se_id === parseInt(submittedExamId));
        // Fallback to se_exam_id if not found
        if (!matchingExam) {
          matchingExam = exams.find(exam => exam.se_exam_id === parseInt(submittedExamId));
        }
        if (matchingExam) {
          setExamInfo(matchingExam);
        }
      }
    } catch (err) {
      console.error('Error fetching exam info:', err);
    }
  };

  const safeParseOptions = (optionsData) => {
    try {
      if (Array.isArray(optionsData)) {
        return optionsData.map(opt => ({
          option: opt.qo_option || '',
          image: opt.qo_image || null,
          isCorrect: opt.qo_is_correct || 0
        }));
      } else if (typeof optionsData === 'string' && optionsData) {
        const parsed = JSON.parse(optionsData);
        if (Array.isArray(parsed)) {
          return parsed.map(opt => ({
            option: opt.qo_option || '',
            image: opt.qo_image || null,
            isCorrect: opt.qo_is_correct || 0
          }));
        }
      }
      return [];
    } catch (e) {
      console.error('Failed to parse options JSON:', optionsData, e);
      return [];
    }
  };

  const safeParseExplanation = (exps) => {
    if (!exps) return '';
    let content = '';
    if (Array.isArray(exps)) {
      content = exps.map(exp => typeof exp === 'string' ? exp.trim() : '').filter(Boolean).join('<br />');
    } else if (typeof exps === 'string') {
      content = exps.trim().replace(/\n/g, '<br />');
    }
    return content;
  };

  const processOptionExplanation = (optionExps) => {
    if (!optionExps || optionExps === "null") return '';

    let expData = optionExps;
    if (Array.isArray(expData)) {
      // Handle array - check if strings contain JSON
      let combinedExp = expData.map((item) => {
        if (typeof item === 'string' && item.startsWith('{')) {
          try {
            const parsed = JSON.parse(item);
            return parsed.general || parsed.content || item;
          } catch (e) {
            return item;
          }
        }
        return item;
      }).join("\n");

      // Now process the combined as string
      let unescaped = combinedExp;
      while (unescaped.includes('\\"') || unescaped.includes('\\\\')) {
        try {
          unescaped = JSON.parse(`"${unescaped.replace(/\\"/g, '"')}"`).replace(/^"|"$/g, '');
        } catch {
          break;
        }
      }
      try {
        const parsed = JSON.parse(unescaped);
        if (parsed && typeof parsed === "object") {
          let display = parsed.general ? `<p><strong>General:</strong> ${parsed.general.replace(/\n/g, '<br>')}</p>` : "";
          if (Array.isArray(parsed.options) && parsed.options.length > 0) {
            display += parsed.options.map((exp, idx) =>
              `<p><strong>Option ${String.fromCharCode(65 + idx)}:</strong> ${exp.replace(/\n/g, '<br>')}</p>`
            ).join("");
            return display;
          }
          return `<p>${parsed.general || JSON.stringify(parsed).replace(/\n/g, '<br>')}</p>`;
        }
      } catch (e) {
        // Fallback to plain text
      }
      return unescaped.replace(/\n/g, '<br>');
    }
    if (typeof expData === "string") {
      let unescaped = expData;
      while (unescaped.includes('\\"') || unescaped.includes('\\\\')) {
        try {
          unescaped = JSON.parse(`"${unescaped.replace(/\\"/g, '"')}"`).replace(/^"|"$/g, '');
        } catch {
          break;
        }
      }
      try {
        const parsed = JSON.parse(unescaped);
        if (parsed && typeof parsed === "object") {
          let display = parsed.general ? `<p><strong>General:</strong> ${parsed.general.replace(/\n/g, '<br>')}</p>` : "";
          if (Array.isArray(parsed.options) && parsed.options.length > 0) {
            display += parsed.options.map((exp, idx) =>
              `<p><strong>Option ${String.fromCharCode(65 + idx)}:</strong> ${exp.replace(/\n/g, '<br>')}</p>`
            ).join("");
            return display;
          }
          return `<p>${parsed.general || JSON.stringify(parsed).replace(/\n/g, '<br>')}</p>`;
        }
      } catch (e) {
        // Fallback to plain text
      }
      return unescaped.replace(/\n/g, '<br>');
    } else if (typeof expData === "object") {
      return JSON.stringify(expData, null, 2).replace(/\n/g, '<br>');
    }
    return String(expData).replace(/\n/g, '<br>');
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    let total = 0;
    if (parts.length === 3) {
      total = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      total = parts[0] * 60 + parts[1];
    }
    return total;
  };

  const toggleSolution = (index) => {
    setShowSolutions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const goToQuestion = (questionIndex) => setCurrentQuestion(questionIndex);
  const goNext = () => currentQuestion < (examDetails?.length - 1) && setCurrentQuestion(currentQuestion + 1);
  const goPrevious = () => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span>Loading Results...</span>
        </div>
      </div>
    );
  }

  if (!examDetails || examDetails.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif", padding: '20px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Results temporarily unavailable</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={fetchExamDetails} style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease' }}>Retry</button>
          <button onClick={() => navigate('/exam')} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease' }}>Back to Exams</button>
        </div>
      </div>
    );
  }

  const userCorrectCount = examDetails.filter((q) => q.ea_correct === 1).length || 0;
  const attemptedQuestions = examDetails.filter((q) => q.ea_answer.length > 0).length || 0;
  const incorrectAnswers = attemptedQuestions - userCorrectCount;
  const unanswered = examDetails.length - attemptedQuestions;
  const totalScore = examDetails.reduce((sum, q) => sum + parseFloat(q.q_mark || 0), 0);
  const userScore = examDetails.reduce((sum, q) => sum + parseFloat(q.ea_mark || 0), 0);
  const percentScore = totalScore > 0 ? ((userScore / totalScore) * 100).toFixed(2) : 0;
  // const userScore = examDetails.length > 0 ? ((userCorrectCount / examDetails.length) * 100).toFixed(2) : 0;
  const accuracy = attemptedQuestions > 0 ? ((userCorrectCount / attemptedQuestions) * 100).toFixed(2) : 0;

  const correctTime = examDetails.reduce((sum, q) => q.ea_correct === 1 ? sum + parseTime(q.ea_time_taken) : sum, 0);
  const incorrectTime = examDetails.reduce((sum, q) => (q.ea_answer.length > 0 && q.ea_correct !== 1) ? sum + parseTime(q.ea_time_taken) : sum, 0);
  const skippedTime = examDetails.reduce((sum, q) => q.ea_answer.length === 0 ? sum + parseTime(q.ea_time_taken) : sum, 0);
  const timeTakenSeconds = correctTime + incorrectTime + skippedTime;
  const timeTaken = timeTakenSeconds / 60;
  const timeTakenStr = `${Math.floor(timeTaken)}:${(timeTaken % 1 * 60).toFixed(0).padStart(2, '0')}`;
  const avgTimePerQuestion = examDetails.length > 0 ? Math.round(timeTakenSeconds / examDetails.length) : 0;

  // Replace with real data from API
  const percentile = 55.67;
  const totalRank = 115;
  const totalParticipants = 245;

  const currentDateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

  const performanceData = [
    { name: 'Correct', value: userCorrectCount, fill: '#28a745' },
    { name: 'Incorrect', value: incorrectAnswers, fill: '#dc3545' },
    { name: 'Unanswered', value: unanswered, fill: '#fd7e14' },
  ];

  const bellCurveData = [
    { rank: 0, performance: 0 },
    { rank: 25, performance: 20 },
    { rank: 50, performance: 50 },
    { rank: 75, performance: 30 },
    { rank: 100, performance: 10 },
  ].map(point => ({
    ...point,
    yourRank: point.rank === (totalRank || 50) ? 1 : 0,
  }));

  const question = examDetails[currentQuestion];
  const isCorrect = question.ea_correct === 1;
  const parsedOptions = question.q_options || [];
  const parsedCorrectAnswers = parsedOptions.filter(opt => opt.isCorrect === 1).map(opt => opt.option);
  const parsedSubmittedAnswers = question.ea_answer.map(ans => ans.qo_option);
  const parsedAnswerExplanation = question.q_answer_explanation || '';
  const parsedOptionExplanation = question.q_option_explanation || '';
  const questionHtml = question.q_question || '';
  const questionImages = question.questionImages || [];
  const explanationImages = question.explanationImages || [];
  const ruleoutImages = question.ruleoutImages || [];

  const scoreColor = userScore >= 80 ? '#28a745' : userScore >= 50 ? '#ffc107' : '#dc3545';

  const baseurl = API_BASE_URL;

  return (
    <>
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 1000, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e9ecef' }}>
          <button onClick={goPrevious} disabled={currentQuestion === 0} style={{ background: 'none', border: 'none', color: currentQuestion === 0 ? '#ccc' : '#007bff', fontSize: '18px', cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer', padding: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}><FaChevronLeft /><span style={{ fontSize: '14px', fontWeight: '500' }}>Prev</span></button>
          <button onClick={() => navigate('/exam')} style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Back to Exams</button>
          <button onClick={goNext} disabled={currentQuestion === examDetails.length - 1} style={{ background: 'none', border: 'none', color: currentQuestion === examDetails.length - 1 ? '#ccc' : '#007bff', fontSize: '18px', cursor: currentQuestion === examDetails.length - 1 ? 'not-allowed' : 'pointer', padding: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ fontSize: '14px', fontWeight: '500' }}>Next</span><FaChevronRight /></button>
        </div>
      )}

      <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '100px 15px 80px 15px' : '20px 20px 80px 20px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '10px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '10px', maxWidth: '400px', margin: '0 auto 30px' }}>
          <button onClick={() => setActiveTab('analysis')} style={{ flex: 1, padding: '12px 20px', border: 'none', backgroundColor: activeTab === 'analysis' ? '#007bff' : 'transparent', color: activeTab === 'analysis' ? 'white' : '#495057', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease' }}>Analysis</button>
          <button onClick={() => setActiveTab('detailed')} style={{ flex: 1, padding: '12px 20px', border: 'none', backgroundColor: activeTab === 'detailed' ? '#007bff' : 'transparent', color: activeTab === 'detailed' ? 'white' : '#495057', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease' }}>Review Answers</button>
        </div>

        {activeTab === 'analysis' && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
              <h2 style={{ margin: 0, color: '#212529', fontSize: '24px', textAlign: 'center' }}> {examInfo?.ex_name || 'Exam Results'}</h2>
              <p style={{ margin: '10px 0 0', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>{currentDateTime} </p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #dee2e6' }}>
              <h3 style={{ margin: '0 0 20px', color: '#495057' }}>Total Question Score</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                    {examDetails.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>Total Questions</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                    {attemptedQuestions}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>Attempted</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                    {userCorrectCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>Correct</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: scoreColor }}>
                    {userScore}/{totalScore} ({percentScore})
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>Score</div>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #dee2e6' }}>
              <h3 style={{ margin: '0 0 20px', color: '#495057' }}>Performance Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: scoreColor }}>{userScore}</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Score</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{attemptedQuestions}/{examDetails.length}</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Attempted Questions</div></div>
                {/* <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{percentile}%</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Percentile</div></div> */}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>{accuracy}</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Accuracy</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>{timeTakenStr}</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Time Taken</div></div>
                {/* <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>N/A</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Overall Rank</div></div> */}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ flex: 1, height: '8px', backgroundColor: '#dc3545', borderRadius: '4px' }}></div><span style={{ margin: '0 10px', fontSize: '12px' }}>Bad</span>
                <div style={{ flex: 1.5, height: '8px', backgroundColor: '#ffc107', borderRadius: '4px' }}></div><span style={{ margin: '0 10px', fontSize: '12px' }}>Average</span>
                <div style={{ flex: 1.5, height: '8px', backgroundColor: '#28a745', borderRadius: '4px' }}></div><span style={{ margin: '0 10px', fontSize: '12px' }}>Good</span>
                <div style={{ flex: 1, height: '8px', backgroundColor: '#20c997', borderRadius: '4px' }}></div><span style={{ fontSize: '12px' }}>Excellent</span>
              </div>
              <div style={{ height: 200, marginBottom: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={performanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#6c757d' }}>
                <span><FaCheck style={{ color: '#28a745', marginRight: '5px' }} />Correct</span>
                <span><FaTimes style={{ color: '#dc3545', marginRight: '5px' }} />Incorrect</span>
                <span style={{ color: '#fd7e14' }}><FaLock style={{ marginRight: '5px' }} />Unanswered</span>
              </div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #dee2e6' }}>
              <h3 style={{ margin: '0 0 20px', color: '#495057' }}>Time Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{timeTakenStr}</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Total time taken</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{avgTimePerQuestion} sec</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Average time/q</div></div>
              </div>
              {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>{userCorrectCount > 0 ? Math.round(correctTime / userCorrectCount) : 0} Question</div><div style={{ fontSize: '12px', color: '#6c757d' }}>CORRECT</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>{incorrectAnswers > 0 ? Math.round(incorrectTime / incorrectAnswers) : 0} questions</div><div style={{ fontSize: '12px', color: '#6c757d' }}>INCORRECT</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>{unanswered > 0 ? Math.round(skippedTime / unanswered) : 0} sec/q</div><div style={{ fontSize: '12px', color: '#6c757d' }}>SKIPPED</div></div>
              </div> */}
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #dee2e6' }}>
              <h3 style={{ margin: '0 0 20px', color: '#495057' }}>You vs Others</h3>
              <div style={{ height: 200, marginBottom: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bellCurveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rank" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="performance" stroke="#007bff" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="yourRank" stroke="#ffc107" dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div>
            {/* <div style={{ marginBottom: '30px', position: 'relative' }}>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '10px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {examDetails.map((_, index) => {
                  const isCurrent = currentQuestion === index;
                  const isCorrect = examDetails[index].ea_correct === 1;
                  const hasAnswer = examDetails[index].ea_answer.length > 0;
                  const statusColor = isCorrect ? '#28a745' : (hasAnswer ? '#dc3545' : '#6c757d');

                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: isCurrent ? '3px solid #007bff' : `2px solid ${statusColor}`,
                        borderRadius: '50%',
                        background: 'white', // or 'transparent' if preferred
                        color: statusColor, // Use status color for text to maintain visibility
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        transition: 'all 0.3s ease',
                        boxShadow: isCurrent ? '0 0 0 2px rgba(0,123,255,0.25)' : 'none',
                      }}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div> */}

            <div
              style={{
                marginBottom: '30px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >

              {/* LEFT ARROW (DESKTOP ONLY) */}
              {!isMobile && (
                <button
                  onClick={goPrevWindow}
                  disabled={visibleStart === 0}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #007bff',
                    background: visibleStart === 0 ? '#e9ecef' : '#007bff',
                    color: visibleStart === 0 ? '#6c757d' : 'white',
                    cursor: visibleStart === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FaChevronLeft />
                </button>
              )}

              {/* QUESTION BUBBLES */}
              <div
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '8px',
                  padding: '10px 0',
                  flex: 1,
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {visibleQuestions.map((_, idx) => {
                  const actualIndex = isMobile ? idx : visibleStart + idx;
                  const q = safeExamDetails[actualIndex];

                  const isCurrent = currentQuestion === actualIndex;
                  const isCorrect = q?.ea_correct === 1;
                  const hasAnswer = q?.ea_answer?.length > 0;

                  const statusColor = isCorrect ? '#28a745' : hasAnswer ? '#dc3545' : '#6c757d';

                  return (
                    <button
                      key={actualIndex}
                      onClick={() => goToQuestion(actualIndex)}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: isCurrent ? '3px solid #007bff' : `2px solid ${statusColor}`,
                        borderRadius: '50%',
                        background: 'white',
                        color: statusColor,
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {actualIndex + 1}
                    </button>
                  );
                })}
              </div>

              {/* RIGHT ARROW (DESKTOP ONLY) */}
              {!isMobile && (
                <button
                  onClick={goNextWindow}
                  disabled={visibleStart + windowSize >= safeExamDetails.length}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #007bff',
                    background: (visibleStart + windowSize >= safeExamDetails.length) ? '#e9ecef' : '#007bff',
                    color: (visibleStart + windowSize >= safeExamDetails.length) ? '#6c757d' : 'white',
                    cursor: (visibleStart + windowSize >= safeExamDetails.length) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FaChevronRight />
                </button>
              )}

            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '20px' : '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '20px', border: '1px solid #e9ecef' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f1f3f4' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>QUESTION {currentQuestion + 1} OF {examDetails.length}</div>
                <div style={{ marginLeft: 'auto' }}>
                  {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isCorrect ? '#e8f5e8' : '#ffeaea', border: `2px solid ${isCorrect ? '#28a745' : '#dc3545'}` }}>
                    {isCorrect ? <FaCheck style={{ color: '#28a745', fontSize: '16px' }} /> : <FaTimes style={{ color: '#dc3545', fontSize: '16px' }} />}
                  </div> */}
                </div>
              </div>

              <div className="question-content" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px', fontSize: '16px', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: questionHtml }} />

              {questionImages.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '8px', fontSize: '16px' }}>Question Images:</h4>
                  {questionImages.map((imgPath, idx) => (
                    <img key={idx} src={getImageUrl(imgPath)} alt={`Question Image ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '8px' }} />
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                {parsedOptions.map((opt, idx) => {
                  const isOptionCorrect = parsedCorrectAnswers.includes(opt.option);
                  const isOptionSelected = parsedSubmittedAnswers.includes(opt.option);

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

                  let label = '';
                  let labelColor = isOptionCorrect ? '#28a745' : '#dc3545';
                  if (isOptionSelected) {
                    label = isOptionCorrect ? 'Your Correct Answer' : 'Your Incorrect Answer';
                  } else if (isOptionCorrect) {
                    label = 'Correct Answer';
                  }

                  const optionText = opt.option;
                  const optionImage = opt.image;

                  return (
                    <div
                      key={idx}
                      style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px', borderRadius: '8px', border: `2px solid ${borderColor}`, backgroundColor, color: textColor }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
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
                            marginTop: '2px',
                          }}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div style={{ flex: 1 }}>
                          <span>{optionText}</span>
                          {label && <span style={{ fontSize: '12px', color: labelColor, fontWeight: '500', display: 'block', marginTop: '4px' }}>{label}</span>}
                        </div>
                      </div>
                      {optionImage && (
                        <img src={getImageUrl(optionImage)} alt={`Option ${String.fromCharCode(65 + idx)} Image`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              <button onClick={() => toggleSolution(currentQuestion)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '12px 20px', borderRadius: '25px', marginBottom: '20px', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}><FaLock size={14} />{showSolutions[currentQuestion] ? 'Hide Solution' : 'Show Solution'}</button>

              {showSolutions[currentQuestion] && (
                <div style={{ backgroundColor: '#f8f9ff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e0e7ff', borderLeft: '4px solid #667eea' }}>
                  <h4 style={{ color: '#4c63d2', marginBottom: '10px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>💡 Solution Explanation</h4>
                  <div className="explanation-content" style={{ fontSize: '14px', lineHeight: '1.6', color: '#4a5568' }} dangerouslySetInnerHTML={{ __html: parsedAnswerExplanation }} />
                  {parsedOptionExplanation && (
                    <>
                      <br />
                      <strong style={{ marginTop: '5px', display: 'block' }}>Option Analysis:</strong><br />
                      <div className="explanation-content" style={{ fontSize: '14px', lineHeight: '1.6', color: '#4a5568', marginTop: '5px' }} dangerouslySetInnerHTML={{ __html: parsedOptionExplanation }} />
                    </>
                  )}
                  <div  >
                    {explanationImages.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <h5 style={{ color: '#4c63d2', marginBottom: '8px' }}>Explanation Images:</h5>
                        {explanationImages.map((imgPath, idx) => (
                          <img key={idx} src={getImageUrl(imgPath)} alt={`Explanation Image ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '8px' }} />
                        ))}
                      </div>
                    )}
                  </div>
                  {ruleoutImages.length > 0 && (
                    <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
                      <h5 style={{ color: '#856404', marginBottom: '8px' }}>Rule Out Images:</h5>
                      {ruleoutImages.map((imgPath, idx) => (
                        <img key={idx} src={getImageUrl(imgPath)} alt={`Rule Out Image ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '5px' }} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#f8f9fa', borderRadius: '10px', border: '1px solid #e9ecef' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#495057' }}>Marks Obtained:</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: isCorrect ? '#28a745' : '#dc3545', backgroundColor: 'white', padding: '5px 12px', borderRadius: '20px', border: `1px solid ${isCorrect ? '#28a745' : '#dc3545'}` }}>{parseFloat(question.ea_mark || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', zIndex: 1000, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e9ecef' }}>
          <button onClick={goPrevious} disabled={currentQuestion === 0} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '25px', border: '2px solid #e9ecef', backgroundColor: currentQuestion === 0 ? '#f8f9fa' : 'white', color: currentQuestion === 0 ? '#adb5bd' : '#495057', cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'all 0.3s ease' }}><FaChevronLeft size={12} />Previous</button>
          <button onClick={() => navigate('/exam')} style={{ padding: '12px 30px', borderRadius: '25px', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)', transition: 'all 0.3s ease' }}>Back to Exams</button>
          <button onClick={goNext} disabled={currentQuestion === examDetails.length - 1} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '25px', border: 'none', backgroundColor: currentQuestion === examDetails.length - 1 ? '#adb5bd' : '#007bff', color: 'white', cursor: currentQuestion === examDetails.length - 1 ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'all 0.3s ease' }}>Next<FaChevronRight size={12} /></button>
        </div>
      )}

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

          /* Reduce spacing in question and explanation content */
          .question-content p,
          .question-content div {
            margin-bottom: 8px !important;
            line-height: 1.4 !important;
          }
          .question-content ul,
          .question-content ol {
            margin: 8px 0 !important;
            padding-left: 20px !important;
          }
          .question-content li {
            margin-bottom: 4px !important;
          }
          .question-content br {
            line-height: 1.2 !important;
          }

          .explanation-content p,
          .explanation-content div {
            margin-bottom: 8px !important;
            line-height: 1.5 !important;
          }
          .explanation-content ul,
          .explanation-content ol {
            margin: 8px 0 !important;
            padding-left: 20px !important;
          }
          .explanation-content li {
            margin-bottom: 4px !important;
          }
          .explanation-content br {
            line-height: 1.2 !important;
          }
        `}
      </style>
    </>
  );
};

export default Results;
