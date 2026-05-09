import type { ProductAllergen } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'

type Props = {
  allergens: ProductAllergen[]
  locale: Locale
  compact?: boolean
}

export function AllergenList({ allergens, locale, compact = false }: Props) {
  if (allergens.length === 0) return null

  const contains = allergens.filter((a) => a.type === 'contains')
  const mayContain = allergens.filter((a) => a.type === 'may_contain')

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {allergens.map((a) => (
          <span
            key={a.allergen_id}
            title={t(locale, `allergen.${a.allergen_id}`)}
            className={`text-sm cursor-default ${a.type === 'may_contain' ? 'opacity-50' : ''}`}
          >
            {a.allergens.icon}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {contains.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
            {t(locale, 'menu.contains')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {contains.map((a) => (
              <span
                key={a.allergen_id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 text-[12px] font-medium text-red-700 dark:text-red-300"
              >
                <span>{a.allergens.icon}</span>
                {t(locale, `allergen.${a.allergen_id}`)}
              </span>
            ))}
          </div>
        </div>
      )}
      {mayContain.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
            {t(locale, 'menu.mayContain')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mayContain.map((a) => (
              <span
                key={a.allergen_id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-[12px] font-medium text-amber-700 dark:text-amber-300"
              >
                <span>{a.allergens.icon}</span>
                {t(locale, `allergen.${a.allergen_id}`)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
