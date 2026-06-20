import { useEffect, useState } from 'react'
import { watchSchedules, getAllAttendancesForStudy } from '../lib/studyApi'

export default function AttendanceTab({ study }) {
  const [schedules, setSchedules] = useState([])
  const [attendanceMap, setAttendanceMap] = useState({}) // scheduleId -> [uid, ...]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = watchSchedules(study.id, setSchedules)
    return unsub
  }, [study.id])

  const scheduleIds = schedules.map((s) => s.id).join(',')

  useEffect(() => {
    let active = true
    const ids = schedules.map((s) => s.id)
    getAllAttendancesForStudy(study.id, ids).then((map) => {
      if (active) {
        setAttendanceMap(map)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [study.id, scheduleIds])

  if (loading) {
    return <p style={{ color: 'var(--ink-soft)' }}>출석 데이터를 불러오는 중...</p>
  }

  const totalSessions = schedules.length
  const members = study.members || []

  const perMember = members.map((m) => {
    const attendedCount = Object.values(attendanceMap).filter((uids) => uids.includes(m.uid)).length
    const rate = totalSessions === 0 ? 0 : Math.round((attendedCount / totalSessions) * 100)
    return { ...m, attendedCount, rate }
  })
  perMember.sort((a, b) => b.rate - a.rate)

  const overallRate =
    totalSessions === 0 || members.length === 0
      ? 0
      : Math.round(
          (perMember.reduce((sum, m) => sum + m.attendedCount, 0) / (totalSessions * members.length)) * 100
        )

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card card">
          <div className="label">전체 세션 수</div>
          <div className="value">{totalSessions}</div>
        </div>
        <div className="stat-card card">
          <div className="label">멤버 수</div>
          <div className="value">{members.length}</div>
        </div>
        <div className="stat-card card">
          <div className="label">평균 출석률</div>
          <div className="value">{overallRate}%</div>
        </div>
      </div>

      <div className="list-section-head">
        <h2>멤버별 출석 현황</h2>
      </div>

      <div className="card">
        {totalSessions === 0 ? (
          <div className="empty-state">
            <h3>등록된 일정이 없어요</h3>
            <p>일정을 등록하면 출석률이 계산돼요.</p>
          </div>
        ) : (
          perMember.map((m) => (
            <div className="attendee-row" key={m.uid}>
              <div className="member-avatar">{m.nickname?.[0] || '?'}</div>
              <span className="attendee-name">{m.nickname}</span>
              <span className="attendance-count">
                {m.attendedCount}/{totalSessions}회
              </span>
              <div className="attendee-rate-bar">
                <div style={{ width: `${m.rate}%` }} />
              </div>
              <span className="attendee-rate-text">{m.rate}%</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
