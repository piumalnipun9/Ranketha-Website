export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://ranketha.lk/#website",
    url: "https://ranketha.lk",
    name: "Ranketha",
    description:
      "Traditional Rice, Pure Honey & Authentic Crafts from Sri Lanka",
    publisher: {
      "@id": "https://ranketha.lk/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://ranketha.lk/products?query={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
