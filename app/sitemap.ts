import type { MetadataRoute } from 'next'

// No custom domain yet: replace with the real host when one exists,
// plus layout.tsx, robots.ts, and public/llms.txt.
const SITE_URL = 'https://hiremind.example.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/brief`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 }
  ]
}
