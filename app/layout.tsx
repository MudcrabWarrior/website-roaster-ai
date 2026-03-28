import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Website Roaster - AI Website Audit & Review Tool',
  description:
    'Get brutally honest feedback on your website. AI-powered analysis of design, copy, UX, SEO, and conversion optimization. Free quick roast or paid full audit.',
  keywords: 'website audit, website review, SEO audit, web design review, landing page analyzer, website critique',
  authors: [{ name: 'Velocity Forge AI' }],
  openGraph: {
    title: 'Website Roaster - AI Website Audit & Review Tool',
    description: 'Get brutally honest feedback on your website. AI-powered analysis and optimization suggestions.',
    type: 'website',
    url: 'https://website-roaster-ai-jade.vercel.app',
    images: [
      {
        url: 'https://website-roaster-ai-jade.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Website Roaster',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Roaster - AI Website Audit & Review Tool',
    description: 'Get brutally honest feedback on your website with AI-powered analysis.',
  },
  alternates: {
    canonical: 'https://website-roaster-ai-jade.vercel.app',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#6d28d9" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%236d28d9'>🔥</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  )
}
