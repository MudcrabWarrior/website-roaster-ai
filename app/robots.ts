import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/success/'],
    },
    sitemap: 'https://website-roaster-ai.vercel.app/sitemap.xml',
  }
}
