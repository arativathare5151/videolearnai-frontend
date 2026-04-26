import { useState } from "react"
import { useAuth } from "./hooks/useAuth"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import MyVideos from "./pages/MyVideos"
import VideoUpload from "./pages/VideoUpload"
import Quiz from "./pages/Quiz"
import Leaderboard from "./pages/Leaderboard"

const SIDEBAR_W = 260
const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",    icon: "🏠" },
  { id: "myvideos",    label: "My Videos",    icon: "🎬" },
  { id: "upload",      label: "Upload Video", icon: "⬆️" },
  { id: "quiz",        label: "Take Quiz",    icon: "📝" },
  { id: "leaderboard", label: "Leaderboard",  icon: "🏆" },
]

export default function App() {
  const { user, loading, signOut } = useAuth()
  const [pageState, setPageState] = useState({ name: "dashboard" })

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0c1a2e" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
        <div style={{ color: "#67e8f9", fontSize: 18 }}>Loading VideoLearnAI…</div>
      </div>
    </div>
  )

  if (!user) return <Auth />

  function navigate(name, extra = {}) {
    setPageState({ name, ...extra })
  }

  const { name: page, quizId, videoId } = pageState
  const avatar = user.email?.slice(0, 2).toUpperCase() || "??"
  const hue = user.email
    ? (user.email.charCodeAt(0) * 17 + user.email.charCodeAt(1) * 31) % 360
    : 180

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0c1a2e",
      fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: SIDEBAR_W, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "linear-gradient(160deg,#0c1a2e,#0f3460,#0e7490)",
        borderRight: "1px solid rgba(14,116,144,0.3)",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 10,
      }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>🎓</span>
            <span style={{ color: "#67e8f9", fontWeight: 800, fontSize: 18 }}>VideoLearnAI</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const isActive = page === item.id
            return (
              <button key={item.id} onClick={() => navigate(item.id)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", borderRadius: 10, border: "none",
                cursor: "pointer", textAlign: "left", width: "100%",
                background: isActive ? "rgba(103,232,249,0.15)" : "transparent",
                color: isActive ? "#67e8f9" : "#94a3b8",
                fontWeight: isActive ? 600 : 400, fontSize: 14,
                transition: "all 0.15s",
                borderLeft: isActive ? "3px solid #67e8f9" : "3px solid transparent",
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: `hsl(${hue},60%,40%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14,
            }}>{avatar}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </div>
              <div style={{ color: "#64748b", fontSize: 11 }}>Learner</div>
            </div>
          </div>
          <button onClick={signOut} style={{
            width: "100%", padding: "9px", borderRadius: 8, border: "none",
            background: "rgba(239,68,68,0.15)", color: "#f87171",
            fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: SIDEBAR_W, flex: 1, display: "flex",
        flexDirection: "column", minHeight: "100vh" }}>
        <header style={{
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", borderBottom: "1px solid rgba(14,116,144,0.2)",
          background: "rgba(12,26,46,0.95)", position: "sticky", top: 0, zIndex: 5,
        }}>
          <h2 style={{ color: "#e2e8f0", fontWeight: 700, margin: 0, fontSize: 20 }}>
            {NAV_ITEMS.find(n => n.id === page)?.label || "Dashboard"}
          </h2>
          <div style={{ color: "#64748b", fontSize: 13 }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short", year: "numeric", month: "short", day: "numeric"
            })}
          </div>
        </header>

        <div style={{ flex: 1 }}>
          {page === "dashboard"   && <Dashboard user={user} onNavigate={navigate} />}
          {page === "myvideos"    && <MyVideos user={user} onNavigate={navigate} />}
          {page === "upload"      && <VideoUpload user={user} onNavigate={navigate} />}
          {page === "quiz"        && <Quiz user={user} quizId={quizId} videoId={videoId} onNavigate={navigate} />}
          {page === "leaderboard" && <Leaderboard user={user} onNavigate={navigate} />}
        </div>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  )
}