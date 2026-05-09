'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ placeholder, value, onChange }: Props) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !focused) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && focused) {
        onChange('')
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [focused, onChange])

  return (
    <div className="px-5 py-2.5">
      <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
        focused
          ? 'border-accent/40 bg-surface'
          : 'border-border/60 bg-surface/80'
      }`}>
        <svg
          className="absolute left-3.5 w-4 h-4 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-primary placeholder:text-muted/60 search-input"
        />
        {value && (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus() }}
            className="absolute right-3 w-5 h-5 rounded-full bg-muted/20 flex items-center justify-center hover:bg-muted/30 transition-colors"
          >
            <svg className="w-3 h-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
