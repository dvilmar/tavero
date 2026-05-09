'use client'

import { useState } from 'react'
import type { Banner } from '@/lib/types'

type Props = { banners: Banner[] }

export function BannerBar({ banners }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const visible = banners.filter((b) => !dismissed.has(b.id))
  if (visible.length === 0) return null

  return (
    <div className="flex flex-col">
      {visible.map((banner) => {
        const inner = (
          <div className="flex items-center justify-between px-4 py-2.5 gap-3">
            <p
              className="text-[13px] font-medium leading-snug flex-1 text-center"
              style={{ color: banner.text_color }}
            >
              {banner.text}
            </p>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDismissed((prev) => { const next = new Set(prev); next.add(banner.id); return next })
              }}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: banner.text_color }}
              aria-label="Cerrar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )

        return banner.link_url ? (
          <a
            key={banner.id}
            href={banner.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border-b border-black/10 hover:brightness-95 transition-all"
            style={{ backgroundColor: banner.bg_color }}
          >
            {inner}
          </a>
        ) : (
          <div
            key={banner.id}
            className="border-b border-black/10"
            style={{ backgroundColor: banner.bg_color }}
          >
            {inner}
          </div>
        )
      })}
    </div>
  )
}
