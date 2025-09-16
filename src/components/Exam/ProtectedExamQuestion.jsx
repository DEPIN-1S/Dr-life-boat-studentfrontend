// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import ExamQuestion from './ExamQuestion';

// const ProtectedExamQuestion = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const exam = location?.state || JSON.parse(sessionStorage.getItem('currentExam') || '{}');

//   if (!exam?.ex_id) {
//     Swal.fire({
//       icon: 'error',
//       title: 'Invalid Exam',
//       text: 'Please select a valid exam from the list.',
//     }).then(() => {
//       navigate('/exam');
//     });
//     return null;
//   }

//   return <ExamQuestion />;
// };

// export default ProtectedExamQuestion;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExamQuestion from './ExamQuestion';

const ProtectedExamQuestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [exam, setExam] = useState(location.state || {});

  useEffect(() => {
    // Attempt to recover exam data from sessionStorage if not available in location.state
    const storedExam = JSON.parse(sessionStorage.getItem('currentExam') || '{}');
    if (storedExam?.ex_id && Object.keys(exam).length === 0) {
      setExam(storedExam);
    } else if (!storedExam?.ex_id && !exam?.ex_id) {
      navigate('/exam'); // Silent redirect instead of alert
    }
  }, [navigate, exam.ex_id]);

  // Render loading state or redirect if no exam data
  if (!exam?.ex_id) {
    return null; // Allow useEffect to handle redirect
  }

  return <ExamQuestion />;
};

export default ProtectedExamQuestion;
