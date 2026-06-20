import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { watchStudy, updateStudy, deleteStudy } from '../lib/studyApi'
import { useToast } from '../lib/useToast'
import Toast from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'
import GoalsTab from '../components/GoalsTab'
import ScheduleTab from '../components/ScheduleTab'
import AttendanceTab from '../components/AttendanceTab'

export default function StudyDetailPage() {
  const { studyId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { message, showToast } = useToast()

  const [study, setStudy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('goals')
  const [editing, setEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const unsub = watchStudy(studyId, (s) => {
      setStudy(s)
      setLoading(false)
    })
    return unsub
  }, [studyId])

  if (loading) {
    return (
      <div className="main-area">
        <p style={{ color: 'var(--ink-soft)' }}>불러오는 중...</p>
      </div>
    )
  }

  if (!study) {
    return (
      <div className="main-area">
        <div className="empty-state card">
          <h3>스터디를 찾을 수 없어요</h3>
          <p>삭제되었거나 존재하지 않는 스터디입니다.</p>
        </div>
      </div>
    )
  }

  if (!study.memberIds?.includes(user.uid)) {
    return (
      <div className="main-area">
        <div className="empty-state card">
          <h3>접근 권한이 없어요</h3>
          <p>이 스터디의 멤버만 볼 수 있습니다.</p>
        </div>
      </div>
    )
  }

  const isOwner = study.ownerId === user.uid
  const inviteUrl = `${window.location.origin}${import.meta.env.BASE_URL}join/${study.inviteCode}`

  async function handleDelete() {
    await deleteStudy(study.id)
    navigate('/')
  }

  function copyInviteLink() {
    navigator.clipboard
      .writeText(inviteUrl)
      .then(() => showToast('초대 링크를 복사했어요.'))
      .catch(() => showToast('복사에 실패했습니다.'))
  }

  return (
    <div className="main-area wide">
      <div className="study-header">
        <div>
          {editing ? (
            <EditStudyForm
              study={study}
              onCancel={() => setEditing(false)}
              onSaved={() => {
                setEditing(false)
                showToast('스터디 정보를 수정했어요.')
              }}
            />
          ) : (
            <>
              <h1>{study.name}</h1>
              <p className="study-desc">{study.description || '설명이 없습니다.'}</p>
            </>
          )}
        </div>
        {isOwner && !editing && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
              정보 수정
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
              스터디 삭제
            </button>
          </div>
        )}
      </div>

      <div className="member-strip">
        {study.members?.map((m) => (
          <span className="member-chip" key={m.uid}>
            <span className="member-avatar">{m.nickname?.[0] || '?'}</span>
            {m.nickname}
            {m.uid === study.ownerId && ' (방장)'}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="invite-box">
          <code>{inviteUrl}</code>
          <button className="btn btn-secondary btn-sm" onClick={copyInviteLink}>
            링크 복사
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'goals' ? 'active' : ''}`} onClick={() => setTab('goals')}>
          목표
        </button>
        <button className={`tab ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}>
          일정 / 출석
        </button>
        <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>
          출석 현황
        </button>
      </div>

      {tab === 'goals' && <GoalsTab studyId={study.id} onToast={showToast} />}
      {tab === 'schedule' && <ScheduleTab studyId={study.id} onToast={showToast} />}
      {tab === 'attendance' && <AttendanceTab study={study} />}

      <Toast message={message} />

      {showDeleteConfirm && (
        <ConfirmModal
          title="스터디를 삭제할까요?"
          message="이 작업은 되돌릴 수 없으며, 목표/일정/출석 기록이 모두 함께 삭제됩니다."
          confirmLabel="삭제"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

function EditStudyForm({ study, onCancel, onSaved }) {
  const [name, setName] = useState(study.name)
  const [description, setDescription] = useState(study.description || '')

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return
    await updateStudy(study.id, { name: name.trim(), description: description.trim() })
    onSaved()
  }

  return (
    <form onSubmit={handleSave} style={{ maxWidth: 480 }}>
      <div className="field">
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ fontSize: 20, fontWeight: 700 }} />
      </div>
      <div className="field">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary btn-sm">
          저장
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  )
}
