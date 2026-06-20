import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { getStudyByInviteCode, joinStudy } from '../lib/studyApi'

export default function JoinPage() {
  const { code } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [study, setStudy] = useState(null)
  const [status, setStatus] = useState('loading') // loading | not-found | ready | joining
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getStudyByInviteCode(code).then((s) => {
      if (!active) return
      if (!s) {
        setStatus('not-found')
      } else {
        setStudy(s)
        setStatus('ready')
      }
    })
    return () => {
      active = false
    }
  }, [code])

  async function handleJoin() {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/join/${code}` } })
      return
    }
    setStatus('joining')
    try {
      await joinStudy(study.id, user.uid, user.displayName)
      navigate(`/study/${study.id}`)
    } catch {
      setError('참여에 실패했습니다. 다시 시도해주세요.')
      setStatus('ready')
    }
  }

  if (authLoading || status === 'loading') {
    return (
      <div className="main-area">
        <p style={{ color: 'var(--ink-soft)', textAlign: 'center', marginTop: 60 }}>불러오는 중...</p>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="main-area">
        <div className="join-card card">
          <h1>유효하지 않은 링크예요</h1>
          <p className="subtitle" style={{ marginTop: 8 }}>
            초대 링크가 만료되었거나 잘못된 주소입니다.
          </p>
        </div>
      </div>
    )
  }

  const alreadyMember = user && study.memberIds?.includes(user.uid)

  return (
    <div className="main-area">
      <div className="join-card card">
        <div className="ring-icon" />
        <h1>{study.name}</h1>
        <p className="subtitle" style={{ marginTop: 8, marginBottom: 24 }}>
          {study.description || '스터디 초대를 받았어요.'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>
          현재 멤버 {study.memberIds?.length || 0}명
        </p>

        {error && <p className="error-text">{error}</p>}

        {alreadyMember ? (
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/study/${study.id}`)}>
            스터디로 이동하기
          </button>
        ) : (
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleJoin} disabled={status === 'joining'}>
            {status === 'joining' ? '참여하는 중...' : !user ? '로그인하고 참여하기' : '참여하기'}
          </button>
        )}
      </div>
    </div>
  )
}
