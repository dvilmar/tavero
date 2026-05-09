import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'

const LABEL_ICONS: Record<string, string> = {
  vegan: '🌱',
  vegetarian: '🥗',
  spicy: '🌶️',
  gluten_free: '🌾',
  dairy_free: '🥛',
  new: '✨',
  bestseller: '⭐',
  homemade: '👩‍🍳',
  frozen: '❄️',
  on_request: '🔔',
}

export function LabelBadge({ label, locale }: { label: string; locale: Locale }) {
  const icon = LABEL_ICONS[label] ?? '🏷️'
  const text = t(locale, `label.${label}`)

  return (
    <span className={`label-${label} inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold leading-tight`}>
      <span className="text-[10px]">{icon}</span>
      {text}
    </span>
  )
}
