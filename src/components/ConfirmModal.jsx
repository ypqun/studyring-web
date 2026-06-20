export default function ConfirmModal({ title, message, confirmLabel = '확인', danger, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>
            취소
          </button>
          <button className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
