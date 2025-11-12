import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Quiz.css";

const API_BASE = import.meta.env.VITE_BASE_URL || "https://lunarsenterprises.com:6028";

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
          setError("Failed to fetch quizzes. Please contact support.");
        }
      } catch (err) {
        setError(err.message || "Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="quiz-container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading Quizzes...</p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="quiz-error">
        Failed to load quizzes: {error}
      </div>
    );

  if (quizzes.length === 0) {
    return (
      <div className="quiz-container mt-5">
        <div className="quiz-empty">
          <div className="quiz-empty-icon">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M30 45 L45 60 L70 35" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>
          <h2>No Quizzes Available</h2>
          <p>It seems no quizzes are currently assigned to you. Please check back later.</p>
          <button className="quiz-btn" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">
        <FontAwesomeIcon icon={faClipboardQuestion} className="quiz-title-icon" />
        Available Quizzes
      </h2>

      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <div key={quiz.md_id} className="quiz-card">
            <div className="quiz-card-top">
              <div className="quiz-card-icon-wrap">
                {quiz.md_image ? (
                  <img src={`${API_BASE}/${quiz.md_image}`} alt={quiz.q_name} />
                ) : (
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="3" fill="none" />
                    <text x="50" y="57" textAnchor="middle" fontSize="18" fill="white" fontWeight="bold">?</text>
                  </svg>
                )}
              </div>

              <h3 className="quiz-card-title">{quiz.md_name}</h3>
            </div>
            <hr />
            <p className="quiz-card-desc">
              {quiz.cs_heading}
            </p>
            <p className="quiz-card-desc">
              Total quizzes : {quiz.quiz_count}
            </p>

            <Link to={`/quiz/${quiz.md_id}`} className="quiz-start-btn text-red-600">
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizList;
