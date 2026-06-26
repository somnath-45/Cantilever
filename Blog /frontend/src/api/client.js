const BASE = '/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || JSON.stringify(err));
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth / User ─────────────────────────────────────────────────────────────

export async function login(username, password) {
  const body = new URLSearchParams({ username, password });
  const res = await fetch(`${BASE}/user/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return handle(res);
}

export async function signUp(username, email, password) {
  const res = await fetch(`${BASE}/user/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handle(res);
}

export async function getMe() {
  const res = await fetch(`${BASE}/user/me`, { headers: authHeaders() });
  return handle(res);
}

export async function getUserByName(username) {
  const res = await fetch(`${BASE}/user/${username}`, { headers: authHeaders() });
  return handle(res);
}

export async function updateUser(userId, data) {
  const res = await fetch(`${BASE}/user/update/${userId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function deleteUser(userId) {
  const res = await fetch(`${BASE}/user/delete/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handle(res);
}

// ─── Blogs ───────────────────────────────────────────────────────────────────

export async function createBlog(topic, text) {
  const res = await fetch(`${BASE}/blog/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ topic, text }),
  });
  return handle(res);
}

export async function getMyBlogs() {
  const res = await fetch(`${BASE}/blog/user_blog`, { headers: authHeaders() });
  if (res.status === 404) return [];
  return handle(res);
}

export async function getBlogsByTopic(topic) {
  const res = await fetch(`${BASE}/blog/${encodeURIComponent(topic)}`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return [];
  return handle(res);
}

export async function updateBlog(blogId, data) {
  const res = await fetch(`${BASE}/blog/${blogId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function deleteBlog(blogId) {
  const res = await fetch(`${BASE}/blog/${blogId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handle(res);
}
