import type { Metadata } from 'next'
import '../css/main.css'

export const metadata: Metadata = {
  title: 'Love Is Noise',
  description: 'Everyone Bleeds',
  openGraph: {
    images: '/img/epk/page-header.jpg'
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png'
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#feea14'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#feea14" />
        <meta name="theme-color" content="#feea14" />
        <link rel="stylesheet" href="https://use.typekit.net/dfs1qpz.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
