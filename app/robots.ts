import type { MetadataRoute } from 'next'

// No custom domain yet: replace with the real host when one exists,
// plus layout.tsx, sitemap.ts, and public/llms.txt.
const SITE_URL = 'https://hiremind.example.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`
  }
}
