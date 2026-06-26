import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { login, signUp, getMe } from '../api/client'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginSuccess } = useAuth()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
  const data = await login(form.username, form.password)

  localStorage.setItem('token', data.access_token)

  const me = await getMe()

  loginSuccess(data.access_token, me)
}else {
        await signUp(form.username, form.email, form.password)
        const data = await login(form.username, form.password)
        localStorage.setItem('token', data.access_token)
        const me = await getMe()
        loginSuccess(data.access_token, me)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-title">Inkwell</div>
          <div className="auth-subtitle">
            {mode === 'login' ? 'Welcome back. Sign in to continue.' : 'Create your account to start writing.'}
          </div>
        </div>

        <div className="auth-card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                placeholder="your_username"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
                required
                minLength={3}
              />
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Email <span style={{ color: 'var(--ink-faint)' }}>(optional)</span></label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? (
              <>Don't have an account? <a onClick={() => { setMode('signup'); setError('') }}>Sign up</a></>
            ) : (
              <>Already have an account? <a onClick={() => { setMode('login'); setError('') }}>Sign in</a></>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
