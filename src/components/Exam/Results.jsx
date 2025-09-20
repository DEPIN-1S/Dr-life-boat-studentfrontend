

// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { FaCheck, FaTimes, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
// import axios from 'axios';
// import Swal from 'sweetalert2';

// const Results = () => {
//   const navigate = useNavigate();
//   const { seExamId } = useParams();
//   const location = useLocation();
//   const { state } = location;
//   const submittedExamId = state?.submittedExamId || seExamId;
//   const [examDetails, setExamDetails] = useState(null);
//   const [examInfo, setExamInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showSolutions, setShowSolutions] = useState({});
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [activeTab, setActiveTab] = useState('analysis');

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     if (!submittedExamId) {
//       console.log('Submitted Exam ID is missing');
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Access',
//         text: 'Please select a valid submitted exam.',
//       }).then(() => navigate('/exam'));
//       return;
//     }

//     const cachedResults = sessionStorage.getItem(`examResults_${submittedExamId}`);
//     if (cachedResults) {
//       setExamDetails(JSON.parse(cachedResults));
//       setLoading(false);
//     }

//     fetchExamDetails();
//     fetchExamInfo();
//   }, [submittedExamId, navigate]);

//   const fetchExamDetails = async () => {
//     const Bearer = sessionStorage.getItem('token');
//     const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';
//     setLoading(true);

//     try {
//       const response = await axios({
//         url: `${baseUrl}/drlifeboat/student/exam/submission/data`,
//         headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
//         data: { submittedExam_id: parseInt(submittedExamId) },
//         method: 'POST',
//       });

//       console.log('Full API Response:', response.data);
//       if (response.data.result) {
//         const parsedData = response.data.data.map(q => {
//           q.q_options = safeParse(q.q_options);
//           q.q_answer = safeParse(q.q_answer);
//           q.ea_answer = safeParse(q.ea_answer);
//           q.q_answer_explanation = safeParseExplanation(q.q_answer_explanation);
//           q.q_option_explanation = safeParseExplanation(q.q_option_explanation);
//           return q;
//         });
//         setExamDetails(parsedData);
//         sessionStorage.setItem(`examResults_${submittedExamId}`, JSON.stringify(parsedData));
//         console.log('Exam Details:', parsedData);
//       } else {
//         Swal.fire({ icon: 'error', title: 'Error', text: response.data.message || 'Failed to fetch exam results' });
//         navigate('/exam');
//       }
//     } catch (err) {
//       console.error('Error fetching exam details:', err);
//       Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch exam results. Please try again later.' });
//       navigate('/exam');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchExamInfo = async () => {
//     const Bearer = sessionStorage.getItem('token');
//     const baseUrl = 'https://lunarsenterprises.com:6028'; // Consistent with provided snippet
//     try {
//       const response = await axios({
//         url: `${baseUrl}/drlifeboat/student/exam/submission/list`,
//         headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
//         method: 'GET',
//       });
//       if (response.data.result) {
//         const exams = response.data.data || [];
//         const matchingExam = exams.find(exam => exam.se_id === parseInt(submittedExamId));
//         if (matchingExam) {
//           setExamInfo(matchingExam);
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching exam info:', err);
//     }
//   };

//   const safeParse = (jsonStr) => {
//     try {
//       if (typeof jsonStr !== 'string' || !jsonStr) return [];
//       return JSON.parse(jsonStr);
//     } catch (e) {
//       console.error('Failed to parse JSON:', jsonStr, e);
//       return [];
//     }
//   };

//   const safeParseExplanation = (str) => {
//     if (typeof str !== 'string' || !str) return '';
//     try {
//       const parsed = JSON.parse(str);
//       if (Array.isArray(parsed)) {
//         return parsed.join('\n');
//       }
//       return str;
//     } catch (e) {
//       return str;
//     }
//   };

//   const parseTime = (timeStr) => {
//     const [mins, secs] = timeStr.split(':').map(Number);
//     return mins * 60 + secs;
//   };

//   const toggleSolution = (index) => {
//     setShowSolutions((prev) => ({ ...prev, [index]: !prev[index] }));
//   };

//   const goToQuestion = (questionIndex) => setCurrentQuestion(questionIndex);
//   const goNext = () => currentQuestion < (examDetails?.length - 1) && setCurrentQuestion(currentQuestion + 1);
//   const goPrevious = () => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1);

//   if (loading) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', fontFamily: "'Segoe UI', sans-serif" }}>
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
//           <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
//           <span>Loading Results...</span>
//         </div>
//       </div>
//     );
//   }

//   if (!examDetails || examDetails.length === 0) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif", padding: '20px' }}>
//         <h2 style={{ color: '#333', marginBottom: '20px' }}>Results temporarily unavailable</h2>
//         <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
//           <button onClick={fetchExamDetails} style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease' }}>Retry</button>
//           <button onClick={() => navigate('/exam')} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease' }}>Back to Exams</button>
//         </div>
//       </div>
//     );
//   }

//   const userCorrectCount = examDetails.filter((q) => q.ea_correct === 1).length || 0;
//   const attemptedQuestions = examDetails.filter((q) => q.ea_answer.length > 0).length || 0;
//   const incorrectAnswers = attemptedQuestions - userCorrectCount;
//   const unanswered = examDetails.length - attemptedQuestions;
//   const totalScore = examDetails.reduce((sum, q) => sum + parseFloat(q.ea_mark || 0), 0);
//   const userScore = examDetails.length > 0 ? ((userCorrectCount / examDetails.length) * 100).toFixed(2) : 0;
//   const accuracy = attemptedQuestions > 0 ? ((userCorrectCount / attemptedQuestions) * 100).toFixed(2) : 0;

//   const correctTime = examDetails.reduce((sum, q) => q.ea_correct === 1 ? sum + (q.ea_time_taken ? parseTime(q.ea_time_taken) : 0) : sum, 0);
//   const incorrectTime = examDetails.reduce((sum, q) => (q.ea_answer.length > 0 && q.ea_correct !== 1) ? sum + (q.ea_time_taken ? parseTime(q.ea_time_taken) : 0) : sum, 0);
//   const skippedTime = examDetails.reduce((sum, q) => q.ea_answer.length === 0 ? sum + (q.ea_time_taken ? parseTime(q.ea_time_taken) : 0) : sum, 0);
//   const timeTakenSeconds = correctTime + incorrectTime + skippedTime;
//   const timeTaken = timeTakenSeconds / 60;
//   const timeTakenStr = `${Math.floor(timeTaken)}:${(timeTaken % 1 * 60).toFixed(0).padStart(2, '0')}`;
//   const avgTimePerQuestion = examDetails.length > 0 ? Math.round(timeTakenSeconds / examDetails.length) : 0;

//   // Replace with real data from API
//   const percentile = 55.67;
//   const totalRank = 115;
//   const totalParticipants = 245;

//   const currentDateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

//   const performanceData = [
//     { name: 'Correct', value: userCorrectCount, fill: '#28a745' },
//     { name: 'Incorrect', value: incorrectAnswers, fill: '#dc3545' },
//     { name: 'Unanswered', value: unanswered, fill: '#fd7e14' },
//   ];

//   const bellCurveData = [
//     { rank: 0, performance: 0 },
//     { rank: 25, performance: 20 },
//     { rank: 50, performance: 50 },
//     { rank: 75, performance: 30 },
//     { rank: 100, performance: 10 },
//   ].map(point => ({
//     ...point,
//     yourRank: point.rank === (totalRank || 50) ? 1 : 0,
//   }));

//   const question = examDetails[currentQuestion];
//   const isCorrect = question.ea_correct === 1;
//   const parsedOptions = question.q_options || [];
//   const parsedCorrectAnswers = question.q_answer || [];
//   const parsedSubmittedAnswers = question.ea_answer || [];
//   const parsedAnswerExplanation = question.q_answer_explanation || '';
//   const parsedOptionExplanation = question.q_option_explanation || '';

//   const scoreColor = userScore >= 80 ? '#28a745' : userScore >= 50 ? '#ffc107' : '#dc3545';

//   return (
//     <>
//       {isMobile && (
//         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 1000, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e9ecef' }}>
//           <button onClick={goPrevious} disabled={currentQuestion === 0} style={{ background: 'none', border: 'none', color: currentQuestion === 0 ? '#ccc' : '#007bff', fontSize: '18px', cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer', padding: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}><FaChevronLeft /><span style={{ fontSize: '14px', fontWeight: '500' }}>Prev</span></button>
//           <button onClick={() => navigate('/exam')} style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Back to Exams</button>
//           <button onClick={goNext} disabled={currentQuestion === examDetails.length - 1} style={{ background: 'none', border: 'none', color: currentQuestion === examDetails.length - 1 ? '#ccc' : '#007bff', fontSize: '18px', cursor: currentQuestion === examDetails.length - 1 ? 'not-allowed' : 'pointer', padding: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ fontSize: '14px', fontWeight: '500' }}>Next</span><FaChevronRight /></button>
//         </div>
//       )}

//       <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '100px 15px 80px 15px' : '20px 20px 80px 20px', minHeight: '100vh' }}>
//         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '10px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '10px', maxWidth: '400px', margin: '0 auto 30px' }}>
//           <button onClick={() => setActiveTab('analysis')} style={{ flex: 1, padding: '12px 20px', border: 'none', backgroundColor: activeTab === 'analysis' ? '#007bff' : 'transparent', color: activeTab === 'analysis' ? 'white' : '#495057', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease' }}>Analysis</button>
//           <button onClick={() => setActiveTab('detailed')} style={{ flex: 1, padding: '12px 20px', border: 'none', backgroundColor: activeTab === 'detailed' ? '#007bff' : 'transparent', color: activeTab === 'detailed' ? 'white' : '#495057', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease' }}>Detailed View</button>
//         </div>

//         {activeTab === 'analysis' && (
//           <div style={{ marginBottom: '40px' }}>
//             <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
//               <h2 style={{ margin: 0, color: '#212529', fontSize: '24px', textAlign: 'center' }}> {examInfo?.ex_name}</h2>
//               <p style={{ margin: '10px 0 0', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>{currentDateTime} </p>
//             </div>

//             {examInfo && (
//               <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
//                 <h3 style={{ margin: 0, color: '#212529', fontSize: '20px' }}>{examInfo.ex_name}</h3>
//                 <p style={{ margin: '10px 0 0', color: '#6c757d', fontSize: '14px' }}>Score: {examInfo.se_score || 'N/A'}/{examInfo.ex_total_questions || 'N/A'}</p>
//                 <p style={{ margin: '5px 0 0', color: '#6c757d', fontSize: '14px' }}>Duration: {examInfo.se_duration || 'N/A'}</p>
//                 <p style={{ margin: '5px 0 0', color: '#6c757d', fontSize: '14px' }}>Submitted: {new Date(examInfo.se_created_at).toLocaleString()}</p>
//               </div>
//             )}

//             <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #dee2e6', textAlign: 'center' }}>
//               <h3 style={{ margin: '0 0 10px', color: '#495057' }}>Your Ranking</h3>
//               <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>#{totalRank}/{totalParticipants}</div>
//               <button style={{ background: 'none', border: '1px solid #007bff', color: '#007bff', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>MORE INFO ></button>
//             </div>
//             <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #dee2e6' }}>
//               <h3 style={{ margin: '0 0 20px', color: '#495057' }}>Performance Overview</h3>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '20px' }}>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: scoreColor }}>{userScore}%</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Score</div></div>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{attemptedQuestions}/{examDetails.length}</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Attempted Questions</div></div>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{percentile}%</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Percentile</div></div>
//               </div>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '20px', marginBottom: '20px' }}>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>{accuracy}%</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Accuracy</div></div>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>{timeTakenStr}</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Time Taken</div></div>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>N/A</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Overall Rank</div></div>
//               </div>
//               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
//                 <div style={{ flex: 1, height: '8px', backgroundColor: '#dc3545', borderRadius: '4px' }}></div><span style={{ margin: '0 10px', fontSize: '12px' }}>Bad</span>
//                 <div style={{ flex: 1.5, height: '8px', backgroundColor: '#ffc107', borderRadius: '4px' }}></div><span style={{ margin: '0 10px', fontSize: '12px' }}>Average</span>
//                 <div style={{ flex: 1.5, height: '8px', backgroundColor: '#28a745', borderRadius: '4px' }}></div><span style={{ margin: '0 10px', fontSize: '12px' }}>Good</span>
//                 <div style={{ flex: 1, height: '8px', backgroundColor: '#20c997', borderRadius: '4px' }}></div><span style={{ fontSize: '12px' }}>Excellent</span>
//               </div>
//               <div style={{ height: 200, marginBottom: '20px' }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={performanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
//                       {performanceData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.fill} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#6c757d' }}>
//                 <span><FaCheck style={{ color: '#28a745', marginRight: '5px' }} />Correct</span>
//                 <span><FaTimes style={{ color: '#dc3545', marginRight: '5px' }} />Incorrect</span>
//                 <span style={{ color: '#fd7e14' }}><FaLock style={{ marginRight: '5px' }} />Unanswered</span>
//               </div>
//             </div>
//             <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #dee2e6' }}>
//               <h3 style={{ margin: '0 0 20px', color: '#495057' }}>Time Summary</h3>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{timeTakenStr}</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Total time taken</div></div>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{avgTimePerQuestion} sec</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Average time/q</div></div>
//               </div>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>{userCorrectCount > 0 ? Math.round(correctTime / userCorrectCount) : 0} sec/q</div><div style={{ fontSize: '12px', color: '#6c757d' }}>CORRECT</div></div>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>{incorrectAnswers > 0 ? Math.round(incorrectTime / incorrectAnswers) : 0} sec/q</div><div style={{ fontSize: '12px', color: '#6c757d' }}>INCORRECT</div></div>
//                 <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>{unanswered > 0 ? Math.round(skippedTime / unanswered) : 0} sec/q</div><div style={{ fontSize: '12px', color: '#6c757d' }}>SKIPPED</div></div>
//               </div>
//             </div>
//             <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #dee2e6' }}>
//               <h3 style={{ margin: '0 0 20px', color: '#495057' }}>You vs Others</h3>
//               <div style={{ height: 200, marginBottom: '20px' }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={bellCurveData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="rank" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Line type="monotone" dataKey="performance" stroke="#007bff" activeDot={{ r: 8 }} />
//                     <Line type="monotone" dataKey="yourRank" stroke="#ffc107" dot={{ r: 6 }} activeDot={{ r: 8 }} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'detailed' && (
//           <div>
//             <div style={{ marginBottom: '30px', position: 'relative' }}>
//               <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '10px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//                 {examDetails.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => goToQuestion(index)}
//                     style={{
//                       width: '40px',
//                       height: '40px',
//                       border: currentQuestion === index ? '3px solid #007bff' : '2px solid #ddd',
//                       borderRadius: '50%',
//                       background: examDetails[index].ea_correct === 1 ? '#28a745' : '#dc3545',
//                       color: 'white',
//                       cursor: 'pointer',
//                       fontSize: '14px',
//                       fontWeight: 'bold',
//                       flexShrink: 0,
//                       transition: 'all 0.3s ease',
//                       boxShadow: currentQuestion === index ? '0 0 0 2px rgba(0,123,255,0.25)' : 'none',
//                     }}
//                   >
//                     {index + 1}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '20px' : '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '20px', border: '1px solid #e9ecef' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f1f3f4' }}>
//                 <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>QUESTION {currentQuestion + 1} OF {examDetails.length}</div>
//                 <div style={{ marginLeft: 'auto' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isCorrect ? '#e8f5e8' : '#ffeaea', border: `2px solid ${isCorrect ? '#28a745' : '#dc3545'}` }}>
//                     {isCorrect ? <FaCheck style={{ color: '#28a745', fontSize: '16px' }} /> : <FaTimes style={{ color: '#dc3545', fontSize: '16px' }} />}
//                   </div>
//                 </div>
//               </div>

//               <div style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.7', color: '#2c3e50', marginBottom: '30px', whiteSpace: 'pre-line', fontWeight: '500' }}>
//                 {question.q_question || ''}
//               </div>

//               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
//                 {parsedOptions.map((option, idx) => {
//                   const isOptionCorrect = parsedCorrectAnswers.includes(option);
//                   const isOptionSelected = parsedSubmittedAnswers.includes(option);

//                   let backgroundColor = '#f8f9fa';
//                   let borderColor = '#dee2e6';
//                   let textColor = '#333';

//                   if (isOptionCorrect) {
//                     backgroundColor = '#d4edda';
//                     borderColor = '#28a745';
//                     textColor = '#155724';
//                   } else if (isOptionSelected && !isOptionCorrect) {
//                     backgroundColor = '#f8d7da';
//                     borderColor = '#dc3545';
//                     textColor = '#721c24';
//                   }

//                   let label = '';
//                   let labelColor = isOptionCorrect ? '#28a745' : '#dc3545';
//                   if (isOptionSelected) {
//                     label = isOptionCorrect ? 'Your Correct Answer' : 'Your Incorrect Answer';
//                   } else if (isOptionCorrect) {
//                     label = 'Correct Answer';
//                   }

//                   return (
//                     <div
//                       key={idx}
//                       style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '8px', border: `2px solid ${borderColor}`, backgroundColor, color: textColor }}
//                     >
//                       <span
//                         style={{
//                           width: '24px',
//                           height: '24px',
//                           borderRadius: '50%',
//                           backgroundColor: isOptionCorrect ? '#28a745' : isOptionSelected ? '#dc3545' : '#6c757d',
//                           color: 'white',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           fontSize: '12px',
//                           fontWeight: 'bold',
//                           flexShrink: 0,
//                         }}
//                       >
//                         {String.fromCharCode(65 + idx)}
//                       </span>
//                       <span style={{ flex: 1 }}>{option}</span>
//                       {label && <span style={{ fontSize: '12px', color: labelColor, fontWeight: '500' }}>{label}</span>}
//                     </div>
//                   );
//                 })}
//               </div>

//               <button onClick={() => toggleSolution(currentQuestion)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '12px 20px', borderRadius: '25px', marginBottom: '25px', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}><FaLock size={14} />{showSolutions[currentQuestion] ? 'Hide Solution' : 'Show Solution'}</button>

//               {showSolutions[currentQuestion] && (
//                 <div style={{ backgroundColor: '#f8f9ff', padding: '25px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e0e7ff', borderLeft: '4px solid #667eea' }}>
//                   <h4 style={{ color: '#4c63d2', marginBottom: '15px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>💡 Solution Explanation</h4>
//                   <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#4a5568', whiteSpace: 'pre-line' }}>
//                     {parsedAnswerExplanation}
//                     {parsedOptionExplanation && (<><br /><br /><strong>Option Analysis:</strong><br />{parsedOptionExplanation}</>)}
//                   </div>
//                 </div>
//               )}

//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#f8f9fa', borderRadius: '10px', border: '1px solid #e9ecef' }}>
//                 <span style={{ fontSize: '14px', fontWeight: '600', color: '#495057' }}>Marks Obtained:</span>
//                 <span style={{ fontSize: '16px', fontWeight: 'bold', color: isCorrect ? '#28a745' : '#dc3545', backgroundColor: 'white', padding: '5px 12px', borderRadius: '20px', border: `1px solid ${isCorrect ? '#28a745' : '#dc3545'}` }}>{parseFloat(question.ea_mark || 0).toFixed(2)}</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {!isMobile && (
//         <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', zIndex: 1000, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e9ecef' }}>
//           <button onClick={goPrevious} disabled={currentQuestion === 0} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '25px', border: '2px solid #e9ecef', backgroundColor: currentQuestion === 0 ? '#f8f9fa' : 'white', color: currentQuestion === 0 ? '#adb5bd' : '#495057', cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'all 0.3s ease' }}><FaChevronLeft size={12} />Previous</button>
//           <button onClick={() => navigate('/exam')} style={{ padding: '12px 30px', borderRadius: '25px', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)', transition: 'all 0.3s ease' }}>Back to Exams</button>
//           <button onClick={goNext} disabled={currentQuestion === examDetails.length - 1} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '25px', border: 'none', backgroundColor: currentQuestion === examDetails.length - 1 ? '#adb5bd' : '#007bff', color: 'white', cursor: currentQuestion === examDetails.length - 1 ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'all 0.3s ease' }}>Next<FaChevronRight size={12} /></button>
//         </div>
//       )}

//       <style>
//         {`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }

//           /* Hide scrollbar for question navigation */
//           div::-webkit-scrollbar {
//             display: none;
//           }

//           /* Responsive improvements */
//           @media (max-width: 768px) {
//             .question-nav {
//               padding: 5px 0;
//             }
//           }

//           /* Smooth transitions */
//           * {
//             box-sizing: border-box;
//           }

//           button:hover:not(:disabled) {
//             transform: translateY(-1px);
//             box-shadow: 0 6px 20px rgba(0,0,0,0.15);
//           }
//         `}
//       </style>
//     </>
//   );
// };

// export default Results;


import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaCheck, FaTimes, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';
import Swal from 'sweetalert2';

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
    // Handle q_question as array or split string
    if (Array.isArray(q.q_question)) {
      // Already array
    } else if (typeof q.q_question === 'string') {
      q.q_question = q.q_question.split(/\r?\n/).filter(line => line.trim());
    }

    // Handle question_images
    if (q.question_images) {
      q.questionImages = q.question_images.split(',').map(img => img.trim()).filter(Boolean);
    }

    // Handle explanation_images
    if (q.explanation_images) {
      q.explanationImages = q.explanation_images.split(',').map(img => img.trim()).filter(Boolean);
    }

    // Handle ruleout_images
    if (q.ruleout_images) {
      q.ruleoutImages = q.ruleout_images.split(',').map(img => img.trim()).filter(Boolean);
    }

    // Handle q_options - object with key to array
    q.q_options = safeParseOptions(q.q_options);

    // Handle q_answer
    q.q_answer = safeParse(q.q_answer);

    // Handle ea_answer
    q.ea_answer = safeParse(q.ea_answer);

    // Handle explanations
    q.q_answer_explanation = safeParseExplanation(q.q_answer_explanation);
    q.q_option_explanation = safeParseExplanation(q.q_option_explanation);

    return q;
  };

  const fetchExamDetails = async () => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';
    setLoading(true);

    try {
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/submission/data`,
        headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
        data: { submittedExam_id: parseInt(submittedExamId) },
        method: 'POST',
      });

      console.log('Full API Response:', response.data);
      if (response.data.result) {
        const parsedData = response.data.data.map(q => processQuestionData(q));
        setExamDetails(parsedData);
        sessionStorage.setItem(`examResults_${submittedExamId}`, JSON.stringify(parsedData));
        console.log('Exam Details:', parsedData);
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

  const fetchExamInfo = async () => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = 'https://lunarsenterprises.com:6028';
    try {
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/submission/list`,
        headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
        method: 'GET',
      });
      if (response.data.result) {
        const exams = response.data.data || [];
        const matchingExam = exams.find(exam => exam.se_id === parseInt(submittedExamId));
        if (matchingExam) {
          setExamInfo(matchingExam);
        }
      }
    } catch (err) {
      console.error('Error fetching exam info:', err);
    }
  };

  const safeParse = (jsonStr) => {
    try {
      if (typeof jsonStr !== 'string' || !jsonStr) return [];
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse JSON:', jsonStr, e);
      return [];
    }
  };

  const safeParseOptions = (jsonStr) => {
    try {
      if (typeof jsonStr !== 'string' || !jsonStr) return [];
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        // Assume structure { "key": [options] }, take the array from first key
        const optionsArray = Object.values(parsed)[0] || [];
        return Array.isArray(optionsArray) ? optionsArray : [];
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse options JSON:', jsonStr, e);
      return [];
    }
  };

  const safeParseExplanation = (str) => {
    if (typeof str !== 'string' || !str) return '';
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.join('\n');
      }
      return str;
    } catch (e) {
      return str;
    }
  };

  const parseTime = (timeStr) => {
    const [mins, secs] = timeStr.split(':').map(Number);
    return mins * 60 + secs;
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
  const totalScore = examDetails.reduce((sum, q) => sum + parseFloat(q.ea_mark || 0), 0);
  const userScore = examDetails.length > 0 ? ((userCorrectCount / examDetails.length) * 100).toFixed(2) : 0;
  const accuracy = attemptedQuestions > 0 ? ((userCorrectCount / attemptedQuestions) * 100).toFixed(2) : 0;

  const correctTime = examDetails.reduce((sum, q) => q.ea_correct === 1 ? sum + (q.ea_time_taken ? parseTime(q.ea_time_taken) : 0) : sum, 0);
  const incorrectTime = examDetails.reduce((sum, q) => (q.ea_answer.length > 0 && q.ea_correct !== 1) ? sum + (q.ea_time_taken ? parseTime(q.ea_time_taken) : 0) : sum, 0);
  const skippedTime = examDetails.reduce((sum, q) => q.ea_answer.length === 0 ? sum + (q.ea_time_taken ? parseTime(q.ea_time_taken) : 0) : sum, 0);
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
  const parsedCorrectAnswers = question.q_answer || [];
  const parsedSubmittedAnswers = question.ea_answer || [];
  const parsedAnswerExplanation = question.q_answer_explanation || '';
  const parsedOptionExplanation = question.q_option_explanation || '';
  const questionLines = Array.isArray(question?.q_question) ? question.q_question : (typeof question?.q_question === 'string' ? question.q_question.split(/\r?\n/).filter(line => line.trim()) : []);
  const questionImages = question?.questionImages || [];
  const explanationImages = question?.explanationImages || [];
  const ruleoutImages = question?.ruleoutImages || [];

  const scoreColor = userScore >= 80 ? '#28a745' : userScore >= 50 ? '#ffc107' : '#dc3545';

  const baseurl = 'https://lunarsenterprises.com:6028/';

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
          <button onClick={() => setActiveTab('detailed')} style={{ flex: 1, padding: '12px 20px', border: 'none', backgroundColor: activeTab === 'detailed' ? '#007bff' : 'transparent', color: activeTab === 'detailed' ? 'white' : '#495057', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease' }}>Detailed View</button>
        </div>

        {activeTab === 'analysis' && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
              <h2 style={{ margin: 0, color: '#212529', fontSize: '24px', textAlign: 'center' }}> {examInfo?.ex_name}</h2>
              <p style={{ margin: '10px 0 0', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>{currentDateTime} </p>
            </div>

            {examInfo && (
              <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
                <h3 style={{ margin: 0, color: '#212529', fontSize: '20px' }}>{examInfo.ex_name}</h3>
                <p style={{ margin: '10px 0 0', color: '#6c757d', fontSize: '14px' }}>Score: {examInfo.se_score || 'N/A'}/{examInfo.ex_total_questions || 'N/A'}</p>
                <p style={{ margin: '5px 0 0', color: '#6c757d', fontSize: '14px' }}>Duration: {examInfo.se_duration || 'N/A'}</p>
                <p style={{ margin: '5px 0 0', color: '#6c757d', fontSize: '14px' }}>Submitted: {new Date(examInfo.se_created_at).toLocaleString()}</p>
              </div>
            )}

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #dee2e6', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px', color: '#495057' }}>Your Ranking</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>#{totalRank}/{totalParticipants}</div>
              <button style={{ background: 'none', border: '1px solid #007bff', color: '#007bff', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>MORE INFO ></button>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #dee2e6' }}>
              <h3 style={{ margin: '0 0 20px', color: '#495057' }}>Performance Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: scoreColor }}>{userScore}%</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Score</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{attemptedQuestions}/{examDetails.length}</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Attempted Questions</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{percentile}%</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Percentile</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>{accuracy}%</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Accuracy</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>{timeTakenStr}</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Time Taken</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>N/A</div><div style={{ fontSize: '12px', color: '#6c757d' }}>Overall Rank</div></div>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>{userCorrectCount > 0 ? Math.round(correctTime / userCorrectCount) : 0} sec/q</div><div style={{ fontSize: '12px', color: '#6c757d' }}>CORRECT</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>{incorrectAnswers > 0 ? Math.round(incorrectTime / incorrectAnswers) : 0} sec/q</div><div style={{ fontSize: '12px', color: '#6c757d' }}>INCORRECT</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>{unanswered > 0 ? Math.round(skippedTime / unanswered) : 0} sec/q</div><div style={{ fontSize: '12px', color: '#6c757d' }}>SKIPPED</div></div>
              </div>
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
            <div style={{ marginBottom: '30px', position: 'relative' }}>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '10px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {examDetails.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: currentQuestion === index ? '3px solid #007bff' : '2px solid #ddd',
                      borderRadius: '50%',
                      background: examDetails[index].ea_correct === 1 ? '#28a745' : '#dc3545',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                      boxShadow: currentQuestion === index ? '0 0 0 2px rgba(0,123,255,0.25)' : 'none',
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '20px' : '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '20px', border: '1px solid #e9ecef' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f1f3f4' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>QUESTION {currentQuestion + 1} OF {examDetails.length}</div>
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isCorrect ? '#e8f5e8' : '#ffeaea', border: `2px solid ${isCorrect ? '#28a745' : '#dc3545'}` }}>
                    {isCorrect ? <FaCheck style={{ color: '#28a745', fontSize: '16px' }} /> : <FaTimes style={{ color: '#dc3545', fontSize: '16px' }} />}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {questionLines.map((line, idx) => (
                  <p key={idx} style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.7', color: '#2c3e50', margin: '0', whiteSpace: 'pre-line', fontWeight: '500' }}>{line}</p>
                ))}
              </div>

              {questionImages.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '10px', fontSize: '16px' }}>Question Images:</h4>
                  {questionImages.map((imgPath, idx) => (
                    <img key={idx} src={`${baseurl}${imgPath}`} alt={`Question Image ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '10px' }} />
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                {parsedOptions.map((opt, idx) => {
                  const isOptionCorrect = parsedCorrectAnswers.includes(opt.option || opt);
                  const isOptionSelected = parsedSubmittedAnswers.includes(opt.option || opt);

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

                  const optionText = opt.option || opt; // Fallback if structure differs
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
                        <img src={`${baseurl}${optionImage}`} alt={`Option ${String.fromCharCode(65 + idx)} Image`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              <button onClick={() => toggleSolution(currentQuestion)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '12px 20px', borderRadius: '25px', marginBottom: '25px', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}><FaLock size={14} />{showSolutions[currentQuestion] ? 'Hide Solution' : 'Show Solution'}</button>

              {showSolutions[currentQuestion] && (
                <div style={{ backgroundColor: '#f8f9ff', padding: '25px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e0e7ff', borderLeft: '4px solid #667eea' }}>
                  <h4 style={{ color: '#4c63d2', marginBottom: '15px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>💡 Solution Explanation</h4>
                  <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#4a5568', whiteSpace: 'pre-line', marginBottom: '15px' }}>
                    {parsedAnswerExplanation}
                    {parsedOptionExplanation && (<><br /><br /><strong>Option Analysis:</strong><br />{parsedOptionExplanation}</>)}
                  </div>
                  {explanationImages.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <h5 style={{ color: '#4c63d2', marginBottom: '10px' }}>Explanation Images:</h5>
                      {explanationImages.map((imgPath, idx) => (
                        <img key={idx} src={`${baseurl}${imgPath}`} alt={`Explanation Image ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '10px' }} />
                      ))}
                    </div>
                  )}
                  {ruleoutImages.length > 0 && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
                      <h5 style={{ color: '#856404', marginBottom: '10px' }}>Rule Out Images:</h5>
                      {ruleoutImages.map((imgPath, idx) => (
                        <img key={idx} src={`${baseurl}${imgPath}`} alt={`Rule Out Image ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '5px' }} />
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
        `}
      </style>
    </>
  );
};

export default Results;
