'use client'

import type { Menu } from '@/lib/types'

type Props = {
  menus: Menu[]
  activeMenuId: string | null
  onSelect: (menuId: string | null) => void
}

export function MenuTabs({ menus, activeMenuId, onSelect }: Props) {
  if (menus.length === 0) return null

  return (
    <div className="px-5 pt-3 pb-1">
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex gap-1.5 whitespace-nowrap">
          {menus.map((menu) => {
            const isActive = activeMenuId === menu.id
            return (
              <button
                key={menu.id}
                onClick={() => onSelect(menu.id)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {menu.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
