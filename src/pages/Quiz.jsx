import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Quiz({ user, quizId, onNavigate }) {
  const [quiz, setQuiz]         = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers]   = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  useEffect(() => {
    if (!quizId) return
    fetchQuiz()
  }, [quizId])

  // Timer
  useEffect(() => {
    if (!quiz || submitted) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [quiz, submitted])

  async function fetchQuiz() {
    const [quizRes, questionsRes] = await Promise.all([
      supabase.from("quizzes").select("*").eq("id", quizId).single(),
      supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("order_index"),
    ])
    setQuiz(quizRes.data)
    setQuestions(questionsRes.data || [])
    setLoading(false)
  }

  async function handleSubmit() {
    if (submitted) return
    setSubmitted(true)

    // Calculate score
    let correct = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++
    })
    setScore(correct)

    // Save attempt to Supabase
    await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      quiz_id: quizId,
      score: correct,
      total_questions: questions.length,
      answers: answers,
      time_taken_seconds: 300 - timeLeft,
    })

    // Update leaderboard
    await supabase.rpc("update_leaderboard", { p_user_id: user.id })
  }

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`

  // No quiz selected
  if (!quizId) return (
    <div style={{ padding: 32, background: "#0c1a2e", minHeight: "100vh" }}>
      <div style={{
        background: "rgba(15,52,96,0.6)", borderRadius: 20, padding: "64px 32px",
        border: "1px solid rgba(14,116,144,0.2)", textAlign: "center"
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
        <h3 style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>
          No quiz selected
        </h3>
        <p style={{ color: "#64748b", margin: "0 0 24px" }}>
          Go to My Videos and click a ready video to take its quiz
        </p>
        <button onClick={() => onNavigate("myvideos")} style={{
          background: "linear-gradient(135deg,#0e7490,#0891b2)",
          color: "#fff", border: "none", borderRadius: 12,
          padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer"
        }}>🎬 Go to My Videos</button>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ padding: 32, background: "#0c1a2e", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#67e8f9", fontSize: 18 }}>Loading quiz...</div>
    </div>
  )

  // Results screen
  if (submitted) return (
    <div style={{ padding: 32, background: "#0c1a2e", minHeight: "100vh" }}>
      <div style={{
        background: "rgba(15,52,96,0.6)", borderRadius: 20, padding: 40,
        border: "1px solid rgba(14,116,144,0.2)", maxWidth: 700, margin: "0 auto",
        textAlign: "center"
      }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>
          {score === questions.length ? "🏆" : score >= questions.length/2 ? "🎉" : "📚"}
        </div>
        <h2 style={{ color: "#67e8f9", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>
          Quiz Complete!
        </h2>
        <div style={{
          fontSize: 64, fontWeight: 800, color: "#e2e8f0", margin: "24px 0 8px"
        }}>
          {score}/{questions.length}
        </div>
        <p style={{ color: "#64748b", fontSize: 16, margin: "0 0 32px" }}>
          {Math.round(score/questions.length*100)}% correct
        </p>

        {/* Answer review */}
        <div style={{ textAlign: "left", marginBottom: 32 }}>
          {questions.map((q, i) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correct_answer
            return (
              <div key={q.id} style={{
                background: isCorrect ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${isCorrect ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                borderRadius: 12, padding: 16, marginBottom: 12
              }}>
                <p style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>
                  {i+1}. {q.question_text}
                </p>
                <p style={{ color: isCorrect ? "#86efac" : "#fca5a5", fontSize: 13, margin: "0 0 4px" }}>
                  Your answer: {userAnswer || "Not answered"}
                </p>
                {!isCorrect && (
                  <p style={{ color: "#86efac", fontSize: 13, margin: "0 0 4px" }}>
                    Correct: {q.correct_answer}
                  </p>
                )}
                {q.explanation && (
                  <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => onNavigate("myvideos")} style={{
            background: "rgba(14,116,144,0.2)", border: "1px solid rgba(14,116,144,0.3)",
            color: "#67e8f9", borderRadius: 12, padding: "12px 24px",
            fontSize: 14, fontWeight: 600, cursor: "pointer"
          }}>🎬 My Videos</button>
          <button onClick={() => onNavigate("leaderboard")} style={{
            background: "linear-gradient(135deg,#0e7490,#0891b2)",
            color: "#fff", border: "none", borderRadius: 12,
            padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer"
          }}>🏆 Leaderboard</button>
        </div>
      </div>
    </div>
  )

  // Quiz screen
  return (
    <div style={{ padding: 32, background: "#0c1a2e", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: "rgba(15,52,96,0.6)", borderRadius: 16, padding: "16px 24px",
        border: "1px solid rgba(14,116,144,0.2)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24
      }}>
        <div>
          <h2 style={{ color: "#67e8f9", fontSize: 18, fontWeight: 700, margin: 0 }}>
            {quiz?.title}
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>
            {questions.length} questions
          </p>
        </div>
        <div style={{
          background: timeLeft < 60 ? "rgba(239,68,68,0.2)" : "rgba(14,116,144,0.2)",
          border: `1px solid ${timeLeft < 60 ? "rgba(239,68,68,0.3)" : "rgba(14,116,144,0.3)"}`,
          borderRadius: 10, padding: "8px 16px",
          color: timeLeft < 60 ? "#fca5a5" : "#67e8f9",
          fontSize: 18, fontWeight: 700
        }}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
        {questions.map((q, i) => (
          <div key={q.id} style={{
            background: "rgba(15,52,96,0.6)", borderRadius: 16, padding: 24,
            border: "1px solid rgba(14,116,144,0.2)"
          }}>
            <p style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600,
              margin: "0 0 16px" }}>
              {i+1}. {q.question_text}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((option, j) => {
                const letter = ["A","B","C","D"][j]
                const isSelected = answers[q.id] === letter
                return (
                  <button
                    key={j}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                    style={{
                      padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                      textAlign: "left", fontSize: 14, transition: "all 0.15s",
                      background: isSelected ? "rgba(14,116,144,0.3)" : "rgba(12,26,46,0.6)",
                      border: isSelected
                        ? "1.5px solid #67e8f9"
                        : "1.5px solid rgba(14,116,144,0.2)",
                      color: isSelected ? "#67e8f9" : "#94a3b8",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < questions.length}
        style={{
          background: Object.keys(answers).length < questions.length
            ? "#1e3a5f" : "linear-gradient(135deg,#0e7490,#0891b2)",
          color: Object.keys(answers).length < questions.length ? "#64748b" : "#fff",
          border: "none", borderRadius: 14, padding: "16px 40px",
          fontSize: 16, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(14,116,144,0.4)"
        }}
      >
        {Object.keys(answers).length < questions.length
          ? `Answer ${questions.length - Object.keys(answers).length} more questions`
          : "✅ Submit Quiz"}
      </button>
    </div>
  )
}