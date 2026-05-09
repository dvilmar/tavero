import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tavero-web.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/menu/',
      disallow: ['/api/', '/auth/', '/eliminar-cuenta/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
