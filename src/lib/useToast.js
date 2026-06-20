import { useCallback, useRef, useState } from 'react'

export function useToast() {
  const [message, setMessage] = useState('')
  const timerRef = useRef(null)

  const showToast = useCallback((msg) => {
    setMessage(msg)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setMessage(''), 2200)
  }, [])

  return { message, showToast }
}
