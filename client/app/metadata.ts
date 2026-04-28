import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ranketha - Traditional Rice, Pure Honey & Authentic Crafts | Sri Lanka",
  description: "Discover Sri Lanka's finest traditional rice varieties, pure organic honey, and handcrafted artisan products. Ranketha brings you authentic, healthy, and sustainable products directly from local farmers and artisans.",
  keywords: "traditional rice, organic honey, Sri Lankan rice, pure honey, art and crafts, handmade crafts, healthy food, organic products, traditional food, kekulu rice, red rice, samba rice, bee honey, natural honey, Sri Lanka, sustainable, farm fresh, artisan products",
  authors: [{ name: "Ranketha" }],
  creator: "Ranketha",
  publisher: "Ranketha",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL('https://ranketha.lk'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Ranketha - Traditional Rice, Pure Honey & Authentic Crafts",
    description: "Discover Sri Lanka's finest traditional rice varieties, pure organic honey, and handcrafted artisan products. Authentic, healthy, and sustainable.",
    url: 'https://ranketha.lk',
    siteName: 'Ranketha',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://ranketha.lk/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ranketha - Traditional Rice, Pure Honey & Authentic Crafts',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ranketha - Traditional Rice, Pure Honey & Authentic Crafts",
    description: "Discover Sri Lanka's finest traditional rice varieties, pure organic honey, and handcrafted artisan products.",
    images: ['https://ranketha.lk/og-image.jpg'],
  }
}
