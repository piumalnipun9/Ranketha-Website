export function SiteNavigationJsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SiteNavigationElement",
        name: [
            "Home",
            "Products",
            "Traditional Rice",
            "Pure Honey",
            "Art & Crafts",
            "Categories",
            "Contact Us",
        ],
        url: [
            "https://ranketha.lk/",
            "https://ranketha.lk/products",
            "https://ranketha.lk/products?category=rice",
            "https://ranketha.lk/products?category=honey",
            "https://ranketha.lk/products?category=art-crafts",
            "https://ranketha.lk/categories",
            "https://ranketha.lk/contact-us",
        ],
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
