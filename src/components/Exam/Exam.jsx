import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle } from 'react-icons/fa';

const Exam = () => {
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState([]);
  const [submittedExams, setSubmittedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const Bearer = sessionStorage.getItem('token');
    try {
      setLoading(true);
      setError(null);

      // Fetch available exams
      const availableResponse = await axios({
        url: import.meta.env.VITE_BASE_URL + '/drlifeboat/student/exam/list',
        headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
        method: 'GET',
      });
      if (availableResponse.data.result) {
        setAvailableExams(availableResponse.data.data);
      }

      // Fetch submitted exams
      const submittedResponse = await axios({
        url: 'https://lunarsenterprises.com:6028/drlifeboat/student/exam/submission/list',
        headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
        method: 'GET',
      });
      if (submittedResponse.data.result) {
        setSubmittedExams(submittedResponse.data.data);
      }
    } catch (err) {
      setError('Failed to fetch exams. Please try again later.');
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExamClick = (exam) => {
    navigate(exam.is_completed ? `/exam/result/${exam.se_exam_id || exam.ex_id}` : '/instructions', { state: exam });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  // Mark exams as completed if they exist in submittedExams based on se_exam_id
  const allExams = availableExams.map((exam) => {
    const submittedExam = submittedExams.find((sub) => sub.se_exam_id === exam.ex_id);
    return {
      ...exam,
      is_completed: !!submittedExam,
      se_exam_id: submittedExam ? submittedExam.se_exam_id : null,
    };
  });

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12">
          <h2 className="text-center mb-4">Available Exams</h2>
        </div>
      </div>

      {allExams.length === 0 ? (
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <p className="lead">No available exams.</p>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          {allExams.map((exam) => (
            <div key={exam.ex_id} className="col-lg-4 col-md-6 col-sm-12 mb-4 d-flex justify-content-center">
              <div
                className={`card shadow-sm position-relative ${exam.is_completed ? 'border-success' : ''}`}
                style={{
                  width: '280px',
                  height: '350px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => handleExamClick(exam)}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                {exam.is_completed && (
                  <div
                    className="position-absolute badge bg-success d-flex align-items-center"
                    style={{
                      top: '10px',
                      right: '10px',
                      zIndex: 10,
                      fontSize: '0.75rem'
                    }}
                  >
                    <FaCheckCircle className="me-1" />
                    Completed
                  </div>
                )}

                <img
                  src={`https://lunarsenterprises.com:6028/${exam.ex_file}`}
                  alt={exam.ex_name}
                  className="card-img-top"
                  style={{
                    height: '200px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/280x200/f8f9fa/6c757d?text=No+Image';
                  }}
                />

                <div className="card-body d-flex flex-column justify-content-center text-center">
                  <h5 className="card-title mb-3">{exam.ex_name}</h5>

                  {exam.is_completed ? (
                    <span className="badge bg-success-subtle text-success px-3 py-2">
                      Submitted
                    </span>
                  ) : (
                    <span className="badge bg-primary-subtle text-primary px-3 py-2">
                      ⏱ {exam.ex_duration} min
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Exam;
