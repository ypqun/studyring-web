import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export default function Topbar() {
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-mark" />
        스터디링
      </Link>
      {user && (
        <div className="topbar-right">
          <span>{user.displayName} 님</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            로그아웃
          </button>
        </div>
      )}
    </header>
  )
}
