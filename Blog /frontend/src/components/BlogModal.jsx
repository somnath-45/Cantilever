import { useState } from 'react'

export default function BlogModal({ title, initial = {}, onClose, onSave }) {
  const [form, setForm] = useState({ topic: initial.topic || '', text: initial.text || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.topic.trim() || !form.text.trim()) {
      setError('Topic and content are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Topic</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Technology, Travel, Science…"
                value={form.topic}
                onChange={set('topic')}
                maxLength={100}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Content</label>
              <textarea
                className="form-textarea"
                placeholder="Write your post here…"
                value={form.text}
                onChange={set('text')}
                required
                minLength={20}
                style={{ minHeight: 180 }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 4 }}>
                Minimum 20 characters
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
