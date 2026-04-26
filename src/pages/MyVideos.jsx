import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

const BACKEND = "http://127.0.0.1:8000"

export default function MyVideos({ user, onNavigate }) {
  const [videos, setVideos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)  // clicked video
  const [detail, setDetail]       = useState(null)   // transcript + quiz

  useEffect(() => {
    if (!user?.id) return
    fetchVideos()
  }, [user])

  async function fetchVideos() {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    setVideos(data || [])
    setLoading(false)
  }

  async function handleVideoClick(video) {
    if (video.status !== "ready") return
    setSelected(video)
    setDetail(null)

    // Fetch transcript + quiz
    const [transcriptRes, quizRes] = await Promise.all([
      supabase.from("transcripts").select("*").eq("video_id", video.id).single(),
      supabase.from("quizzes").select("*").eq("video_id", video.id).single(),
    ])

    setDetail({
      transcript: transcriptRes.data,
      quiz: quizRes.data,
    })
  }

  const stats = [
    { label: "Total Videos", value: videos.length,                                          icon: "🎬", color: "#0e7490" },
    { label: "Processing",   value: videos.filter(v => v.status === "processing").length,   icon: "⚙️", color: "#d97706" },
    { label: "Ready",        value: videos.filter(v => v.status === "ready").length,        icon: "✅", color: "#22c55e" },
  ]

  // ── Detail view ──────────────────────────────────────────
  if (selected) return (
    <div style={{ padding: 32, background: "#0c1a2e", minHeight: "100vh" }}>

      {/* Back button */}
      <button onClick={() => setSelected(null)} style={{
        background: "rgba(14,116,144,0.2)", border: "1px solid rgba(14,116,144,0.3)",
        color: "#67e8f9", borderRadius: 10, padding: "8px 20px",
        cursor: "pointer", fontSize: 14, marginBottom: 24
      }}>← Back to Videos</button>

      {/* Video title */}
      <h2 style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 700, margin: "0 0 24px" }}>
        🎬 {selected.title}
      </h2>

      {!detail ? (
        <div style={{ color: "#64748b", fontSize: 15 }}>Loading details...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Summary */}
          {detail.quiz?.summary && (
            <div style={{
              background: "rgba(15,52,96,0.6)", borderRadius: 16, padding: 28,
              border: "1px solid rgba(14,116,144,0.2)"
            }}>
              <h3 style={{ color: "#67e8f9", fontSize: 16, fontWeight: 700,
                margin: "0 0 12px" }}>📋 AI Summary</h3>
              <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                {detail.quiz.summary}
              </p>
            </div>
          )}

          {/* Key topics */}
          {detail.quiz?.key_topics?.length > 0 && (
            <div style={{
              background: "rgba(15,52,96,0.6)", borderRadius: 16, padding: 28,
              border: "1px solid rgba(14,116,144,0.2)"
            }}>
              <h3 style={{ color: "#67e8f9", fontSize: 16, fontWeight: 700,
                margin: "0 0 16px" }}>🏷️ Key Topics</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {detail.quiz.key_topics.map((topic, i) => (
                  <span key={i} style={{
                    background: "rgba(14,116,144,0.2)", border: "1px solid rgba(14,116,144,0.3)",
                    color: "#67e8f9", borderRadius: 20, padding: "6px 16px", fontSize: 13
                  }}>{topic}</span>
                ))}
              </div>
            </div>
          )}

          {/* Transcript */}
          {detail.transcript?.content && (
            <div style={{
              background: "rgba(15,52,96,0.6)", borderRadius: 16, padding: 28,
              border: "1px solid rgba(14,116,144,0.2)"
            }}>
              <h3 style={{ color: "#67e8f9", fontSize: 16, fontWeight: 700,
                margin: "0 0 12px" }}>📝 Transcript</h3>
              <div style={{
                color: "#94a3b8", fontSize: 13, lineHeight: 1.8,
                maxHeight: 200, overflowY: "auto",
                padding: "12px 16px", background: "rgba(0,0,0,0.2)",
                borderRadius: 10
              }}>
                {detail.transcript.content}
              </div>
            </div>
          )}

          {/* Take Quiz button */}
          {detail.quiz && (
            <button
              onClick={() => onNavigate("quiz", {
                quizId: detail.quiz.id,
                videoId: selected.id
              })}
              style={{
                background: "linear-gradient(135deg,#0e7490,#0891b2)",
                color: "#fff", border: "none", borderRadius: 14,
                padding: "16px 32px", fontSize: 16, fontWeight: 700,
                cursor: "pointer", boxShadow: "0 4px 14px rgba(14,116,144,0.4)",
                alignSelf: "flex-start"
              }}
            >
              📝 Take Quiz →
            </button>
          )}
        </div>
      )}
    </div>
  )

  // ── List view ─────────────────────────────────────────────
  return (
    <div style={{ padding: 32, background: "#0c1a2e", minHeight: "100vh" }}>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        gap: 20, marginBottom: 32 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: "rgba(15,52,96,0.6)", borderRadius: 16, padding: 24,
            border: "1px solid rgba(14,116,144,0.2)",
            display: "flex", alignItems: "center", gap: 16
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: stat.color + "22",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
            }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0" }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Video list */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: 64 }}>
          Loading videos...
        </div>
      ) : videos.length === 0 ? (
        <div style={{
          background: "rgba(15,52,96,0.6)", borderRadius: 20, padding: "64px 32px",
          border: "1px solid rgba(14,116,144,0.2)", textAlign: "center"
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>
            No videos yet
          </h3>
          <p style={{ margin: "0 0 28px", color: "#64748b", fontSize: 15 }}>
            Upload your first educational video to get started
          </p>
          <button onClick={() => onNavigate("upload")} style={{
            background: "linear-gradient(135deg,#0e7490,#0891b2)",
            color: "#fff", border: "none", borderRadius: 12,
            padding: "14px 32px", fontSize: 15, fontWeight: 600,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(14,116,144,0.4)"
          }}>📤 Upload Video</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {videos.map(video => (
            <div
              key={video.id}
              onClick={() => handleVideoClick(video)}
              style={{
                background: "rgba(15,52,96,0.6)", borderRadius: 16, padding: 24,
                border: "1px solid rgba(14,116,144,0.2)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: video.status === "ready" ? "pointer" : "default",
                transition: "all 0.2s",
                opacity: video.status === "error" ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (video.status === "ready")
                  e.currentTarget.style.border = "1px solid rgba(103,232,249,0.4)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = "1px solid rgba(14,116,144,0.2)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "rgba(14,116,144,0.3)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 22
                }}>🎬</div>
                <div>
                  <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>
                    {video.title}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                    {new Date(video.created_at).toLocaleDateString()} ·{" "}
                    {video.status === "ready" ? "Click to view details" : video.status}
                  </div>
                </div>
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: video.status === "ready"
                  ? "rgba(34,197,94,0.15)"
                  : video.status === "processing"
                  ? "rgba(234,179,8,0.15)"
                  : "rgba(239,68,68,0.15)",
                color: video.status === "ready"
                  ? "#86efac"
                  : video.status === "processing"
                  ? "#fde047"
                  : "#fca5a5"
              }}>
                {video.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}