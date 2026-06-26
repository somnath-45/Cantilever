import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function initials(name = '') {
  return name.slice(0, 2).toUpperCase()
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-name">Inkwell</div>
          <div className="brand-tagline">Your writing space</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">◈</span> Dashboard
          </NavLink>
          <NavLink to="/blogs" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">✦</span> My Blogs
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">◉</span> Explore
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">◎</span> Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-pill">
              <div className="user-avatar">{initials(user.username)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                </div>
                {user.email && (
                  <div className="user-email" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          )}
          <button className="nav-link" onClick={handleLogout} style={{ marginTop: 8, color: '#c0392b' }}>
            <span className="nav-icon">↩</span> Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
