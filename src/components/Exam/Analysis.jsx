import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analysis = () => {
  const { examId } = useParams(); // se_id (submission ID)
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const submittedExamId = state?.submittedExamId || examId;
  const [analysisData, setAnalysisData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [examDetails, setExamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' or 'solution'
  const [examMetadata, setExamMetadata] = useState({ totalParticipants: 1245, totalMarks: 50 });

  // Get current date and time
  const currentDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).replace(',', ' -');

  useEffect(() => {
    if (!submittedExamId) {
      setError('No exam ID provided.');
      setLoading(false);
      return;
    }
    fetchAnalysisData();
    fetchExamDetails();
  }, [submittedExamId, navigate]);

  const fetchAnalysisData = async () => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = 'https://lunarsenterprises.com:6028';
    if (!Bearer) {
      Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'Please log in again.',
        confirmButtonText: 'Login',
      }).then(() => navigate('/login'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching analysis for submittedExamId:', submittedExamId);
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/submission/data`,
        headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
        data: { submittedExam_id: parseInt(submittedExamId) },
        method: 'POST',
        timeout: 10000,
      });

      console.log('Analysis API Response:', JSON.stringify(response.data, null, 2));
      if (response.data.result) {
        // Parse JSON strings
        const data = (response.data.data || []).map(q => {
          if (typeof q.q_question === 'string' && q.q_question.startsWith('[')) {
            q.q_question = JSON.parse(q.q_question)[0] || '';
          }
          if (typeof q.q_options === 'string') {
            q.q_options = JSON.parse(q.q_options);
          }
          return q;
        });
        setAnalysisData(data);

        const totalQuestions = data.length;
        const correctAnswers = data.filter((q) => q.ea_is_correct === 1).length;
        const incorrectAnswers = data.filter((q) => q.ea_is_correct === 0 && safeParse(q.ea_answer).length > 0).length;
        const unanswered = totalQuestions - correctAnswers - incorrectAnswers;
        const totalScore = data.reduce((sum, q) => sum + (parseFloat(q.ea_mark) || 0), 0);
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const percentCorrect = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const timeTakenSeconds = data.reduce((sum, q) => {
          if (q.ea_time_taken) {
            const [minutes, seconds] = q.ea_time_taken.split(':').map(Number);
            return sum + (minutes * 60 + seconds);
          }
          return sum;
        }, 0);
        const timeTaken = timeTakenSeconds / 60;
        const avgTimePerQuestion = totalQuestions > 0 ? Math.round(timeTakenSeconds / totalQuestions) : 0;
        const rank = response.data.rank || totalRank; // Placeholder
        const percentile = response.data.percentile || 55.67;

        setSummaryData({
          totalScore,
          attemptedQuestions: correctAnswers + incorrectAnswers,
          correctQuestions: correctAnswers,
          incorrectAnswers,
          unanswered,
          accuracy,
          percentCorrect,
          timeTaken: `${Math.floor(timeTaken)}:${Math.round((timeTaken % 1) * 60).toString().padStart(2, '0')} min`,
          avgTimePerQuestion: `${avgTimePerQuestion} sec`,
          rank,
          percentile,
        });

        setLeaderboard(response.data.leaderboard || []);
        setExamMetadata({
          totalParticipants: response.data.totalParticipants || 1245,
          totalMarks: response.data.totalMarks || 50,
          averageRank: response.data.averageRank || null,
          averageCorrect: response.data.averageCorrect || 0,
          averageAccuracy: response.data.averageAccuracy || null,
          averageScore: response.data.averageScore || 0,
          averagePercentile: response.data.averagePercentile || null,
        });
      } else {
        setError(response.data.message || 'No analysis data available.');
      }
    } catch (err) {
      console.error('Error fetching analysis data:', err.response?.data || err.message);
      setError(`Failed to fetch analysis data: ${err.message}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamDetails = async () => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = 'https://lunarsenterprises.com:6028';
    if (!Bearer) {
      Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'Please log in again.',
        confirmButtonText: 'Login',
      }).then(() => navigate('/login'));
      return;
    }

    try {
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/submission/list`,
        headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
        method: 'GET',
        timeout: 10000,
      });

      console.log('Exam List Response:', JSON.stringify(response.data, null, 2));
      let exam = null;
      if (response.data.data && Array.isArray(response.data.data)) {
        exam = response.data.data.find(ex => parseInt(ex.se_id) === parseInt(submittedExamId));
        console.log('Matching exam for submittedExamId:', submittedExamId, 'Found:', exam);
      }

      if (exam) {
        setExamDetails(exam);
      } else {
        console.log('No matching exam found in list. Available exams:', response.data.data);
        // Not fatal, proceed with analysis data
      }
    } catch (err) {
      console.error('Error fetching exam details:', err.response?.data || err.message);
      // Not fatal
    }
  };

  const safeParse = (jsonStr) => {
    try {
      if (typeof jsonStr !== 'string' || !jsonStr) {
        return [];
      }
      return JSON.parse(jsonStr);
    } catch (e) {
      return [];
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'solution') {
      navigate(`/exam/result/${submittedExamId}`, { state: { submittedExamId } });
    }
  };

  if (loading) {
    return (
      <div className="analysis-container" style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ display: 'inline-block' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <p style={{ marginTop: '10px', color: '#333' }}>Loading Analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-container" style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
        <p>{error}</p>
        <button
          onClick={() => { fetchAnalysisData(); fetchExamDetails(); }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          Retry
        </button>
        <button
          onClick={() => navigate('/exam')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
            marginLeft: '10px',
          }}
        >
          Back to Exams
        </button>
      </div>
    );
  }

  if (analysisData.length === 0) {
    return (
      <div className="analysis-container" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
        <p>No analysis data available for this exam.</p>
        <button onClick={() => navigate('/exam')} style={{ color: '#007bff', border: 'none', background: 'none', cursor: 'pointer' }}>
          Back to Exams
        </button>
      </div>
    );
  }

  // Prepare data for charts
  const performanceData = [
    { name: 'Correct', value: summaryData.correctQuestions || 0 },
    { name: 'Incorrect', value: summaryData.incorrectAnswers || 0 },
    { name: 'Unanswered', value: summaryData.unanswered || 0 },
  ];

  const bellCurveData = [
    { rank: 0, performance: 0 },
    { rank: 25, performance: 20 },
    { rank: 50, performance: 50 },
    { rank: 75, performance: 30 },
    { rank: 100, performance: 10 },
  ].map(point => ({
    ...point,
    yourRank: point.rank === (summaryData.rank || 50) ? 1 : 0,
  }));

  const COLORS = ['#28a745', '#dc3545', '#ffc107'];

  return (
    <div className="analysis-container">
      {/* Header */}
      <div className="header-section">
        {examDetails && (
          <>
            <h3 className="exam-name">{examDetails.ex_name || 'N/A'}</h3>
            <p className="exam-details">Score: {examDetails.se_score || summaryData?.totalScore || 'N/A'}/{examDetails.ex_total_questions || analysisData.length}</p>
            <p className="exam-details">Duration: {examDetails.se_duration || summaryData?.timeTaken || 'N/A'}</p>
            <p className="exam-details">Submitted: {examDetails.se_created_at ? new Date(examDetails.se_created_at).toLocaleString() : 'N/A'}</p>
          </>
        )}
        <p className="current-date">{currentDate} - Online Mode</p>
        <div className="tab-buttons">
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
            onClick={() => handleTabClick('analysis')}
            className={activeTab === 'analysis' ? 'active-tab' : ''}
          >
            Analysis
          </button>
          <button
            onClick={() => handleTabClick('solution')}
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
              transition: 'all 0.3s ease',
              opacity: activeTab === 'solution' ? 1 : 0.85,
              transform: activeTab === 'solution' ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            Solution
          </button>
        </div>
      </div>

      {/* Your Ranking */}
      <div className="card-section">
        <h4>Your ranking</h4>
        <div className="ranking-box">
          <p>Your Test Rank #{summaryData?.rank || 'N/A'}/{examMetadata.totalParticipants}</p>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="card-section">
        <h4>Performance Overview</h4>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-label">Total Score</div>
            <div className="metric-value">{summaryData?.totalScore || 0}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Attempted Questions</div>
            <div className="metric-value">{summaryData?.attemptedQuestions || 0}/{analysisData.length}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Percent %</div>
            <div className="metric-value">{summaryData?.percentCorrect || 0}%</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Overall Rank</div>
            <div className="metric-value">N/A</div>
          </div>
        </div>
        <div className="performance-visual">
          <div className="performance-bar-container">
            <div className="bar-labels">
              <span>Bad Performance</span>
              <span>Average</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
            <div className="performance-bar"></div>
          </div>
          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="pie-legend">
          <span style={{ color: COLORS[0] }}>Correct</span>
          <span style={{ color: COLORS[1] }}>Incorrect</span>
          <span style={{ color: COLORS[2] }}>Unanswered</span>
        </div>
      </div>

      {/* Time Summary */}
      <div className="card-section">
        <h4>Time Summary</h4>
        <div className="time-metrics-grid">
          <div className="time-metric-item">
            <div className="metric-label">Total time taken</div>
            <div className="metric-value">{summaryData?.timeTaken || '0:00 min'}</div>
            <div className="time-icon">⏱️</div>
          </div>
          <div className="time-metric-item">
            <div className="metric-label">Average time/ques</div>
            <div className="metric-value">{summaryData?.avgTimePerQuestion || '0 sec'}</div>
            <div className="time-icon">⏱️</div>
          </div>
        </div>
        <div className="time-breakdown">
          <div>Correct: {summaryData?.correctQuestions > 0 ? `${Math.round((analysisData.length * parseInt(summaryData.avgTimePerQuestion.split(' ')[0]) / summaryData.correctQuestions))} sec/ques` : '0 sec/ques'}</div>
          <div>Incorrect: {summaryData?.incorrectAnswers > 0 ? `${Math.round((analysisData.length * parseInt(summaryData.avgTimePerQuestion.split(' ')[0]) / summaryData.incorrectAnswers))} sec/ques` : '0 sec/ques'}</div>
          <div>Skipped: {summaryData?.unanswered > 0 ? `${Math.round((analysisData.length * parseInt(summaryData.avgTimePerQuestion.split(' ')[0]) / summaryData.unanswered))} sec/ques` : '0 sec/ques'}</div>
        </div>
      </div>

      {/* You vs Others */}
      <div className="card-section">
        <h4>You vs Others</h4>
        <p className="section-description">Drag the rank pointer along the bell-curve to check your rank.</p>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
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
        <p className="rank-summary">You were ranked {summaryData?.rank || 'N/A'} in this test. You're doing better than {summaryData?.percentile || 'N/A'}% of learners who appeared in this test.</p>
        <div className="your-stats">
          <div><strong>You</strong></div>
          <div>Rank: {summaryData?.rank || 'N/A'}</div>
          <div>Correct: {summaryData?.correctQuestions || 0}</div>
          <div>Accuracy: {summaryData?.accuracy || 0}%</div>
          <div>Marks: {summaryData?.totalScore || 0}</div>
          <div>Percentile: {summaryData?.percentile || 'N/A'}%</div>
        </div>
      </div>

      <style jsx>{`
        .analysis-container {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-section {
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .exam-name {
          margin: 0 0 10px;
          color: #2c3e50;
        }

        .exam-details {
          margin: 0 0 5px;
          color: #6c757d;
        }

        .current-date {
          margin: 0 0 15px;
          color: #6c757d;
        }

        .tab-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tab-buttons button {
          background: none;
          color: #007bff;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          border-radius: 4px;
        }

        .active-tab {
          background: #007bff;
          color: white !important;
        }

        .more-info {
          background: none !important;
          color: #007bff !important;
        }

        .card-section {
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .card-section h4 {
          margin: 0 0 15px;
          color: #2c3e50;
        }

        .ranking-box {
          background-color: #e9f0f8;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
        }

        .ranking-box p {
          margin: 0;
          font-size: 16px;
          color: #007bff;
        }

        .metrics-grid, .time-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .metric-item, .time-metric-item {
          text-align: center;
        }

        .metric-label {
          font-size: 12px;
          color: #6c757d;
        }

        .metric-value {
          font-size: 18px;
          font-weight: bold;
        }

        .time-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #e9ecef;
          margin: 5px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .performance-visual {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .performance-bar-container {
          flex: 1;
          min-width: 200px;
        }

        .bar-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 5px;
        }

        .performance-bar {
          height: 10px;
          background: linear-gradient(to right, #dc3545 0%, #dc3545 25%, #ffc107 25%, #ffc107 50%, #28a745 50%, #28a745 100%);
          border-radius: 5px;
        }

        .pie-chart-container {
          flex-shrink: 0;
          width: 120px;
          height: 120px;
        }

        .pie-legend {
          display: flex;
          justify-content: space-around;
          margin-top: 10px;
          font-size: 12px;
          color: #6c757d;
          gap: 20px;
        }

        .time-breakdown {
          display: flex;
          justify-content: space-around;
          color: #6c757d;
          flex-wrap: wrap;
          gap: 10px;
        }

        .time-breakdown div {
          font-size: 12px;
        }

        .section-description {
          margin: 0 0 15px;
          color: #6c757d;
          font-size: 14px;
        }

        .chart-container {
          width: 100%;
          height: 200px;
        }

        .rank-summary {
          margin: 10px 0;
          color: #6c757d;
          text-align: center;
          font-size: 14px;
        }

        .your-stats {
          margin-top: 10px;
          font-size: 12px;
        }

        .your-stats div:first-child {
          color: #007bff;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .your-stats > div:not(:first-child) {
          margin-bottom: 2px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .analysis-container {
            padding: 10px;
          }

          .tab-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .tab-buttons button {
            flex: 1;
            margin-bottom: 5px;
          }

          .performance-visual {
            flex-direction: column;
            align-items: center;
          }

          .bar-labels {
            justify-content: space-around;
          }

          .metrics-grid, .time-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .time-breakdown {
            flex-direction: column;
            align-items: center;
          }

          .pie-legend {
            justify-content: center;
            gap: 20px;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid, .time-metrics-grid {
            grid-template-columns: 1fr;
          }

          .bar-labels span {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default Analysis;
