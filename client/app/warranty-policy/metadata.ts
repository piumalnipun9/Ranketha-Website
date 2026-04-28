import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warranty Policy | RoboClub Sri Lanka",
  description:
    "Read RoboClub's 14-day limited warranty for modules and components, coverage details, exclusions, and how to make a claim.",
  alternates: { canonical: "/warranty-policy" },
  openGraph: {
    title: "Warranty Policy | RoboClub Sri Lanka",
    description:
      "Our 14-day limited warranty covers manufacturing defects and DOA products. Learn what's covered and how to claim.",
    url: "https://roboclub.lk/warranty-policy",
    siteName: "RoboClub",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/roboclub-logo.png",
        width: 1200,
        height: 630,
        alt: "RoboClub Warranty Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Warranty Policy | RoboClub Sri Lanka",
    description:
      "Learn about RoboClub's 14-day limited warranty for hobbyist electronics.",
    images: ["/roboclub-logo.png"],
  },
};
