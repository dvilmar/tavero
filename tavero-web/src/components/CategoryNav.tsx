'use client'

import { useState, useEffect, useRef } from 'react'
import type { Category } from '@/lib/types'

export function CategoryNav({ categories }: { categories: Category[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const navRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (categories.length < 2) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          )
          setActiveId(topmost.target.id.replace('cat-', ''))
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [categories])

  useEffect(() => {
    if (!activeId || !navRef.current) return
    const pill = navRef.current.querySelector(`[data-cat="${activeId}"]`)
    if (pill) {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeId])

  if (categories.length < 2) return null

  return (
    <nav className="sticky top-0 z-20 bg-bg/95 backdrop-blur-md border-b border-border/50">
      <div className="overflow-x-auto scrollbar-none">
        <ul ref={navRef} className="flex gap-1.5 px-5 py-2.5 whitespace-nowrap">
          {categories.map((cat) => {
            const isActive = activeId === cat.id
            return (
              <li key={cat.id}>
                <a
                  href={`#cat-${cat.id}`}
                  data-cat={cat.id}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  {cat.name}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
