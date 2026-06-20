import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.redirectTo || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!id.trim() || !password) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }
    if (mode === 'signup' && !nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signup(id, password, nickname)
      } else {
        await login(id, password)
      }
      navigate(redirectTo)
    } catch (err) {
      setError(toFriendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card card">
      <h1>{mode === 'login' ? '로그인' : '회원가입'}</h1>
      <p className="subtitle">
        {mode === 'login' ? '스터디링에 다시 오신 것을 환영해요.' : '몇 가지만 입력하면 바로 시작할 수 있어요.'}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="id">아이디</label>
          <input id="id" type="text" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" />
        </div>

        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {mode === 'signup' && (
          <div className="field">
            <label htmlFor="nickname">닉네임</label>
            <input id="nickname" type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </button>
      </form>

      <div className="auth-switch">
        {mode === 'login' ? (
          <>
            계정이 없으신가요?{' '}
            <button onClick={() => { setMode('signup'); setError('') }}>회원가입</button>
          </>
        ) : (
          <>
            이미 계정이 있으신가요?{' '}
            <button onClick={() => { setMode('login'); setError('') }}>로그인</button>
          </>
        )}
      </div>
    </div>
  )
}

function toFriendlyError(err) {
  const code = err?.code || ''
  if (code.includes('email-already-in-use')) return '이미 사용 중인 아이디입니다.'
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return '아이디 또는 비밀번호가 올바르지 않습니다.'
  if (code.includes('weak-password')) return '비밀번호는 6자 이상이어야 합니다.'
  if (code.includes('invalid-email')) return '아이디 형식이 올바르지 않습니다. (특수문자 제외 영문/숫자 권장)'
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
}
