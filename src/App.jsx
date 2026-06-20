import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import Topbar from './components/Topbar'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import StudyDetailPage from './pages/StudyDetailPage'
import JoinPage from './pages/JoinPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="main-area">
        <p style={{ color: 'var(--ink-soft)' }}>불러오는 중...</p>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />
  }
  return children
}

function AppRoutes() {
  return (
    <div className="app-shell">
      <Topbar />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/study/:studyId"
          element={
            <PrivateRoute>
              <StudyDetailPage />
            </PrivateRoute>
          }
        />
        <Route path="/join/:code" element={<JoinPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
