// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { FaCheckCircle } from 'react-icons/fa';

// const SubmittedExams = () => {
//   const navigate = useNavigate();
//   const [exams, setExams] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchSubmittedExams();
//   }, []);

//   const fetchSubmittedExams = async () => {
//     const Bearer = sessionStorage.getItem('token');
//     try {
//       const response = await axios({
//         url: 'https://lunarsenterprises.com:6028/drlifeboat/student/exam/submission/list',
//         headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
//         method: 'GET',
//       });
//       if (response.data.result) {
//         setExams(response.data.data);
//       }
//     } catch (err) {
//       console.error('Error fetching submitted exams:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleExamClick = (exam) => {
//   //   navigate(`/exam/result/${exam.se_exam_id}`, { state: { submittedExamId: exam.se_exam_id } });
//   // };/

// const handleExamClick = (exam) => {
//   console.log('Navigating to:', `/exam/${exam.se_exam_id}/analysis`, exam); // Debug log
//   navigate(`/exam/${exam.se_exam_id}/analysis`, { state: { submittedExamId: exam.se_exam_id } });
// };

//   if (loading) {
//     return <div className="submitted-exams-container">Loading...</div>;
//   }

//   return (
//     <div className="submitted-exams-container">
//       <h2 className="submitted-exams-title">Submitted Exams</h2>
//       <div className="exams-grid">
//         {exams.length === 0 ? (
//           <p>No submitted exams.</p>
//         ) : (
//           exams.map((exam) => (
//             <div key={exam.se_id} className="exam-card" onClick={() => handleExamClick(exam)}>
//               <div className="completed-label">
//                 <FaCheckCircle className="check-icon" />
//                 Completed
//               </div>
//               <img
//                 src={`https://lunarsenterprises.com:6028/${exam.ex_file}`}
//                 alt={exam.ex_name}
//                 className="exam-image"
//               />
//               <div className="exam-info">
//                 <h3 className="exam-name">{exam.ex_name}</h3>
//                 <p className="exam-details">Score: {exam.se_score}/{exam.ex_total_questions}</p>
//                 <p className="exam-details">Duration: {exam.se_duration}</p>
//                 <p className="exam-details">Submitted: {new Date(exam.se_created_at).toLocaleString()}</p>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//       <style>{`
//         .submitted-exams-container { padding: 20px; font-family: Arial, sans-serif; }
//         .submitted-exams-title { text-align: center; color: #333; margin-bottom: 20px; }
//         .exams-grid { display: grid; gap: 20px; justify-content: center; }
//         .exam-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; width: 300px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: relative; cursor: pointer; }
//         .completed-label { position: absolute; top: 10px; right: 10px; background-color: #28a745; color: white; padding: 5px 10px; border-radius: 4px; display: flex; align-items: center; font-size: 14px; }
//         .check-icon { margin-right: 5px; }
//         .exam-image { width: 100%; height: 200px; object-fit: cover; }
//         .exam-info { padding: 15px; }
//         .exam-name { margin: 0 0 10px; color: #2c3e50; }
//         .exam-details { margin: 5px 0; color: #7f8c8d; font-size: 14px; }
//       `}</style>
//     </div>
//   );
// };

// export default SubmittedExams;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle } from 'react-icons/fa';

const SubmittedExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmittedExams();
  }, []);

  const fetchSubmittedExams = async () => {
    const Bearer = sessionStorage.getItem('token');
    const baseUrl = 'https://lunarsenterprises.com:6028'; // Consistent
    try {
      const response = await axios({
        url: `${baseUrl}/drlifeboat/student/exam/submission/list`,
        headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
        method: 'GET',
      });
      if (response.data.result) {
        setExams(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching submitted exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExamClick = (exam) => {
    // Navigate to analysis with se_id (submission ID)
    navigate(`/exam/${exam.ex_id}/analysis`, { state: { submittedExamId: exam.ex_id } });
  };

  if (loading) {
    return <div className="submitted-exams-container">Loading...</div>;
  }

  return (
    <div className="submitted-exams-container">
      <h2 className="submitted-exams-title">Submitted Exams</h2>
      <div className="exams-grid">
        {exams.length === 0 ? (
          <p>No submitted exams. <button onClick={() => navigate('/exam')} style={{ color: '#007bff', border: 'none', background: 'none', cursor: 'pointer' }}>View Available Exams</button></p>
        ) : (
          exams.map((exam) => (
            <div key={exam.se_id} className="exam-card" onClick={() => handleExamClick(exam)}>
              <div className="completed-label">
                <FaCheckCircle className="check-icon" />
                Completed
              </div>
              <img
                src={`https://lunarsenterprises.com:6028/${exam.ex_file}`}
                alt={exam.ex_name}
                className="exam-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
              <div className="exam-info">
                <h3 className="exam-name">{exam.ex_name}</h3>
                <p className="exam-details">Score: {exam.se_score || 'N/A'}/{exam.ex_total_questions || 'N/A'}</p>
                <p className="exam-details">Duration: {exam.se_duration || 'N/A'}</p>
                <p className="exam-details">Submitted: {new Date(exam.se_created_at).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <style>{`
        .submitted-exams-container { padding: 20px; font-family: Arial, sans-serif; }
        .submitted-exams-title { text-align: center; color: #333; margin-bottom: 20px; }
        .exams-grid { display: grid; gap: 20px; justify-content: center; }
        .exam-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; width: 300px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: relative; cursor: pointer; transition: transform 0.2s; }
        .exam-card:hover { transform: translateY(-5px); }
        .completed-label { position: absolute; top: 10px; right: 10px; background-color: #28a745; color: white; padding: 5px 10px; border-radius: 4px; display: flex; align-items: center; font-size: 14px; z-index: 1; }
        .check-icon { margin-right: 5px; }
        .exam-image { width: 100%; height: 200px; object-fit: cover; }
        .exam-info { padding: 15px; }
        .exam-name { margin: 0 0 10px; color: #2c3e50; }
        .exam-details { margin: 5px 0; color: #7f8c8d; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default SubmittedExams;
