import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { MenuHeader } from '@/components/MenuHeader'
import { CategoryNav } from '@/components/CategoryNav'
import { CategorySection } from '@/components/CategorySection'
import type { Category, Product } from '@/lib/types'

type Props = { params: { slug: string } }

// Dynamic rendering → cambios en el menú se reflejan al instante
export const revalidate = 0

const FONT_URL: Record<string, string> = {
  inter:       'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  playfair:    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  lato:        'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
  montserrat:  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
}

const FONT_FAMILY: Record<string, string> = {
  inter:       "'Inter', sans-serif",
  playfair:    "'Playfair Display', serif",
  lato:        "'Lato', sans-serif",
  montserrat:  "'Montserrat', sans-serif",
}

// RGB values matching Tailwind's CSS-variable pattern (no rgb())
const PALETTE: Record<string, { accent: string; accentSoft: string }> = {
  amber:    { accent: '217 119 6',   accentSoft: '254 243 199' },
  emerald:  { accent: '5 150 105',   accentSoft: '209 250 229' },
  indigo:   { accent: '79 70 229',   accentSoft: '238 242 255' },
  teal:     { accent: '13 148 136',  accentSoft: '204 251 241' },
  rose:     { accent: '225 29 72',   accentSoft: '255 228 230' },
  slate:    { accent: '71 85 105',   accentSoft: '241 245 249' },
}

const MADRID_WEEKDAY_TO_DAY: Record<string, number> = {
  dom: 0,
  lun: 1,
  mar: 2,
  mie: 3,
  mié: 3,
  jue: 4,
  vie: 5,
  sab: 6,
  sáb: 6,
}

function getMadridDayOfWeek() {
  const weekday = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date()).replace('.', '').toLowerCase()
  return MADRID_WEEKDAY_TO_DAY[weekday] ?? new Date().getDay()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('name, description, logo_url')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return {
      title: 'Menú no encontrado',
      robots: { index: false, follow: false },
    }
  }

  const title = `${data.name} — Menú`
  const description = data.description ?? `Consulta el menú digital de ${data.name}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_ES',
      images: data.logo_url ? [{ url: data.logo_url, width: 512, height: 512, alt: data.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data.logo_url ? [data.logo_url] : [],
    },
  }
}

export default async function MenuPage({ params }: Props) {
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('id, name, slug, description, logo_url, menu_font, menu_accent_color')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (restaurantError) notFound()
  if (!restaurant) notFound()

  const [{ data: rawCategories, error: categoriesError }, { data: rawProducts, error: productsError }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, sort_order, restaurant_id, description')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('id, category_id, name, description, price, image_url, sort_order, product_availability(day_of_week)')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])
  if (categoriesError) notFound()
  if (productsError) notFound()

  const categories: Category[] = rawCategories ?? []
  const allProducts = rawProducts ?? []

  const today = getMadridDayOfWeek()

  const availableProducts: Product[] = allProducts
    .filter((p) => {
      const days: number[] = (p.product_availability ?? []).map(
        (a: { day_of_week: number }) => a.day_of_week,
      )
      return days.length === 0 || days.includes(today)
    })
    .map((p) => ({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      sort_order: p.sort_order,
      availability: (p.product_availability ?? []).map(
        (a: { day_of_week: number }) => a.day_of_week,
      ),
    }))

  const productsByCategory = categories.reduce<Record<string, Product[]>>((acc, cat) => {
    acc[cat.id] = availableProducts.filter((p) => p.category_id === cat.id)
    return acc
  }, {})

  const categoriesWithProducts = categories.filter(
    (c) => (productsByCategory[c.id]?.length ?? 0) > 0,
  )

  const hasAnything = availableProducts.length > 0

  const font = restaurant.menu_font ?? 'inter'
  const fontUrl = FONT_URL[font] ?? FONT_URL.inter
  const fontFamily = FONT_FAMILY[font] ?? FONT_FAMILY.inter
  const palette = PALETTE[restaurant.menu_accent_color ?? 'amber'] ?? PALETTE.amber

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={fontUrl} rel="stylesheet" />
      <style>{`
        .menu-root {
          --color-accent: ${palette.accent};
          --color-accent-soft: ${palette.accentSoft};
        }
        .menu-root, .menu-root * { font-family: ${fontFamily}; }
      `}</style>

      <div className="menu-root min-h-screen bg-bg">
        <div className="max-w-lg mx-auto bg-bg min-h-screen flex flex-col shadow-xl shadow-black/5">
          <MenuHeader restaurant={restaurant} />
          <CategoryNav categories={categoriesWithProducts} />

          <main className="flex-1 animate-fade-in">
            {!hasAnything ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-accentSoft flex items-center justify-center mb-4">
                  <span className="text-4xl">🍽️</span>
                </div>
                <p className="text-primary font-semibold text-base mb-1">No hay platos hoy</p>
                <p className="text-muted text-sm">Vuelve a consultarlo más tarde.</p>
              </div>
            ) : (
              categoriesWithProducts.map((cat) => (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  products={productsByCategory[cat.id] ?? []}
                />
              ))
            )}
          </main>

          <footer className="py-6 text-center border-t border-border space-y-1.5">
            <p className="text-xs text-muted">
              Menú digital por{' '}
              <span className="font-semibold text-primary">Tavero</span>
            </p>
            <p className="text-[11px] text-muted/70">
              © {new Date().getFullYear()} Tavero ·{' '}
              <a href="/privacidad" className="underline hover:text-muted transition-colors">Privacidad</a>
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}
