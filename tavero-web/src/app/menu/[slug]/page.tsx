import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { MenuClient } from '@/components/MenuClient'
import { TrackVisit } from '@/components/TrackVisit'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { Category, Product, Menu, ProductAllergen, ProductVariant, Banner } from '@/lib/types'
import { detectLocale, t } from '@/lib/i18n'
import { SocialLinks } from '@/components/SocialLinks'

type Props = { params: { slug: string }; searchParams: { p?: string; lang?: string } }

export const revalidate = 60

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

const PALETTE: Record<string, { accent: string; accentSoft: string }> = {
  black:      { accent: '17 24 39',   accentSoft: '243 244 246' },
  wine:       { accent: '126 45 77',   accentSoft: '252 228 236' },
  sage:       { accent: '107 142 107', accentSoft: '232 240 232' },
  plum:       { accent: '124 58 237',  accentSoft: '237 233 254' },
  red:        { accent: '220 38 38',   accentSoft: '254 226 226' },
  orange:     { accent: '234 88 12',   accentSoft: '255 247 237' },
  brown:      { accent: '120 53 15',   accentSoft: '254 243 199' },
  teal:       { accent: '13 148 136',  accentSoft: '204 251 241' },
  azure:      { accent: '125 185 232', accentSoft: '214 236 250' },
  pink:       { accent: '244 166 182', accentSoft: '253 226 232' },
  gold:       { accent: '212 160 23',  accentSoft: '255 248 225' },
  terracotta: { accent: '194 65 12',   accentSoft: '254 215 170' },
}

const MADRID_WEEKDAY_TO_DAY: Record<string, number> = {
  dom: 0, lun: 1, mar: 2, mie: 3, 'mié': 3,
  jue: 4, vie: 5, sab: 6, 'sáb': 6,
}

function getMadridDayOfWeek() {
  const weekday = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date()).replace('.', '').toLowerCase()
  return MADRID_WEEKDAY_TO_DAY[weekday] ?? new Date().getDay()
}

type RestaurantRow = {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  menu_banner_url: string | null
  menu_font: string | null
  menu_accent_color: string | null
  phone: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  wifi_name: string | null
  wifi_password: string | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  twitter_url: string | null
  website_url: string | null
  whatsapp_number: string | null
}

const RESTAURANT_SELECT = 'id, name, slug, description, logo_url, menu_banner_url, menu_font, menu_accent_color, phone, address, latitude, longitude, wifi_name, wifi_password, instagram_url, facebook_url, tiktok_url, twitter_url, website_url, whatsapp_number'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = detectLocale(await headers())

  const result = await supabase
    .from('restaurants')
    .select('name, description, logo_url')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single() as { data: { name: string; description: string | null; logo_url: string | null } | null; error: { message: string } | null }

  if (result.error || !result.data) {
    return {
      title: locale === 'en' ? 'Menu not found' : 'Menú no encontrado',
      robots: { index: false, follow: false },
    }
  }

  const r = result.data
  const title = `${r.name} — ${locale === 'en' ? 'Menu' : 'Menú'}`
  const desc = r.description ?? (locale === 'en'
    ? `Browse the digital menu of ${r.name}.`
    : `Consulta el menú digital de ${r.name}.`)

  return {
    title,
    description: desc,
    openGraph: {
      title, description: desc, type: 'website',
      locale: locale === 'en' ? 'en_US' : 'es_ES',
      images: r.logo_url ? [{ url: r.logo_url, width: 512, height: 512, alt: r.name }] : [],
    },
    twitter: {
      card: 'summary_large_image', title, description: desc,
      images: r.logo_url ? [r.logo_url] : [],
    },
  }
}

export default async function MenuPage({ params, searchParams }: Props) {
  const headerLocale = detectLocale(await headers())
  const locale: import('@/lib/i18n').Locale =
    searchParams.lang === 'en' ? 'en' : searchParams.lang === 'es' ? 'es' : headerLocale

  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select(RESTAURANT_SELECT)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single() as { data: RestaurantRow | null; error: { message: string } | null }

  if (restaurantError || !restaurant) notFound()

  const activeProductIds = (await supabase.from('products').select('id').eq('restaurant_id', restaurant.id).eq('is_active', true)).data?.map((p: { id: string }) => p.id) ?? []

  const [categoriesResult, productsResult, allergensResult, labelsResult, variantsResult, menusResult, bannersResult] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, sort_order, restaurant_id, description, menu_id, image_url')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('id, category_id, name, description, price, image_url, sort_order, out_of_stock, product_availability(day_of_week)')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('product_allergens')
      .select('product_id, allergen_id, type, allergens(id, name, icon)')
      .in('product_id', activeProductIds),
    supabase
      .from('product_labels')
      .select('product_id, label')
      .in('product_id', activeProductIds),
    supabase
      .from('product_variants')
      .select('id, product_id, name, price, sort_order')
      .in('product_id', activeProductIds)
      .order('sort_order', { ascending: true }),
    supabase
      .from('menus')
      .select('id, restaurant_id, name, description, is_active, sort_order')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    (supabase as any)
      .from('restaurant_banners')
      .select('id, text, link_url, bg_color, text_color')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  const menuIds = (menusResult.data ?? []).map((m: { id: string }) => m.id)
  const schedulesResult = menuIds.length
    ? await (supabase as any)
        .from('menu_schedules')
        .select('menu_id, day_of_week, start_time, end_time')
        .in('menu_id', menuIds)
    : { data: [] }

  if (categoriesResult.error || productsResult.error) notFound()

  const categories: Category[] = (categoriesResult.data ?? []) as Category[]
  const menus: Menu[] = (menusResult.data ?? []) as Menu[]
  const banners: Banner[] = (bannersResult?.data ?? []) as Banner[]

  type ScheduleRow = { menu_id: string; day_of_week: number; start_time: string; end_time: string }
  const schedules: ScheduleRow[] = (schedulesResult?.data ?? []) as ScheduleRow[]

  const today = getMadridDayOfWeek()

  // Determine the active menu based on current day/time (Madrid timezone)
  const scheduledMenuId = (() => {
    if (menus.length === 0 || schedules.length === 0) return null
    const now = new Date()
    const madridTime = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Madrid',
    }).format(now)
    for (const menu of menus) {
      const slots = schedules.filter((s) => s.menu_id === menu.id && s.day_of_week === today)
      if (slots.some((s) => madridTime >= s.start_time.slice(0, 5) && madridTime <= s.end_time.slice(0, 5))) {
        return menu.id
      }
    }
    return null
  })()

  type ProductRow = {
    id: string
    category_id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    sort_order: number
    out_of_stock: boolean
    product_availability: { day_of_week: number }[] | null
  }

  const allProductRows = (productsResult.data ?? []) as ProductRow[]
  const allergenRows = (allergensResult.data ?? []) as { product_id: string; allergen_id: string; type: string; allergens: { id: string; name: string; icon: string } }[]
  const labelRows = (labelsResult.data ?? []) as { product_id: string; label: string }[]
  const variantRows = (variantsResult.data ?? []) as { id: string; product_id: string; name: string; price: number; sort_order: number }[]

  const allergensByProduct = new Map<string, ProductAllergen[]>()
  for (const row of allergenRows) {
    const list = allergensByProduct.get(row.product_id) ?? []
    list.push({
      allergen_id: row.allergen_id,
      type: row.type as 'contains' | 'may_contain',
      allergens: row.allergens,
    })
    allergensByProduct.set(row.product_id, list)
  }

  const labelsByProduct = new Map<string, string[]>()
  for (const row of labelRows) {
    const list = labelsByProduct.get(row.product_id) ?? []
    list.push(row.label)
    labelsByProduct.set(row.product_id, list)
  }

  const variantsByProduct = new Map<string, ProductVariant[]>()
  for (const row of variantRows) {
    const list = variantsByProduct.get(row.product_id) ?? []
    list.push({ id: row.id, name: row.name, price: row.price, sort_order: row.sort_order })
    variantsByProduct.set(row.product_id, list)
  }

  const availableProducts: Product[] = allProductRows
    .filter((p) => {
      const days = (p.product_availability ?? []).map((a) => a.day_of_week)
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
        out_of_stock: p.out_of_stock,
        availability: (p.product_availability ?? []).map((a) => a.day_of_week),
        allergens: allergensByProduct.get(p.id) ?? [],
        labels: labelsByProduct.get(p.id) ?? [],
        variants: variantsByProduct.get(p.id) ?? [],
      }))

  const productsByCategory = categories.reduce<Record<string, Product[]>>((acc, cat) => {
    acc[cat.id] = availableProducts.filter((p) => p.category_id === cat.id)
    return acc
  }, {})

  const categoriesWithProducts = categories.filter(
    (c) => (productsByCategory[c.id]?.length ?? 0) > 0,
  )

  const font = restaurant.menu_font ?? 'inter'
  const fontUrl = FONT_URL[font] ?? FONT_URL.inter
  const fontFamily = FONT_FAMILY[font] ?? FONT_FAMILY.inter
  const rawColor = restaurant.menu_accent_color ?? 'black'
  const palette = (() => {
    if (rawColor.startsWith('#')) {
      const h = rawColor.replace('#', '')
      const r = parseInt(h.slice(0, 2), 16) || 0
      const g = parseInt(h.slice(2, 4), 16) || 0
      const b = parseInt(h.slice(4, 6), 16) || 0
      const rs = Math.round(r + (255 - r) * 0.85)
      const gs = Math.round(g + (255 - g) * 0.85)
      const bs = Math.round(b + (255 - b) * 0.85)
      return { accent: `${r} ${g} ${b}`, accentSoft: `${rs} ${gs} ${bs}` }
    }
    return PALETTE[rawColor as keyof typeof PALETTE] ?? PALETTE.black
  })()

  const restaurantData = {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description,
    logo_url: restaurant.logo_url,
    menu_banner_url: restaurant.menu_banner_url,
    menu_accent_color: restaurant.menu_accent_color,
    menu_font: restaurant.menu_font,
    phone: restaurant.phone,
    address: restaurant.address,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    wifi_name: restaurant.wifi_name,
    wifi_password: restaurant.wifi_password,
    instagram_url: restaurant.instagram_url,
    facebook_url: restaurant.facebook_url,
    tiktok_url: restaurant.tiktok_url,
    twitter_url: restaurant.twitter_url,
    website_url: restaurant.website_url,
    whatsapp_number: restaurant.whatsapp_number,
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description ?? undefined,
    image: restaurant.logo_url ?? undefined,
    telephone: restaurant.phone ?? undefined,
    address: restaurant.address ? { '@type': 'PostalAddress', streetAddress: restaurant.address } : undefined,
    hasMenu: {
      '@type': 'Menu',
      hasMenuSection: categoriesWithProducts.map((cat) => ({
        '@type': 'MenuSection',
        name: cat.name,
        hasMenuItem: (productsByCategory[cat.id] ?? []).map((p) => ({
          '@type': 'MenuItem',
          name: p.name,
          description: p.description ?? undefined,
          offers: {
            '@type': 'Offer',
            price: p.price.toFixed(2),
            priceCurrency: 'EUR',
            availability: p.out_of_stock
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          },
        })),
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

      <TrackVisit restaurantId={restaurant.id} />

      <div className="menu-root min-h-screen bg-bg">
        <div className="max-w-lg mx-auto bg-bg min-h-screen flex flex-col shadow-xl shadow-black/5">
          <MenuClient
            restaurant={restaurantData}
            menus={menus}
            banners={banners}
            categories={categoriesWithProducts}
            productsByCategory={productsByCategory}
            allProducts={availableProducts}
            locale={locale}
            initialProductId={searchParams.p}
            scheduledMenuId={scheduledMenuId}
          />

          <footer className="pt-4 pb-8 border-t border-border">
            <SocialLinks restaurant={restaurantData} />
            <div className="flex items-center justify-center gap-3 mt-3 mb-2">
              <ThemeToggle />
              <div className="flex items-center gap-1 rounded-full border border-border bg-surface overflow-hidden">
                <a
                  href={`?lang=es${searchParams.p ? `&p=${searchParams.p}` : ''}`}
                  className={`px-3 py-1 text-[12px] font-semibold transition-colors ${locale === 'es' ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
                >
                  ES
                </a>
                <a
                  href={`?lang=en${searchParams.p ? `&p=${searchParams.p}` : ''}`}
                  className={`px-3 py-1 text-[12px] font-semibold transition-colors ${locale === 'en' ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
                >
                  EN
                </a>
              </div>
            </div>
            <p className="text-xs text-muted text-center">
              {t(locale, 'menu.digitalMenu')}{' '}
              <span className="font-semibold text-primary">Tavero</span>
            </p>
            <p className="text-[11px] text-muted/70 text-center mt-1">
              {t(locale, 'menu.footer', { year: new Date().getFullYear() })} ·{' '}
              <a href="/privacidad" className="underline hover:text-muted transition-colors">{t(locale, 'menu.privacy')}</a>
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}
