'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import type { Category, Product, Restaurant, Menu, Banner, ProductVariant } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import { MenuHeader } from '@/components/MenuHeader'
import { MenuTabs } from '@/components/MenuTabs'
import { CategoryNav } from '@/components/CategoryNav'
import { CategorySection } from '@/components/CategorySection'
import { SearchBar } from '@/components/SearchBar'
import { ProductBottomSheet } from '@/components/ProductBottomSheet'
import { BannerBar } from '@/components/BannerBar'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { CartButton } from '@/components/CartButton'
import { CartSheet } from '@/components/CartSheet'
import { OrderModeBanner } from '@/components/OrderModeBanner'
import type { CartItem } from '@/lib/cart'
import { cartKey, cartTotal } from '@/lib/cart'

type Props = {
  restaurant: Restaurant
  menus: Menu[]
  banners: Banner[]
  categories: Category[]
  productsByCategory: Record<string, Product[]>
  allProducts: Product[]
  locale: Locale
  initialProductId?: string
  scheduledMenuId?: string | null
}

export function MenuClient({ restaurant, menus, banners, categories, productsByCategory, allProducts, locale, initialProductId, scheduledMenuId }: Props) {
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const defaultMenuId = scheduledMenuId ?? (menus.length > 0 ? menus[0].id : null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(defaultMenuId)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderingMode, setOrderingMode] = useState(false)
  const hasOrdering = !!restaurant.whatsapp_number

  const activateOrdering = useCallback(() => setOrderingMode(true), [])
  const deactivateOrdering = useCallback(() => {
    setOrderingMode(false)
    setCart([])
    setCartOpen(false)
  }, [])

  useEffect(() => {
    if (!initialProductId) return
    const product = allProducts.find((p) => p.id === initialProductId)
    if (product) setSelectedProduct(product)
  }, [initialProductId, allProducts])

  const addToCart = useCallback((product: Product, variant?: ProductVariant) => {
    const newItem: CartItem = {
      productId: product.id,
      productName: product.name,
      variantId: variant?.id,
      variantName: variant?.name,
      price: variant ? variant.price : product.price,
      qty: 1,
    }
    const key = cartKey(newItem)
    setCart((prev) => {
      const existing = prev.find((i) => cartKey(i) === key)
      if (existing) return prev.map((i) => cartKey(i) === key ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, newItem]
    })
  }, [])

  const updateQty = useCallback((key: string, delta: number) => {
    setCart((prev) => prev
      .map((i) => cartKey(i) === key ? { ...i, qty: i.qty + delta } : i)
      .filter((i) => i.qty > 0)
    )
  }, [])

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)
  const total = cartTotal(cart)

  const visibleCategories = useMemo(() => {
    let cats = categories
    if (menus.length > 0 && activeMenuId) {
      cats = cats.filter((c) => c.menu_id === activeMenuId || c.menu_id === null)
    }
    if (!search.trim()) return cats
    return cats.filter((cat) => {
      const products = productsByCategory[cat.id] ?? []
      return products.some((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [search, categories, productsByCategory, menus, activeMenuId])

  const getFilteredProducts = (catId: string) => {
    const products = productsByCategory[catId] ?? []
    if (!search.trim()) return products
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    )
  }

  const hasAnything = allProducts.length > 0
  const hasResults = visibleCategories.some((cat) => getFilteredProducts(cat.id).length > 0)

  return (
    <>
      {banners.length > 0 && <BannerBar banners={banners} />}
      <MenuHeader restaurant={restaurant} locale={locale} />

      {hasOrdering && (
        <OrderModeBanner
          locale={locale}
          active={orderingMode}
          onActivate={activateOrdering}
          onDeactivate={deactivateOrdering}
        />
      )}

      {menus.length > 1 && (
        <MenuTabs menus={menus} activeMenuId={activeMenuId} onSelect={setActiveMenuId} />
      )}

      <CategoryNav categories={visibleCategories} />

      {hasAnything && (
        <SearchBar
          placeholder={t(locale, 'menu.search')}
          value={search}
          onChange={setSearch}
        />
      )}

      <main className="flex-1 animate-fade-in">
        {!hasAnything ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-accentSoft flex items-center justify-center mb-4">
              <span className="text-4xl">🍽️</span>
            </div>
            <p className="text-primary font-semibold text-base mb-1">{t(locale, 'menu.noDishes')}</p>
            <p className="text-muted text-sm">{t(locale, 'menu.noDishesDesc')}</p>
          </div>
        ) : !hasResults ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-accentSoft flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-primary font-semibold text-base mb-1">{t(locale, 'menu.noResults')}</p>
            <p className="text-muted text-sm">{t(locale, 'menu.noResultsDesc')}</p>
          </div>
        ) : (
          visibleCategories.map((cat) => {
            const products = getFilteredProducts(cat.id)
            if (products.length === 0) return null
            return (
              <CategorySection
                key={cat.id}
                category={cat}
                products={products}
                locale={locale}
                onProductClick={setSelectedProduct}
                orderingMode={orderingMode}
              />
            )
          })
        )}
      </main>

      <ProductBottomSheet
        product={selectedProduct}
        locale={locale}
        onClose={() => setSelectedProduct(null)}
        slug={restaurant.slug}
        onAddToCart={orderingMode ? addToCart : undefined}
      />

      {orderingMode && (
        <CartButton
          count={cartCount}
          total={total}
          locale={locale}
          onClick={() => setCartOpen(true)}
        />
      )}

      {orderingMode && restaurant.whatsapp_number && (
        <CartSheet
          open={cartOpen}
          items={cart}
          locale={locale}
          whatsappNumber={restaurant.whatsapp_number}
          restaurantName={restaurant.name}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onClear={() => setCart([])}
          onDeactivate={deactivateOrdering}
        />
      )}

      {restaurant.whatsapp_number && !orderingMode && (
        <WhatsAppButton number={restaurant.whatsapp_number} />
      )}
    </>
  )
}
