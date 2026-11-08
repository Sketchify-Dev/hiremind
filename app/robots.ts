import type { MetadataRoute } from 'next'

const SITE_URL = 'https://hiremind-orpin.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`
  }
}
