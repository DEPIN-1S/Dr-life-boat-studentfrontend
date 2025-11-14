import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaCheck, FaTimes, FaLock, FaArrowLeft } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_BASE_URL || "https://lunarsenterprises.com:6028";

export default function QuizResultAnalysis() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const res = await axios.post(
          `${API_BASE}/drlifeboat/student/quiz/submission/data`,
          { quiz_id: submissionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.result) {
          setResult(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [submissionId]);

  if (loading) return <div className="text-center py-10">Loading results...</div>;
  if (!result) return <div className="text-center py-10 text-red-600">No result found.</div>;

  const { score, total_questions, correct, incorrect, unanswered, duration, created_at, q_name } = result;

  const data = [
    { name: 'Correct', value: correct, fill: '#10b981' },
    { name: 'Incorrect', value: incorrect, fill: '#ef4444' },
    { name: 'Unanswered', value: unanswered, fill: '#f59e0b' },
  ];

  const percent = total_questions > 0 ? ((score / total_questions) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{q_name || "Quiz Results"}</h1>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <FaArrowLeft /> Back to Quiz List
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Submitted on {new Date(created_at).toLocaleString()}
          </p>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border text-center">
            <div className="text-3xl font-bold text-blue-600">{score}/{total_questions}</div>
            <div className="text-sm text-gray-600 mt-1">Score</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border text-center">
            <div className="text-3xl font-bold text-green-600">{percent}%</div>
            <div className="text-sm text-gray-600 mt-1">Percentage</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border text-center">
            <div className="text-3xl font-bold text-emerald-600">{correct}</div>
            <div className="text-sm text-gray-600 mt-1">Correct</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border text-center">
            <div className="text-3xl font-bold text-gray-600">{duration}</div>
            <div className="text-sm text-gray-600 mt-1">Time Taken</div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h3 className="text-lg font-semibold mb-4">Performance Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }}></div>
                <span>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Well Done!</h3>
          <p className="text-blue-50">
            You scored <strong>{score}/{total_questions}</strong> in this quiz.
            {percent >= 70 ? " Excellent performance!" : " Keep practicing!"}
          </p>
        </div>
      </div>
    </div>
  );
}
