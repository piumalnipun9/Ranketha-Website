/*
  Checks that each product detail URL on the live site responds with HTTP 200.
  - Fetches products from the backend API
  - Uses product.slug if present, else slugifies the name (matching client logic)
  - Requests https://roboclub.lk/products/product/<slug> with HEAD then GET fallback
  - Prints a compact summary with any failures listed
*/

const API_DEFAULT = 'https://roboclub-server-70e29f041ab3.herokuapp.com';
const BASE_SITE = 'https://roboclub.lk';

function env(name, dflt) {
  try { return process.env[name] || dflt; } catch { return dflt; }
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function getJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

async function checkUrl(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    if (!res.ok || res.status === 405 || res.status === 404) {
      // Retry with GET in case HEAD isn't supported
      res = await fetch(url, { method: 'GET', signal: controller.signal });
    }
    return res.status;
  } catch (e) {
    return 0;
  } finally {
    clearTimeout(to);
  }
}

async function main() {
  const apiBase = env('NEXT_PUBLIC_API_URL', API_DEFAULT).replace(/\/$/, '');
  const productsUrl = `${apiBase}/products`;
  console.log(`Fetching products from: ${productsUrl}`);
  let products = [];
  try {
    products = await getJson(productsUrl);
  } catch (e) {
    console.error('Failed to fetch products:', e?.message || e);
    process.exit(1);
  }

  if (!Array.isArray(products)) {
    console.error('Products API did not return an array.');
    process.exit(1);
  }

  // Limit can be lifted; keep at Infinity to check all.
  const limit = Infinity;
  let ok = 0;
  const fails = [];

  for (let i = 0; i < Math.min(products.length, limit); i++) {
    const p = products[i] || {};
    const slug = p.slug || slugify(p.name || p.id || '');
    if (!slug) continue;
    const url = `${BASE_SITE}/products/product/${slug}`;
    const status = await checkUrl(url);
    if (status === 200) {
      ok++;
    } else {
      fails.push({ id: String(p.id || ''), name: String(p.name || ''), slug, status, url });
    }
    if ((i + 1) % 25 === 0) {
      process.stdout.write(`Checked ${i + 1}/${products.length}...\r`);
    }
  }

  console.log(`\nOK: ${ok}  FAIL: ${fails.length}  TOTAL: ${Math.min(products.length, limit)}`);
  if (fails.length) {
    console.log('Failures:');
    for (const f of fails) {
      console.log(`- [${f.status}] ${f.name} -> ${f.url}`);
    }
    process.exitCode = 2;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
