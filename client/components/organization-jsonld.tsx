export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://ranketha.lk/#organization",
    name: "Ranketha",
    url: "https://ranketha.lk",
    logo: "https://ranketha.lk/ranketha-logo.png",
    description:
      "Sri Lanka's trusted source for traditional rice, pure organic honey, and handcrafted artisan products.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+94713430510",
      contactType: "customer service",
      availableLanguage: ["English", "Sinhala"],
      areaServed: "LK",
    },
    sameAs: [
      "https://facebook.com/ranketha",
      "https://instagram.com/ranketha",
      "https://twitter.com/ranketha",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "LK",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
