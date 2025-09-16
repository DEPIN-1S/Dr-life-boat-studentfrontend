import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

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
      const baseUrl = import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028';
      try {
        setLoading(true);
        setError(null);
        const response = await axios({
          url: `${baseUrl}/drlifeboat/student/exam/list`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${Bearer}` },
          method: 'GET',
        });
        console.log('API Response Exams:', response.data.data); // Debug log
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
    console.log('Navigating with exam:', exam); // Debug log
    if (!exam || !exam.ex_id) {
      setError('Invalid exam selected.');
      return;
    }
    if (exam.is_completed) {
      navigate(`/exam/result/${exam.submission_id}`, { state: { submittedExamId: exam.submission_id } });
    } else {
      // Verify exam status with backend before navigating
      axios({
        url: `${import.meta.env.VITE_BASE_URL || 'https://lunarsenterprises.com:6028'}/drlifeboat/student/exam/submission/list`,
        headers: { Accept: 'application/json', Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        data: { examId: exam.ex_id },
        method: 'GET',
      })
        .then((response) => {
          if (response.data.result && response.data.data?.is_completed) {
            Swal.fire({
              icon: 'info',
              title: 'Exam Already Submitted',
              text: 'This exam has already been completed.',
              confirmButtonText: 'OK',
            }).then(() => {
              navigate('/exam');
            });
          } else {
            navigate('/instructions', { state: { exam } });
          }
        })
        .catch((err) => {
          console.error('Error checking exam status:', err);
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
        });
    }
  };

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
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M30 45 L45 60 L70 35" fill="none" stroke="currentColor" strokeWidth="3"/>
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
    <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <h1 className="text-center mb-5" style={{ color: '#2c3e50', fontWeight: '600' }}>
            Available Exams
          </h1>

          <div className="row g-4">
            {availableExams.map((exam) => (
              <div key={exam.ex_id} className="col-12 col-md-6 col-lg-4">
                <div
                  className="card h-100 shadow-sm border-0 position-relative overflow-hidden"
                  onClick={() => handleExamClick(exam)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '15px',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-5px)';
                    e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  }}
                >
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center"
                    style={{
                      height: '200px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      position: 'relative'
                    }}
                  >
                    <div className="text-center text-white">
                      <div className="mb-3">
                        <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="20" y="15" width="60" height="70" rx="5" fill="none" stroke="currentColor" strokeWidth="3"/>
                          <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="50" cy="45" r="15" fill="currentColor" opacity="0.8"/>
                          <text x="50" y="52" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
                            EXAM
                          </text>
                          <rect x="30" y="65" width="40" height="3" rx="1.5" fill="currentColor" opacity="0.6"/>
                          <rect x="35" y="72" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.6"/>
                        </svg>
                      </div>
                      <h4 className="mb-0" style={{ fontWeight: '600', letterSpacing: '1px' }}>
                        {exam.ex_name || 'TEST'}
                      </h4>
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '15px',
                        width: '40px',
                        height: '40px',
                        opacity: '0.3'
                      }}
                    >
                      <svg width="40" height="40" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <path d="M50 5 C50 5, 20 25, 20 50 C20 75, 50 95, 50 95" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <path d="M50 5 C50 5, 80 25, 80 50 C80 75, 50 95, 50 95" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <path d="M10 35 Q50 25, 90 35" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <path d="M10 50 Q50 40, 90 50" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <path d="M10 65 Q50 55, 90 65" fill="none" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>

                  <div className="card-body text-center p-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      <span
                        className="ms-2 px-3 py-1 rounded-pill text-white fw-bold"
                        style={{
                          backgroundColor: '#9b59b6',
                          fontSize: '14px'
                        }}
                      >
                        {exam.ex_duration || 10} min
                      </span>
                    </div>

                    <div className="row text-center g-3">
                      <div className="col-6">
                        <div className="border-end">
                          <h6 className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500' }}>
                            Questions
                          </h6>
                          <p className="mb-0 fw-bold" style={{ color: '#2c3e50', fontSize: '16px' }}>
                            {exam.ex_total_questions || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="col-6">
                        <h6 className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500' }}>
                          Status
                        </h6>
                        <span
                          className={`badge ${exam.is_completed ? 'bg-success' : 'bg-warning'}`}
                          style={{ fontSize: '12px' }}
                        >
                          {exam.is_completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="position-absolute top-0 start-0 p-2"
                    style={{ zIndex: 10 }}
                  >
                    <div
                      className={`rounded-circle ${exam.is_completed ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: '12px', height: '12px' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;
