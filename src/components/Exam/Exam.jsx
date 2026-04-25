



import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../utils/apiConfig';
import { getImageUrl } from '../../utils/imageUrl';

const Exam = () => {
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      const Bearer = sessionStorage.getItem('token');
      if (!Bearer) {
        setError('Authentication token missing. Please log in again.');
        return;
      }
      const baseUrl = API_BASE_URL;
      try {
        setLoading(true);
        setError(null);
        const response = await axios({
          url: `${baseUrl}/drlifeboat/student/exam/list`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
          method: 'GET',
        });
        // console.log('API Response Exams:', response.data.data); // Debug log
        if (response.data.result) {
          setAvailableExams(response.data.data || []);
        } else {
          setError('Failed to fetch exams. Please contact support.');
        }
      } catch (err) {
        setError('Failed to fetch exams. Please try again later or log in again.');
        console.error('Error fetching exams:', err);
        if (err.response?.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again.',
            confirmButtonText: 'OK',
          }).then(() => {
            navigate('/login');
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [navigate]);

  const handleExamClick = (exam) => {
    // console.log('Navigating with exam:', exam); // Debug log
    if (!exam || !exam.ex_id) {
      setError('Invalid exam selected.');
      return;
    }

    const baseUrl = API_BASE_URL;
    axios({
      url: `${baseUrl}/drlifeboat/student/exam/submission/list`,
      method: 'GET',
      params: { examId: exam.ex_id },
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      },
    })
      .then((response) => {
        if (response.data.result && response.data.data) {
          const submissions = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
          // console.log('Exam submissions:', submissions);

          // Filter submissions for this specific exam
          const examSubmissions = submissions.filter(sub => sub.se_exam_id === exam.ex_id);
          // console.log('Filtered exam submissions:', examSubmissions);

          const submittedSubmission = examSubmissions.find(sub => sub.se_status === 'submitted');
          // console.log('Submitted submission:', submittedSubmission);

          if (submittedSubmission) {
            // console.log('Found submitted submission:', submittedSubmission);
            navigate(`/exam/result/${submittedSubmission.ex_id}`, { state: { submittedExamId: submittedSubmission.ex_id } });
          } else {
            // console.log('No submitted submission found for this exam, navigating to instructions');
            navigate('/instructions', { state: { exam } });
          }
        } else {
          // console.log('No submission data, navigating to instructions');
          navigate('/instructions', { state: { exam } });
        }
      })
      .catch((err) => {
        console.error('Error checking exam status:', err);
        if (err.response?.data?.message === 'Submitted exam id is required') {
          // If no submission exists, proceed to instructions
          navigate('/instructions', { state: { exam } });
        } else {
          setError('Failed to verify exam status. Please try again.');
          if (err.response?.status === 401) {
            Swal.fire({
              icon: 'error',
              title: 'Session Expired',
              text: 'Your session has expired. Please log in again.',
              confirmButtonText: 'OK',
            }).then(() => {
              navigate('/login');
            });
          }
        }
      });
  };

  const baseUrl = API_BASE_URL;

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/login')}>
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (availableExams.length === 0) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="mb-4">
            <svg width="100" height="100" viewBox="0 0 100 100" className="text-muted">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M30 45 L45 60 L70 35" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>
          <h2 className="text-muted">No Exams Available</h2>
          <p className="text-muted mb-4">It seems no exams are currently assigned to you or check back later.</p>
          <button className="btn btn-primary px-4" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (


    <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '1rem 1rem 2rem' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11 col-xl-10">
          {/* Header Section */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4 mb-md-5 pt-3">
            <h1 className="mb-3 mb-sm-0 text-center text-sm-start" style={{ color: '#2c3e50', fontWeight: '600', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
              Available Exams
            </h1>

          </div>

          {/* Exam Cards Grid */}
          <div className="row g-3 g-md-4">
            {availableExams.map((exam) => (
              <div key={exam.ex_id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <div
                  className="card h-100 shadow-sm border-0 position-relative overflow-hidden exam-card"
                  onClick={() => handleExamClick(exam)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '15px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Card Image/Header */}
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center position-relative"
                    style={{
                      height: '180px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    <div className="text-center text-white px-2">
                      <div className="mb-2">
                        {exam.ex_file ? (
                          <img
                            src={getImageUrl(exam.ex_file)}
                            alt={exam.ex_name || 'Exam'}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        ) : (
                          <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="20" y="15" width="60" height="70" rx="5" fill="none" stroke="currentColor" strokeWidth="3" />
                            <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
                            <circle cx="50" cy="45" r="15" fill="currentColor" opacity="0.8" />
                            <text x="50" y="52" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
                              EXAM
                            </text>
                            <rect x="30" y="65" width="40" height="3" rx="1.5" fill="currentColor" opacity="0.6" />
                            <rect x="35" y="72" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.6" />
                          </svg>
                        )}
                      </div>
                      <h5 className="mb-0" style={{ fontWeight: '600', letterSpacing: '0.5px', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                        {exam.ex_name || 'TEST'}
                      </h5>
                    </div>

                    {/* Decorative Background SVG */}
                    {!exam.ex_file && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '35px',
                          height: '35px',
                          opacity: '0.3'
                        }}
                      >
                        <svg width="35" height="35" viewBox="0 0 100 100" fill="currentColor">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M50 5 C50 5, 20 25, 20 50 C20 75, 50 95, 50 95" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M50 5 C50 5, 80 25, 80 50 C80 75, 50 95, 50 95" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M10 35 Q50 25, 90 35" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M10 50 Q50 40, 90 50" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M10 65 Q50 55, 90 65" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                    )}

                    {/* Status Indicator */}
                    <div className="position-absolute top-0 start-0 p-2">
                      <div
                        className={`rounded-circle ${exam.is_submitted ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: '12px', height: '12px' }}
                      />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body text-center p-3">
                    {/* Duration Badge */}
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      <span
                        className="ms-2 px-3 py-1 rounded-pill text-white fw-bold"
                        style={{
                          backgroundColor: '#9b59b6',
                          fontSize: '13px'
                        }}
                      >
                        {exam.ex_duration || 10} min
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="row text-center g-2">
                      <div className="col-6">
                        <div className="pe-2 border-end">
                          <h6 className="text-muted mb-1" style={{ fontSize: '11px', fontWeight: '500' }}>
                            Questions
                          </h6>
                          <p className="mb-0 fw-bold" style={{ color: '#2c3e50', fontSize: '15px' }}>
                            {exam.ex_total_questions || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="ps-2">
                          <h6 className="text-muted mb-1" style={{ fontSize: '11px', fontWeight: '500' }}>
                            Status
                          </h6>
                          <span
                            className={`badge ${exam.is_submitted ? 'bg-success' : 'bg-warning'}`}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            {exam.is_submitted ? 'Completed' : 'start'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .exam-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }

        @media (max-width: 575.98px) {
          .container-fluid {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }

        @media (min-width: 576px) and (max-width: 991.98px) {
          .col-sm-6:nth-child(odd) .border-end {
            border-right: 1px solid #dee2e6 !important;
          }
        }

        @media (max-width: 575.98px) {
          .card-img-top {
            height: 160px !important;
          }
        }
      `}</style>
    </div>


  );
};

export default Exam;
