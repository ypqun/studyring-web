import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { watchMyStudies, createStudy } from '../lib/studyApi'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub = watchMyStudies(user.uid, (list) => {
      setStudies(list)
      setLoading(false)
    })
    return unsub
  }, [user])

  return (
    <div className="main-area">
      <div className="page-header">
        <div>
          <h1>내 스터디</h1>
          <p className="subtitle">참여 중인 스터디 {studies.length}개</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + 새 스터디 만들기
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)' }}>불러오는 중...</p>
      ) : studies.length === 0 ? (
        <div className="empty-state card">
          <h3>아직 참여 중인 스터디가 없어요</h3>
          <p>새 스터디를 만들거나, 초대 링크를 받아 참여해보세요.</p>
        </div>
      ) : (
        <div className="study-grid">
          {studies.map((s) => (
            <Link key={s.id} to={`/study/${s.id}`} className="study-card card">
              <h3>{s.name}</h3>
              <p>{s.description || '설명이 없습니다.'}</p>
              <div className="meta">멤버 {s.memberIds?.length || 0}명</div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateStudyModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => navigate(`/study/${id}`)}
        />
      )}
    </div>
  )
}

function CreateStudyModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('스터디명을 입력해주세요.')
      return
    }
    setSubmitting(true)
    try {
      const id = await createStudy({
        name: name.trim(),
        description: description.trim(),
        ownerId: user.uid,
        ownerNickname: user.displayName,
      })
      onCreated(id)
    } catch {
      setError('스터디 생성에 실패했습니다. 다시 시도해주세요.')
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>새 스터디 만들기</h3>
        <form onSubmit={handleCreate}>
          <div className="field">
            <label htmlFor="study-name">스터디명</label>
            <input id="study-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label htmlFor="study-desc">설명</label>
            <textarea
              id="study-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="어떤 스터디인가요?"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? '생성 중...' : '생성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
