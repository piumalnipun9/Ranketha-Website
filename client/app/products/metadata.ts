import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Electronics & Robotics Products | RoboClub Sri Lanka",
  description: "Browse our complete collection of electronics, robotics components, development boards, sensors, and more. Quality products at competitive prices with fast delivery across Sri Lanka.",
  keywords: "electronics, robotics, Arduino, Raspberry Pi, sensors, development boards, Sri Lanka, online store, maker supplies, electronic components",
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: "Electronics & Robotics Products | RoboClub Sri Lanka",
    description: "Browse our complete collection of electronics, robotics components, development boards, sensors, and more.",
    url: 'https://roboclub.lk/products',
    siteName: 'RoboClub',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RoboClub Products',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Electronics & Robotics Products | RoboClub Sri Lanka",
    description: "Browse our complete collection of electronics and robotics components with fast delivery across Sri Lanka.",
    images: ['/roboclub-logo.png'],
  }
};
