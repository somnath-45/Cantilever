import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import MyBlogs from './pages/MyBlogs'
import Explore from './pages/Explore'
import Profile from './pages/Profile'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="spinner" style={{ minHeight: '100vh' }}>
      <div className="spinner-dot" /><div className="spinner-dot" /><div className="spinner-dot" />
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="blogs" element={<MyBlogs />} />
        <Route path="explore" element={<Explore />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
