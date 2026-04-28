import { NextResponse } from 'next/server'

export async function GET() {
  // Return a sitemap with static pages and fetch products
  const baseUrl = 'https://roboclub.lk';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://roboclub-server-70e29f041ab3.herokuapp.com';
  
  // Fetch products for sitemap
  let products = [];
  try {
    const response = await fetch(`${apiUrl}/products`, { next: { revalidate: 86400 } });
    if (response.ok) {
      const data = await response.json();
      products = Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
     <!-- Static pages -->
     <url>
       <loc>${baseUrl}</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <image:image>
         <image:loc>${baseUrl}/og-image.jpg</image:loc>
       </image:image>
     </url>
     <url>
       <loc>${baseUrl}/products</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
     </url>
     <url>
       <loc>${baseUrl}/used-products</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
     </url>
     <url>
       <loc>${baseUrl}/categories</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
     </url>
     <url>
       <loc>${baseUrl}/brands</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
     </url>
     <url>
       <loc>${baseUrl}/contact-us</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
     </url>
     <url>
       <loc>${baseUrl}/help-center</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
     </url>
     <url>
       <loc>${baseUrl}/guides/electronics-components-sri-lanka</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
     </url>
     <url>
       <loc>${baseUrl}/shipping-info</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
     </url>
     <url>
       <loc>${baseUrl}/returns</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
     </url>
     
     <!-- Product pages -->
     ${products.map(product => {
       const productSlug = product.slug || product.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || product.id;
       const imageUrl = (product.imageUrls && product.imageUrls[0]) || product.imageUrl || product.image;
  const absoluteImageUrlRaw = imageUrl?.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl || '/placeholder.svg'}`;
  const absoluteImageUrl = absoluteImageUrlRaw.split('?')[0].split('#')[0];
       
       return `<url>
         <loc>${baseUrl}/products/product/${productSlug}</loc>
         <lastmod>${product.updatedAt || new Date().toISOString()}</lastmod>
         ${imageUrl ? `
         <image:image>
           <image:loc>${absoluteImageUrl}</image:loc>
         </image:image>` : ''}
       </url>`;
     }).join('\n     ')}
   </urlset>
 `;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
