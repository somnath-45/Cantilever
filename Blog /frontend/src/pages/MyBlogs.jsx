import { useState, useEffect } from 'react'
import { getMyBlogs, createBlog, updateBlog, deleteBlog } from '../api/client'
import BlogModal from '../components/BlogModal'

export default function MyBlogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editBlog, setEditBlog] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    getMyBlogs()
      .then(setBlogs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (data) => {
    const blog = await createBlog(data.topic, data.text)
    setBlogs(b => [blog, ...b])
    setShowCreate(false)
  }

  const handleUpdate = async (data) => {
    const updated = await updateBlog(editBlog.id, data)
    setBlogs(b => b.map(x => x.id === updated.id ? updated : x))
    setEditBlog(null)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteBlog(deleteId)
      setBlogs(b => b.filter(x => x.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20 }}>
          <div className="page-title" style={{ paddingBottom: 0 }}>My Blogs</div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New post</button>
        </div>
      </div>

      <div className="page-body">
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner"><div className="spinner-dot" /><div className="spinner-dot" /><div className="spinner-dot" /></div>
        ) : blogs.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">✦</div>
            <div className="empty-title">No posts yet</div>
            <div className="empty-text">Click "New post" to publish your first blog.</div>
          </div>
        ) : (
          <div className="blog-grid">
            {blogs.map(b => (
              <div key={b.id} className="blog-card">
                <span className="blog-topic">{b.topic}</span>
                <p className="blog-text">{b.text}</p>
                <div className="blog-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditBlog(b)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(b.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <BlogModal title="New post" onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}

      {editBlog && (
        <BlogModal
          title="Edit post"
          initial={editBlog}
          onClose={() => setEditBlog(null)}
          onSave={handleUpdate}
        />
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Delete post</div>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
                This post will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--danger)' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
