import { useRef, useState } from 'react'

export function useToast() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = (msg: string) => {
    setMessage(msg)
    setVisible(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), 2500)
  }

  return { show, visible, message }
}
