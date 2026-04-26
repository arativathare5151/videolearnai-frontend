import { useState } from "react"
import { supabase } from "../lib/supabase"

const BACKEND = "http://127.0.0.1:8000"

export default function VideoUpload({ user, onNavigate }) {
  const [file, setFile]         = useState(null)
  const [title, setTitle]       = useState("")
  const [description, setDesc]  = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState("")
  const [error, setError]         = useState(null)

  function handleFilePick(e) {
    const picked = e.target.files[0]
    if (picked) {
      setFile(picked)
      if (!title) setTitle(picked.name.replace(/\.[^.]+$/, ""))
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      if (!title) setTitle(dropped.name.replace(/\.[^.]+$/, ""))
    }
  }

  async function handleUpload() {
    if (!file)  return setError("Please select a video file")
    if (!title) return setError("Please enter a title")

    setUploading(true)
    setError(null)

    try {
      setProgress("📤 Uploading video...")
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("user_id", user.id)

      setProgress("🎙️ Transcribing audio with Whisper...")
      const res = await fetch(`${BACKEND}/videos/upload`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Upload failed")
      }

      const data = await res.json()
      setProgress("✅ Done! Redirecting to your videos...")

      setTimeout(() => onNavigate("myvideos"), 1500)

    } catch (err) {
      setError(err.message)
      setProgress("")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: 32, background: "#0c1a2e", minHeight: "100vh" }}>
      <div style={{
        maxWidth: 640, background: "rgba(15,52,96,0.6)", borderRadius: 20,
        padding: 40, border: "1px solid rgba(14,116,144,0.2)"
      }}>
        <h3 style={{ color: "#67e8f9", fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
          Upload Educational Video
        </h3>
        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 32px" }}>
          We'll automatically transcribe, summarize and generate a quiz for you.
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => document.getElementById("fileInput").click()}
          style={{
            border: `2px dashed ${file ? "#22c55e" : "#0e7490"}`,
            borderRadius: 16, padding: "40px 32px", textAlign: "center",
            background: file ? "rgba(34,197,94,0.05)" : "rgba(14,116,144,0.05)",
            cursor: "pointer", marginBottom: 24, transition: "all 0.2s"
          }}
        >
          <input
            id="fileInput" type="file"
            accept="video/*" style={{ display: "none" }}
            onChange={handleFilePick}
          />
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {file ? "✅" : "📁"}
          </div>
          {file ? (
            <div>
              <p style={{ color: "#22c55e", fontWeight: 600, margin: "0 0 4px" }}>
                {file.name}
              </p>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <div>
              <p style={{ color: "#67e8f9", fontWeight: 600, margin: "0 0 6px" }}>
                Click to browse or drag & drop
              </p>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
                MP4, MOV, AVI supported · Max 500MB
              </p>
            </div>
          )}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Video Title *</label>
            <input
              placeholder="e.g. Introduction to Machine Learning"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Description (optional)</label>
            <textarea
              placeholder="What is this video about?"
              rows={3} value={description}
              onChange={e => setDesc(e.target.value)}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 13
            }}>{error}</div>
          )}

          {progress && (
            <div style={{
              background: "rgba(14,116,144,0.15)", border: "1px solid rgba(14,116,144,0.3)",
              borderRadius: 10, padding: "12px 16px", color: "#67e8f9", fontSize: 13
            }}>{progress}</div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              padding: "14px", borderRadius: 12, border: "none",
              background: uploading ? "#1e3a5f" : "linear-gradient(135deg,#0e7490,#0891b2)",
              color: uploading ? "#64748b" : "#fff",
              fontWeight: 700, fontSize: 15,
              cursor: uploading ? "not-allowed" : "pointer",
              boxShadow: uploading ? "none" : "0 4px 14px rgba(14,116,144,0.4)",
              marginTop: 8
            }}
          >
            {uploading ? progress || "Processing..." : "🚀 Upload & Process Video"}
          </button>

          {uploading && (
            <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", margin: 0 }}>
              ⏳ This may take 2-5 minutes depending on video length. Please don't close this page.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  color: "rgba(255,255,255,0.7)", fontSize: 13,
  fontWeight: 500, display: "block", marginBottom: 6
}

const inputStyle = {
  width: "100%", padding: "12px 16px", borderRadius: 10,
  border: "1.5px solid rgba(14,116,144,0.3)",
  background: "rgba(12,26,46,0.8)",
  color: "#e2e8f0", fontSize: 14, outline: "none",
  boxSizing: "border-box",
}