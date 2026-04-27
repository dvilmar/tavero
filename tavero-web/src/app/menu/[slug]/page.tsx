import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { MenuHeader } from '@/components/MenuHeader'
import { CategoryNav } from '@/components/CategoryNav'
import { CategorySection } from '@/components/CategorySection'
import type { Category, Product } from '@/lib/types'

type Props = { params: { slug: string } }

// ISR: regenerate at most once per minute
export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('restaurants')
    .select('name, description, logo_url')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!data) {
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
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, slug, description, logo_url')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!restaurant) notFound()

  const [{ data: rawCategories }, { data: rawProducts }] = await Promise.all([
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

  const categories: Category[] = rawCategories ?? []
  const allProducts = rawProducts ?? []

  const today = new Date().getDay()

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

  return (
    <div className="min-h-screen bg-bg">
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

        <footer className="py-6 text-center border-t border-border">
          <p className="text-xs text-muted">
            Menú digital por{' '}
            <span className="font-semibold text-primary">Tavero</span>
          </p>
        </footer>
      </div>
    </div>
  )
}
