import { API_BASE_URL } from "@/lib/api";

// Always generate fresh sitemap so product name or image changes show up immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const baseUrl = 'https://roboclub.lk';
  
  try {
  // Fetch all products (no cache) directly from backend API
  const res = await fetch(`${API_BASE_URL}/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Products API error: ${res.status}`);
  const raw = await res.json();
  const products: any[] = Array.isArray(raw) ? raw : [];
    
    // Generate sitemap XML with product entries
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${products.map(product => {
    const slug = product.slug || product.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || product.id;
    // Build a list of candidate images
    const images = [
      ...(Array.isArray(product.imageUrls) ? product.imageUrls : []),
      ...(product.imageUrl ? [product.imageUrl] : []),
    ]
      .filter(Boolean)
      .map(img => (img.startsWith('http') ? img : `${baseUrl}${img}`))
      // Strip query and hash to keep a stable canonical image URL
      .map(url => url.split('?')[0])
      .map(url => url.split('#')[0])
      // Remove duplicate URLs and known placeholders
      .filter((url, idx, arr) => arr.indexOf(url) === idx)
      .filter(url => !/placeholder\.(svg|jpg|png)$/i.test(url));

    const lastmod = product.updatedAt || product.createdAt || new Date().toISOString();
    const imageBlocks = images.slice(0, 5).map(url => `
    <image:image>
      <image:loc>${url}</image:loc>
    </image:image>`).join('');

    return `<url>
    <loc>${baseUrl}/products/product/${slug}</loc>
    <lastmod>${lastmod}</lastmod>${imageBlocks}
  </url>`;
  }).join('\n  ')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        // Disable caching so updates are visible immediately
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating product sitemap:', error);
    
    // Return an empty sitemap if there's an error
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store',
      },
    });
  }
}
