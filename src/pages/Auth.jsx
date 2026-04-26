import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [message, setMessage]   = useState(null)

async function handleSubmit() {
  setLoading(true)
  setError(null)
  setMessage(null)

  if (isSignUp) {
    // Sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }
    // Auto sign in immediately after signup
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (signInError) {
      setMessage('Account created! Please sign in.')
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }
  setLoading(false)
}

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg,#0c1a2e 0%,#0f3460 50%,#0e7490 100%)',
      fontFamily: "'Inter',system-ui,sans-serif"
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '48px',
        borderRight: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🎓</div>
          <h1 style={{ color: '#67e8f9', fontSize: 42, fontWeight: 800,
            margin: '0 0 16px', letterSpacing: '-1px' }}>
            VideoLearnAI
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18,
            lineHeight: 1.6, margin: '0 0 48px' }}>
            Upload videos, get instant transcripts, summaries and AI-generated quizzes
          </p>
          {[
            { icon: '🎬', text: 'Upload any educational video' },
            { icon: '📝', text: 'Auto-generated transcripts' },
            { icon: '🤖', text: 'AI summaries & key topics' },
            { icon: '🏆', text: 'Quiz yourself & compete' },
          ].map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 20px', marginBottom: 10, borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(103,232,249,0.15)', textAlign: 'left'
            }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 460, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%' }}>
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 4, marginBottom: 32,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {['Sign In', 'Sign Up'].map((label, i) => {
              const active = isSignUp === (i === 1)
              return (
                <button key={label} onClick={() => {
                  setIsSignUp(i === 1); setError(null); setMessage(null)
                }} style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  background: active ? '#0e7490' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s'
                }}>{label}</button>
              )
            })}
          </div>

          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 28px' }}>
            {isSignUp ? 'Start learning smarter today' : 'Sign in to continue learning'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isSignUp && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input placeholder="Enter your full name" value={fullName}
                  onChange={e => setFullName(e.target.value)} style={inputStyle} />
              </div>
            )}
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="Enter your email" value={email}
                onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" placeholder="Enter your password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={inputStyle} />
            </div>

            {error && <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 13
            }}>{error}</div>}

            {message && <div style={{
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 10, padding: '12px 16px', color: '#86efac', fontSize: 13
            }}>{message}</div>}

            <button onClick={handleSubmit} disabled={loading} style={{
              padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? '#334155' : 'linear-gradient(135deg,#0e7490,#0891b2)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(14,116,144,0.4)', marginTop: 4
            }}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account →' : 'Sign In →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  color: 'rgba(255,255,255,0.7)', fontSize: 13,
  fontWeight: 500, display: 'block', marginBottom: 6
}

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 10,
  border: '1.5px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.07)',
  color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}