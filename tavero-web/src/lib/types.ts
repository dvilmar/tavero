export type Restaurant = {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  menu_banner_url: string | null
  menu_accent_color: string | null
  menu_font: string | null
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

export type Banner = {
  id: string
  text: string
  link_url: string | null
  bg_color: string
  text_color: string
}

export type Category = {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  image_url: string | null
  sort_order: number
  menu_id: string | null
}

export type Menu = {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
}

export type Allergen = {
  id: string
  name: string
  icon: string
}

export type ProductAllergen = {
  allergen_id: string
  type: 'contains' | 'may_contain'
  allergens: Allergen
}

export type ProductLabel = {
  label: string
}

export type ProductVariant = {
  id: string
  name: string
  price: number
  sort_order: number
}

export type Product = {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  sort_order: number
  out_of_stock: boolean
  availability: number[]
  allergens: ProductAllergen[]
  labels: string[]
  variants: ProductVariant[]
}
