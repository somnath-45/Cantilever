import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyBlogs, createBlog } from '../api/client'
import BlogModal from '../components/BlogModal'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    getMyBlogs()
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (data) => {
    const blog = await createBlog(data.topic, data.text)
    setBlogs(b => [blog, ...b])
    setShowCreate(false)
  }

  const recent = blogs.slice(0, 3)

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total posts</div>
            <div className="stat-value">{loading ? '—' : blogs.length}</div>
            <div className="stat-sub">All time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Signed in as</div>
            <div className="stat-value" style={{ fontSize: '1.2rem', marginTop: 6 }}>{user?.username}</div>
            <div className="stat-sub">{user?.email || 'No email set'}</div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setShowCreate(true)}>
            <div className="stat-label">Quick action</div>
            <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: 6, color: 'var(--accent)' }}>+ New post</div>
            <div className="stat-sub">Click to write</div>
          </div>
        </div>

        {/* Recent posts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Recent posts</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/blogs')}>View all →</button>
        </div>

        {loading ? (
          <div className="spinner"><div className="spinner-dot" /><div className="spinner-dot" /><div className="spinner-dot" /></div>
        ) : recent.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">✦</div>
            <div className="empty-title">No posts yet</div>
            <div className="empty-text">Start writing and your posts will appear here.</div>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Write your first post</button>
          </div>
        ) : (
          <div className="blog-grid">
            {recent.map(b => (
              <div key={b.id} className="blog-card">
                <span className="blog-topic">{b.topic}</span>
                <p className="blog-text">{b.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <BlogModal
          title="New post"
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}
    </>
  )
}
