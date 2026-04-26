import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Leaderboard({ user }) {
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    const { data: rows } = await supabase
      .from("leaderboard")
      .select("*, users(email, full_name)")
      .order("total_score", { ascending: false })
      .limit(20)
    setData(rows || [])
    setLoading(false)
  }

  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div style={{ padding: 32, background: "#0c1a2e", minHeight: "100vh" }}>

      {/* Banner */}
      <div style={{
        background: "linear-gradient(135deg,#0c1a2e,#0e7490)",
        borderRadius: 20, padding: "32px 40px", marginBottom: 28,
        border: "1px solid rgba(103,232,249,0.2)",
        boxShadow: "0 8px 32px rgba(14,116,144,0.3)",
        display: "flex", alignItems: "center", gap: 20
      }}>
        <div style={{ fontSize: 56 }}>🏆</div>
        <div>
          <h2 style={{ color: "#67e8f9", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>
            Leaderboard
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 14 }}>
            Top learners ranked by quiz performance
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "rgba(15,52,96,0.6)", borderRadius: 20,
        border: "1px solid rgba(14,116,144,0.2)", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "60px 1fr 120px 120px 120px",
          padding: "14px 24px", background: "rgba(14,116,144,0.15)",
          borderBottom: "1px solid rgba(14,116,144,0.2)",
          fontSize: 12, fontWeight: 600, color: "#0e7490",
          textTransform: "uppercase", letterSpacing: "0.5px"
        }}>
          <div>Rank</div>
          <div>Student</div>
          <div style={{ textAlign: "center" }}>Quizzes</div>
          <div style={{ textAlign: "center" }}>Avg Score</div>
          <div style={{ textAlign: "center" }}>Total</div>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b", fontSize: 14 }}>
            No scores yet — be the first! 🚀
          </div>
        ) : (
          data.map((row, i) => {
            const isMe = row.user_id === user?.id
            const email = row.users?.email || "Unknown"
            const initials = email.slice(0, 2).toUpperCase()
            const hue = (email.charCodeAt(0) * 17 + email.charCodeAt(1) * 31) % 360

            return (
              <div key={row.id} style={{
                display: "grid", gridTemplateColumns: "60px 1fr 120px 120px 120px",
                padding: "16px 24px", alignItems: "center",
                borderBottom: "1px solid rgba(14,116,144,0.1)",
                background: isMe ? "rgba(103,232,249,0.08)" : "transparent",
                transition: "background 0.2s"
              }}>
                {/* Rank */}
                <div style={{ fontSize: 20, fontWeight: 700, color: "#67e8f9" }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>

                {/* Student */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `hsl(${hue},60%,40%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0
                  }}>{initials}</div>
                  <div>
                    <div style={{ color: isMe ? "#67e8f9" : "#e2e8f0",
                      fontSize: 14, fontWeight: isMe ? 700 : 400 }}>
                      {email} {isMe && "(You)"}
                    </div>
                  </div>
                </div>

                {/* Quizzes */}
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                  {row.quizzes_completed}
                </div>

                {/* Avg */}
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                  {Number(row.avg_score || 0).toFixed(1)}%
                </div>

                {/* Total */}
                <div style={{ textAlign: "center", fontWeight: 700,
                  color: "#67e8f9", fontSize: 16 }}>
                  {row.total_score}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}