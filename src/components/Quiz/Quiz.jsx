



import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../../utils/apiConfig';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";

const API_BASE = API_BASE_URL;

const QuizList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const Bearer = sessionStorage.getItem("token");
        if (!Bearer) {
          setError("Authentication token missing. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios({
          url: `${API_BASE}/drlifeboat/student/quiz/module/list`,
          headers: { Accept: "application/json", Authorization: `Bearer ${Bearer}` },
          method: "GET",
        });

        if (response.data.result) {
          setQuizzes(response.data.data || []);
        } else {
          setError("No quiz modules found.");
        }
      } catch (err) {
        setError("Failed to load quizzes. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>Error!</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Log In Again
          </button>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="mb-4">
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-muted">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M30 45 L45 60 L70 35" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
        <h2 className="text-muted">No Quizzes Available</h2>
        <p className="text-muted">No quiz modules are currently assigned to you.</p>
        <button className="btn btn-primary px-4" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "1rem 1rem 3rem",
      }}
    >
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11 col-xl-10">
          {/* Header */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4 mb-md-5 pt-3">
            <h1
              className="mb-3 mb-sm-0 text-center text-sm-start"
              style={{
                color: "#2c3e50",
                fontWeight: "600",
                fontSize: "clamp(1.8rem, 4vw, 2.2rem)",
              }}
            >
              <FontAwesomeIcon icon={faClipboardQuestion} className="me-3 text-primary" />
              Available Quiz Modules
            </h1>
          </div>

          {/* Quiz Cards Grid */}
          <div className="row g-3 g-md-4">
            {quizzes.map((quiz) => (
              <div key={quiz.md_id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <div
                  className="card h-100 shadow-sm border-0 position-relative overflow-hidden quiz-card"
                  onClick={() => navigate(`/quiz/${quiz.md_id}`)}
                  style={{
                    cursor: "pointer",
                    borderRadius: "15px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Header Image */}
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center position-relative"
                    style={{
                      height: "180px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    <div className="text-center text-white px-3">
                      {quiz.md_image ? (
                        <img
                          src={`${API_BASE}/${quiz.md_image}`}
                          alt={quiz.md_name}
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "12px",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                          }}
                        />
                      ) : (
                        <svg width="70" height="70" viewBox="0 0 100 100" fill="currentColor" opacity="0.9">
                          <rect x="20" y="15" width="60" height="70" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
                          <circle cx="50" cy="45" r="18" fill="currentColor" opacity="0.9" />
                          <text x="50" y="52" textAnchor="middle" fontSize="20" fill="white" fontWeight="bold">
                            ?
                          </text>
                          <rect x="28" y="68" width="44" height="4" rx="2" fill="currentColor" opacity="0.7" />
                          <rect x="35" y="75" width="30" height="4" rx="2" fill="currentColor" opacity="0.5" />
                        </svg>
                      )}
                      <h5
                        className="mt-3 mb-0"
                        style={{
                          fontWeight: "600",
                          letterSpacing: "0.6px",
                          fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                        }}
                      >
                        {quiz.md_name || "Quiz Module"}
                      </h5>
                    </div>

                    {/* Top-left status dot */}
                    <div className="position-absolute top-0 start-0 p-2">
                      <div
                        className="rounded-circle bg-success"
                        style={{ width: "14px", height: "14px", boxShadow: "0 0 8px rgba(40,167,69,0.6)" }}
                      />
                    </div>

                    {/* Decorative background shape */}
                    {!quiz.md_image && (
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          opacity: 0.25,
                        }}
                      >
                        <svg width="40" height="40" viewBox="0 0 100 100" fill="currentColor">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
                          <path d="M50 10 Q20 40, 30 80" fill="none" stroke="currentColor" strokeWidth="3" />
                          <path d="M50 10 Q80 40, 70 80" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="card-body text-center p-3">
                    {/* Quiz Count Badge */}
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      {/* <svg width="20" height="20" viewBox="0 24 24" fill="none" stroke="#6c757d" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12h8m-4-4v8" />
                      </svg> */}
                      <span
                        className="ms-2 px-3 py-1 rounded-pill text-white fw-bold"
                        style={{
                          backgroundColor: "#9b59b6",
                          fontSize: "14px",
                        }}
                      >
                        {quiz.quiz_count || 0} Quizzes
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="row text-center g-2 mb-2">
                      <div className="col-12">
                        <small className="text-muted" style={{ fontSize: "12px" }}>
                          {quiz.cs_heading || "General Quiz Module"}
                        </small>
                      </div>
                    </div>

                    <button
                      className="btn btn-outline-primary btn-sm w-100 mt-2 fw-semibold"
                      style={{ borderRadius: "10px", fontSize: "0.95rem" }}
                    >
                      View Quizzes →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Animation */}
      <style jsx>{`
        .quiz-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.18) !important;
        }

        @media (max-width: 576px) {
          .card-img-top { height: 160px !important; }
        }
      `}</style>
    </div>
  );
};

export default QuizList;
