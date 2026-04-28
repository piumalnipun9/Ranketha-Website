import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Used Electronics & Robotics Products | RoboClub Sri Lanka",
  description: "Browse pre-owned robotics components, development boards, and electronic equipment at discounted prices. Quality second-hand products verified by our technicians.",
  keywords: "used electronics, second-hand robotics, pre-owned Arduino, used Raspberry Pi, refurbished electronics, Sri Lanka, discounted electronics, used maker supplies",
  alternates: {
    canonical: '/used-products',
  },
  openGraph: {
    title: "Used Electronics & Robotics Products | RoboClub Sri Lanka",
    description: "Browse pre-owned robotics components, development boards, and electronic equipment at discounted prices.",
  url: 'https://roboclub.lk/used-products',
    siteName: 'RoboClub',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/roboclub-logo.png',
        width: 1200,
        height: 630,
        alt: 'RoboClub Used Products',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Used Electronics & Robotics Products | RoboClub Sri Lanka",
    description: "Browse pre-owned robotics components and electronic equipment at discounted prices.",
    images: ['/roboclub-logo.png'],
  }
};
