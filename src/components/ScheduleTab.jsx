import { useEffect, useState } from 'react'
import {
  watchSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  watchAttendances,
  checkAttendance,
  cancelAttendance,
} from '../lib/studyApi'
import { useAuth } from '../contexts/useAuth'
import ConfirmModal from './ConfirmModal'

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export default function ScheduleTab({ studyId, onToast }) {
  const [schedules, setSchedules] = useState([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ title: '', date: '', time: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filter, setFilter] = useState('all') // all | today

  useEffect(() => {
    const unsub = watchSchedules(studyId, setSchedules)
    return unsub
  }, [studyId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim() || !date || !time) return
    await addSchedule(studyId, { title: title.trim(), date, time })
    setTitle('')
    setDate('')
    setTime('')
    onToast('일정을 등록했어요.')
  }

  function startEdit(s) {
    setEditingId(s.id)
    setEditData({ title: s.title, date: s.date, time: s.time })
  }

  async function saveEdit(id) {
    if (!editData.title.trim() || !editData.date || !editData.time) return
    await updateSchedule(studyId, id, editData)
    setEditingId(null)
    onToast('일정을 수정했어요.')
  }

  async function handleDelete() {
    await deleteSchedule(studyId, deleteTarget.id)
    setDeleteTarget(null)
    onToast('일정을 삭제했어요.')
  }

  const today = new Date().toISOString().slice(0, 10)
  const visible = filter === 'today' ? schedules.filter((s) => s.date === today) : schedules

  return (
    <div>
      <form className="inline-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="일정 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <button type="submit" className="btn btn-primary btn-sm">
          추가
        </button>
      </form>

      <div className="list-section-head">
        <div className="filter-toggle">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            전체 일정
          </button>
          <button className={filter === 'today' ? 'active' : ''} onClick={() => setFilter('today')}>
            오늘 일정
          </button>
        </div>
      </div>

      <div className="card">
        {visible.length === 0 ? (
          <div className="empty-state">
            <h3>{filter === 'today' ? '오늘 예정된 일정이 없어요' : '등록된 일정이 없어요'}</h3>
            <p>스터디 모임 일정을 추가해보세요.</p>
          </div>
        ) : (
          visible.map((s) =>
            editingId === s.id ? (
              <div className="schedule-row" key={s.id}>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 3 }}
                />
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 3 }}
                />
                <input
                  type="time"
                  value={editData.time}
                  onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                  style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 3 }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => saveEdit(s.id)}>
                  저장
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                  취소
                </button>
              </div>
            ) : (
              <ScheduleRow
                key={s.id}
                schedule={s}
                studyId={studyId}
                onEdit={() => startEdit(s)}
                onDelete={() => setDeleteTarget(s)}
                onToast={onToast}
              />
            )
          )
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="일정을 삭제할까요?"
          message={`"${deleteTarget.title}" 일정과 관련 출석 기록이 함께 삭제됩니다.`}
          confirmLabel="삭제"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

function ScheduleRow({ schedule, studyId, onEdit, onDelete, onToast }) {
  const { user } = useAuth()
  const [attendances, setAttendances] = useState([])

  useEffect(() => {
    const unsub = watchAttendances(studyId, schedule.id, setAttendances)
    return unsub
  }, [studyId, schedule.id])

  const checked = attendances.some((a) => a.id === user.uid)
  const [, m, d] = schedule.date.split('-').map(Number)

  async function toggleAttendance() {
    if (checked) {
      await cancelAttendance(studyId, schedule.id, user.uid)
      onToast('출석을 취소했어요.')
    } else {
      await checkAttendance(studyId, schedule.id, user.uid, user.displayName)
      onToast('출석 완료!')
    }
  }

  return (
    <div className="schedule-row">
      <div className="schedule-date-badge">
        <span className="month">{MONTH_LABELS[m - 1]}</span>
        <span className="day">{d}</span>
      </div>
      <div className="schedule-info">
        <div className="title">{schedule.title}</div>
        <div className="time">
          {schedule.time} · 출석 {attendances.length}명
        </div>
      </div>
      <button className={`attend-stamp ${checked ? 'checked' : ''}`} onClick={toggleAttendance}>
        {checked ? '✓ 출석함' : '출석하기'}
      </button>
      <div className="row-actions">
        <button className="icon-btn" onClick={onEdit} aria-label="수정">
          ✎
        </button>
        <button className="icon-btn" onClick={onDelete} aria-label="삭제">
          ✕
        </button>
      </div>
    </div>
  )
}
