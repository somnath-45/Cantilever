import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateUser, deleteUser } from '../api/client'

function initials(name = '') {
  return name.slice(0, 2).toUpperCase()
}

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await updateUser(user.id, {
        username: form.username || undefined,
        email: form.email || undefined,
      })
      setUser(updated)
      setSuccess('Profile updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteUser(user.id)
      logout()
      navigate('/auth')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Profile</div>
      </div>

      <div className="page-body" style={{ maxWidth: 560 }}>
        {/* Identity card */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div className="profile-info-row">
            <div className="profile-avatar-lg">{initials(user?.username)}</div>
            <div className="profile-meta">
              <div className="profile-username">{user?.username}</div>
              <div className="profile-email">{user?.email || 'No email set'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: 4 }}>ID #{user?.id}</div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div className="section-title">Edit details</div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                value={form.username}
                onChange={set('username')}
                minLength={3}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card card-pad" style={{ borderColor: '#e8b4b0' }}>
          <div className="section-title" style={{ color: 'var(--danger)' }}>Danger zone</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-soft)', marginBottom: 16 }}>
            Permanently delete your account and all your posts. This cannot be undone.
          </p>
          <button className="btn btn-danger" style={{ border: '1px solid var(--danger)' }} onClick={() => setShowDeleteConfirm(true)}>
            Delete account
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Delete account?</div>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
                Your account and all posts will be permanently deleted. You will be signed out immediately.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--danger)' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
