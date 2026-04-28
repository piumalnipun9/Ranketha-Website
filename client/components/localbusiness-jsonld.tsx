export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": "https://ranketha.lk/#localbusiness",
    name: "Ranketha",
    url: "https://ranketha.lk",
    telephone: "+94713430510",
    email: "info@ranketha.lk",
    description:
      "Sri Lanka's trusted source for traditional rice varieties, pure organic honey, and handcrafted artisan products. We bring authentic, healthy, and sustainable products directly from local farmers and craftsmen.",
    image: "https://ranketha.lk/ranketha-logo.png",
    priceRange: "Rs. 300 - Rs. 5000",
    address: {
      "@type": "PostalAddress",
      addressCountry: "Sri Lanka",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: 6.9271,
      longitude: 79.8612,
    },
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
    paymentAccepted: ["Cash", "Bank Transfer", "Card"],
    currenciesAccepted: "LKR",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Ranketha Products",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Traditional Rice",
          description: "Authentic Sri Lankan rice varieties",
        },
        {
          "@type": "OfferCatalog",
          name: "Pure Honey",
          description: "Organic and wild honey products",
        },
        {
          "@type": "OfferCatalog",
          name: "Art & Crafts",
          description: "Handmade artisan products",
        },
      ],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
