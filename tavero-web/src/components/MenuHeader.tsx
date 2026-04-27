import Image from 'next/image'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { Restaurant } from '@/lib/types'

export function MenuHeader({ restaurant }: { restaurant: Restaurant }) {
  return (
    <header className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.25),transparent_60%)]" />

      <div className="relative px-6 pt-7 pb-10">
        <div className="flex items-start justify-between mb-5">
          {restaurant.logo_url ? (
            <Image
              src={restaurant.logo_url}
              alt={restaurant.name}
              width={72}
              height={72}
              className="rounded-2xl border-2 border-white/20 object-cover shadow-lg"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-lg">
              <span className="text-3xl font-bold text-white">
                {restaurant.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <ThemeToggle />
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
          {restaurant.name}
        </h1>
        {restaurant.description && (
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            {restaurant.description}
          </p>
        )}
      </div>
    </header>
  )
}
