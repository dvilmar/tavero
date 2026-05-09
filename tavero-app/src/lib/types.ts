import type { Database } from '@/lib/database.types'

export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductAvailability = Database['public']['Tables']['product_availability']['Row']
export type Allergen = Database['public']['Tables']['allergens']['Row']
export type ProductAllergen = Database['public']['Tables']['product_allergens']['Row']
export type ProductLabel = Database['public']['Tables']['product_labels']['Row']
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']

export type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']

export type RestaurantUpdate = Database['public']['Tables']['restaurants']['Update']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
