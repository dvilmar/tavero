import { supabase } from '@/lib/supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tavero-web.vercel.app'

export default async function sitemap() {
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('slug, updated_at')
    .eq('is_active', true) as { data: { slug: string; updated_at: string }[] | null; error: unknown }

  const menuUrls = (restaurants ?? []).map((r) => ({
    url: `${SITE_URL}/menu/${r.slug}`,
    lastModified: r.updated_at,
  }))

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/privacidad`, lastModified: new Date() },
    ...menuUrls,
  ]
}
