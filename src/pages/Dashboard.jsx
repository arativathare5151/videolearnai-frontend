import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard({ user, onNavigate }) {
  const [stats, setStats] = useState({
    totalVideos: 0,
    quizzesDone: 0,
    totalScore: 0,
    avgScore: 0,
  })
  const [recentVideos, setRecentVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetchStats()
  }, [user])

  async function fetchStats() {
    const [videosRes, leaderboardRes, recentRes] = await Promise.all([
      supabase.from("videos").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("leaderboard").select("*").eq("user_id", user.id).single(),
      supabase.from("videos").select("*").eq("user_id", user.id)
        .eq("status", "ready").order("created_at", { ascending: false }).limit(3),
    ])

    setStats({
      totalVideos:  videosRes.count || 0,
      quizzesDone:  leaderboardRes.data?.quizzes_completed || 0,
      totalScore:   leaderboardRes.data?.total_score || 0,
      avgScore:     Number(leaderboardRes.data?.avg_score || 0).toFixed(1),
    })
    setRecentVideos(recentRes.data || [])
    setLoading(false)
  }

  return (
    <div style={{ padding: 32, background: "#0c1a2e", minHeight: "100vh" }}>

      {/* Welcome banner */}
      <div style={{
        background: "linear-gradient(135deg,#0f3460,#0e7490)",
        borderRadius: 20, padding: "32px 40px", marginBottom: 28,
        border: "1px solid rgba(103,232,249,0.2)",
        boxShadow: "0 8px 32px rgba(14,116,144,0.2)"
      }}>
        <h2 style={{ color: "#67e8f9", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>
          Welcome back! 👋
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 15 }}>
          {user?.email} · Ready to learn something new today?
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: 20, marginBottom: 28 }}>
        {[
          { label: "Videos",         value: stats.totalVideos, icon: "🎬", color: "#0e7490" },
          { label: "Quizzes Done",   value: stats.quizzesDone, icon: "📝", color: "#7c3aed" },
          { label: "Total Score",    value: stats.totalScore,  icon: "⭐", color: "#d97706" },
          { label: "Avg Score",      value: stats.avgScore+"%",icon: "📊", color: "#22c55e" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "rgba(15,52,96,0.6)", borderRadius: 16, padding: 24,
            border: "1px solid rgba(14,116,144,0.2)",
            display: "flex", alignItems: "center", gap: 16
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14,
              background: stat.color + "22",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 24
            }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0" }}>
                {loading ? "..." : stat.value}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent videos + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Recent Videos */}
        <div style={{
          background: "rgba(15,52,96,0.6)", borderRadius: 20, padding: 28,
          border: "1px solid rgba(14,116,144,0.2)"
        }}>
          <h3 style={{ color: "#67e8f9", fontSize: 16, fontWeight: 700,
            margin: "0 0 20px" }}>🎬 Recent Videos</h3>
          {recentVideos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 16px" }}>
                No videos yet
              </p>
              <button onClick={() => onNavigate("upload")} style={{
                background: "linear-gradient(135deg,#0e7490,#0891b2)",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 24px", fontSize: 13, fontWeight: 600,
                cursor: "pointer"
              }}>📤 Upload First Video</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentVideos.map(video => (
                <div
                  key={video.id}
                  onClick={() => onNavigate("myvideos")}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                    background: "rgba(12,26,46,0.6)",
                    border: "1px solid rgba(14,116,144,0.15)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(103,232,249,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(14,116,144,0.15)"}
                >
                  <span style={{ fontSize: 20 }}>🎬</span>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {video.title}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>
                      {new Date(video.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => onNavigate("myvideos")} style={{
                background: "transparent", border: "1px solid rgba(14,116,144,0.3)",
                color: "#67e8f9", borderRadius: 10, padding: "8px",
                fontSize: 13, cursor: "pointer", marginTop: 4
              }}>View all videos →</button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: "rgba(15,52,96,0.6)", borderRadius: 20, padding: 28,
          border: "1px solid rgba(14,116,144,0.2)"
        }}>
          <h3 style={{ color: "#67e8f9", fontSize: 16, fontWeight: 700,
            margin: "0 0 20px" }}>⚡ Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "📤", label: "Upload New Video",  desc: "Add educational content",  page: "upload",      color: "#0e7490" },
              { icon: "📝", label: "Take a Quiz",       desc: "Test your knowledge",       page: "myvideos",    color: "#7c3aed" },
              { icon: "🏆", label: "View Leaderboard",  desc: "See your ranking",          page: "leaderboard", color: "#d97706" },
            ].map(action => (
              <button
                key={action.page}
                onClick={() => onNavigate(action.page)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 18px", borderRadius: 12, border: "none",
                  background: "rgba(12,26,46,0.6)", cursor: "pointer",
                  textAlign: "left", transition: "all 0.2s",
                  borderLeft: `3px solid ${action.color}`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(14,116,144,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(12,26,46,0.6)"}
              >
                <span style={{ fontSize: 24 }}>{action.icon}</span>
                <div>
                  <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>
                    {action.label}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                    {action.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}