// =============================================================
//  src/lib/api.js  –  Central API client for backend calls
// =============================================================
// All backend calls go through this file.
// Set VITE_API_URL in your .env.local to your Railway URL.
// =============================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Videos ───────────────────────────────────────────────
export async function uploadVideo({ file, title, description, userId }) {
  const form = new FormData();
  form.append("file", file);
  form.append("title", title);
  form.append("description", description);
  form.append("user_id", userId);

  const res = await fetch(`${BASE_URL}/videos/upload-video`, {
    method: "POST",
    body: form, // multipart – no Content-Type header, browser sets boundary
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail);
  }
  return res.json();
}

export async function processAll(videoId) {
  return request(`/videos/process-all/${videoId}`, { method: "POST" });
}

export async function getUserVideos(userId) {
  return request(`/videos/user/${userId}`);
}

export async function getVideo(videoId) {
  return request(`/videos/${videoId}`);
}

export async function getVideoUrl(videoId) {
  return request(`/videos/${videoId}/url`);
}

// ── Quiz ─────────────────────────────────────────────────
export async function getQuiz(quizId) {
  return request(`/quiz/${quizId}`);
}

export async function submitQuiz({ quizId, userId, videoId, answers, timeTakenSeconds }) {
  return request("/quiz/submit", {
    method: "POST",
    body: JSON.stringify({
      quiz_id: quizId,
      user_id: userId,
      video_id: videoId,
      answers,
      time_taken_seconds: timeTakenSeconds,
    }),
  });
}

export async function getUserAttempts(userId) {
  return request(`/quiz/attempts/${userId}`);
}

// ── Leaderboard ───────────────────────────────────────────
export async function getLeaderboard() {
  return request("/leaderboard");
}

export async function getUserRank(userId) {
  return request(`/leaderboard/${userId}`);
}