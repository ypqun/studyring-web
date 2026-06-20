import { useEffect, useState } from 'react'
import { watchGoals, addGoal, updateGoal, deleteGoal } from '../lib/studyApi'
import ConfirmModal from './ConfirmModal'

export default function GoalsTab({ studyId, onToast }) {
  const [goals, setGoals] = useState([])
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    const unsub = watchGoals(studyId, setGoals)
    return unsub
  }, [studyId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim() || !deadline) return
    await addGoal(studyId, { title: title.trim(), deadline })
    setTitle('')
    setDeadline('')
    onToast('목표를 등록했어요.')
  }

  async function toggleDone(goal) {
    await updateGoal(studyId, goal.id, { done: !goal.done })
  }

  function startEdit(goal) {
    setEditingId(goal.id)
    setEditTitle(goal.title)
    setEditDeadline(goal.deadline)
  }

  async function saveEdit(goalId) {
    if (!editTitle.trim() || !editDeadline) return
    await updateGoal(studyId, goalId, { title: editTitle.trim(), deadline: editDeadline })
    setEditingId(null)
    onToast('목표를 수정했어요.')
  }

  async function handleDelete() {
    await deleteGoal(studyId, deleteTarget.id)
    setDeleteTarget(null)
    onToast('목표를 삭제했어요.')
  }

  const today = new Date().toISOString().slice(0, 10)
  const sorted = [...goals].sort((a, b) => Number(a.done) - Number(b.done))

  return (
    <div>
      <form className="inline-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="목표를 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <button type="submit" className="btn btn-primary btn-sm">
          추가
        </button>
      </form>

      <div className="card">
        {sorted.length === 0 ? (
          <div className="empty-state">
            <h3>등록된 목표가 없어요</h3>
            <p>이번 스터디에서 달성하고 싶은 목표를 추가해보세요.</p>
          </div>
        ) : (
          sorted.map((goal) =>
            editingId === goal.id ? (
              <div className="goal-row" key={goal.id}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 3 }}
                />
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 3 }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => saveEdit(goal.id)}>
                  저장
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                  취소
                </button>
              </div>
            ) : (
              <div className="goal-row" key={goal.id}>
                <div
                  className={`checkbox ${goal.done ? 'checked' : ''}`}
                  onClick={() => toggleDone(goal)}
                  role="button"
                  aria-label="목표 완료 체크"
                >
                  {goal.done && '✓'}
                </div>
                <span className={`goal-title ${goal.done ? 'done' : ''}`}>{goal.title}</span>
                <span className={`goal-deadline ${!goal.done && goal.deadline < today ? 'overdue' : ''}`}>
                  ~{goal.deadline}
                </span>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => startEdit(goal)} aria-label="수정">
                    ✎
                  </button>
                  <button className="icon-btn" onClick={() => setDeleteTarget(goal)} aria-label="삭제">
                    ✕
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="목표를 삭제할까요?"
          message={`"${deleteTarget.title}" 목표가 삭제됩니다.`}
          confirmLabel="삭제"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
