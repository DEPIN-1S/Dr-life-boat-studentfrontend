// src/components/Quiz/ModuleQuizzesView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../../utils/apiConfig';
import { getImageUrl } from '../../utils/imageUrl';
import { motion } from "framer-motion";
import { Star, ChevronRight, Search, Loader2 } from "lucide-react";

// Change if needed
const API_BASE = API_BASE_URL;



export default function ModuleQuizzesView() {
  const { id } = useParams(); // module id from /quiz/:id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tree, setTree] = useState({ course: null, module: null, topics: [] });
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await axios.post(
          `${API_BASE}/drlifeboat/student/quiz/list`,
          { module_id: id },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res?.data?.result) {
          const normalized = normalizeApiData(res.data.data || []);
          setTree(normalized);
        } else {
          setError(res?.data?.message || "Failed to fetch quizzes. Please contact support.");
        }
      } catch (e) {
        setError(e?.message || "Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const filteredTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tree;

    const topics = (tree.topics || [])
      .map((t) => {
        const subtopics = (t.subtopics || [])
          .map((s) => {
            const quizzes = (s.quizzes || []).filter((qq) => {
              return (
                qq.q_name?.toLowerCase().includes(q) ||
                t.tp_name?.toLowerCase().includes(q) ||
                s.st_name?.toLowerCase().includes(q)
              );
            });
            return { ...s, quizzes };
          })
          .filter((s) => s.quizzes.length > 0);
        return { ...t, subtopics };
      })
      .filter((t) => t.subtopics.length > 0);

    return { ...tree, topics };
  }, [tree, query]);

  const totalQuizzes = useMemo(() => {
    let total = 0;
    for (const t of filteredTree.topics || []) {
      for (const s of t.subtopics || []) {
        total += (s.quizzes || []).length;
      }
    }
    return total;
  }, [filteredTree]);

  return (
    <div className="w-full min-h-screen bg-[#FAFAFB]">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Breadcrumb + Title */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="px-2 py-1 rounded-full bg-white border">Home</span>
          <span>›</span>
          <span className="px-2 py-1 rounded-full bg-white border">Quiz</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
            {tree.module?.md_name || "Module"}
            <Star className="h-5 w-5 text-blue-500 fill-blue-500" />
          </h1>
          {tree.course?.cs_heading && (
            <div className="text-sm text-gray-500">{tree.course.cs_heading}</div>
          )}
        </div>

        {/* Search */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search by quiz, topic, or subtopic"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 w-72 h-9 rounded-md border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
            />
          </div>
          <span className="text-sm text-gray-500 ml-2">{totalQuizzes} quizzes</span>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-8">
          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading quizzes...
            </div>
          )}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !error && (filteredTree.topics?.length || 0) === 0 && <EmptyState />}

          {(filteredTree.topics || []).map((topic, tIdx) => (
            <motion.section
              key={topic.tp_id ?? `t-${tIdx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: tIdx * 0.03 }}
            >
              {/* Topic header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{topic.tp_name || "Uncategorized"}</h2>
                </div>
                <div className="h-px flex-1 bg-gray-200 ml-4" />
              </div>

              {/* Subtopics */}
              <div className="space-y-5">
                {(topic.subtopics || []).map((sub, sIdx) => (
                  <div key={sub.st_id ?? `s-${sIdx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-700">
                        {sub.st_name || "General"}
                      </div>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 border text-gray-700">
                        {(sub.quizzes || []).length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(sub.quizzes || []).map((q, i) => {
                        console.log("Quiz data:", q);
                        return (
                          <QuizCard
                            key={q.q_id}
                            quiz={q}
                            index={i}
                            src={getImageUrl(q.q_image)}
                            onOpen={() => q.is_submitted ? navigate(`/quiz/result/${q.q_id}`) : navigate(`/quiz/start/${q.q_id}`)}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------ helpers ------------ */

function EmptyState() {
  return (
    <div className="border border-dashed rounded-xl bg-white">
      <div className="p-6 text-center text-gray-500">No quizzes found for this module.</div>
    </div>
  );
}

function QuizCard({ quiz, index, onOpen }) {
  // If you later have completion data, wire it here.
  const completed = Number(quiz.completed_count || 0);
  const total = Math.max(Number(quiz.total_count || 0), completed);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const statusText =
    total > 0 ? `${completed}/${total} completed` : (quiz.assigned?.qs_created_at ? "Assigned" : "");

  // Use the is_submitted flag from the normalized data
  const isSubmitted = quiz.is_submitted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.02 }}
    >
      <div
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
        onClick={onOpen}
      >
        <div className="p-4">
          <div className="flex items-center gap-4">
            {/* Icon / Image */}
            <div className="shrink-0 relative">
              {quiz.q_file ? (
                <img
                  src={fileUrl(quiz.q_file)}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover border"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl border grid place-items-center text-lg bg-gray-50">🎯</div>
              )}
              {isSubmitted && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            {/* Middle */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{quiz.q_name}</p>
              </div>

              <div className="mt-2 flex items-center gap-3">
                {isSubmitted ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                    Completed
                  </span>
                ) : (
                  <>
                    <Progress value={pct} />
                    <span className="text-xs text-gray-500 whitespace-nowrap">{statusText}</span>
                  </>
                )}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="h-9 w-9 grid place-items-center rounded-full hover:bg-gray-100 text-gray-400"
              aria-label="Open quiz"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Progress({ value = 0 }) {
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gray-900"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/** Convert `uploads\\quiz\\...` → `${API_BASE}/uploads/quiz/...` */
function fileUrl(path) {
  if (!path) return "";
  const cleaned = String(path).replace(/\\+/g, "/").replace(/^\/+/, "");
  // If already absolute, return as is
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `${API_BASE}/${cleaned}`;
}

/** Normalize API array to { course, module, topics[] } */
function normalizeApiData(apiData = []) {
  if (!Array.isArray(apiData) || apiData.length === 0) {
    return { course: null, module: null, topics: [] };
  }

  const course = {
    cs_id: apiData[0].cs_id ?? null,
    cs_heading: apiData[0].cs_heading ?? null,
  };

  // We expect one module for the requested :id; take the first available
  const mod = (apiData[0].modules && apiData[0].modules[0]) || null;
  const moduleMeta = mod
    ? { md_id: mod.md_id ?? null, md_name: mod.md_name ?? null }
    : null;

  const topics = (mod?.topics || []).map((t) => {
    const subtopics = (t.subtopics || []).map((s) => {
      let quizzes = s.quizzes || [];
      // Your sample sometimes returns a single object for quizzes
      if (!Array.isArray(quizzes) && quizzes && typeof quizzes === "object") {
        quizzes = [quizzes];
      }
      return {
        st_id: s.st_id ?? null,
        st_name: s.st_name ?? "General",
        quizzes: (quizzes || []).map((q) => ({
          q_id: q.q_id,
          q_name: q.q_name,
          q_file: q.q_file,
          q_course_id: q.q_course_id,
          q_module_id: q.q_module_id,
          q_topic_id: q.q_topic_id,
          q_subtopic_id: q.q_subtopic_id,
          is_submitted: q.is_submitted,
          assigned: q.assigned,
        })),
      };
    });
    return {
      tp_id: t.tp_id ?? null,
      tp_name: t.tp_name ?? "Uncategorized",
      subtopics,
    };
  });

  return { course, module: moduleMeta, topics };
}


