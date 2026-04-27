'use client'

import type { Category } from '@/lib/types'

export function CategoryNav({ categories }: { categories: Category[] }) {
  if (categories.length < 2) return null

  return (
    <nav className="sticky top-0 z-20 bg-bg/95 backdrop-blur-md border-b border-border">
      <div className="overflow-x-auto scrollbar-none">
        <ul className="flex gap-2 px-6 py-3 whitespace-nowrap">
          {categories.map((cat) => (
            <li key={cat.id}>
              <a
                href={`#cat-${cat.id}`}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-surface border border-border text-xs font-semibold text-primary hover:bg-accentSoft hover:border-accent/40 transition-colors"
              >
                {cat.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
