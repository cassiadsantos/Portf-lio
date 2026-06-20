// Cloudflare Worker to proxy tiles, ViaCEP and Nominatim without exposing keys.
// Configure MAPTILER_KEY and CONTACT_EMAIL as Wrangler secrets or variables.

const TILE_HOST = 'api.maptiler.com';
const MAPTILER_STYLE = 'streets'; // change if needed

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(req){
  const url = new URL(req.url);
  const pathname = url.pathname;

  // /config.js returns a client-side placeholder (no key)
  if(pathname === '/config.js'){
    const body = `const CONFIG = { MAPTILER_KEY: null };`;
    return new Response(body, { status:200, headers: {'Content-Type':'application/javascript', 'Cache-Control':'no-cache'} });
  }

  // Tiles proxy: /tiles/{z}/{x}/{y}.png
  if(pathname.startsWith('/tiles/')){
    // Expect /tiles/{z}/{x}/{y}.png
    const parts = pathname.split('/').filter(Boolean); // ['tiles','z','x','y.png']
    if(parts.length < 4) return new Response('Bad tile path', {status:400});
    const z = parts[1], x = parts[2], yFile = parts.slice(3).join('/');
    // yFile may contain ext
    const upstream = `https://${TILE_HOST}/maps/${MAPTILER_STYLE}/${z}/${x}/${yFile}?key=${MAPTILER_KEY}`;
    return fetchAndCache(req, upstream, 'image/png');
  }

  // ViaCEP proxy: /api/viacep/{cep}
  if(pathname.startsWith('/api/viacep/')){
    const cep = pathname.split('/').pop().replace(/\D/g,'');
    if(cep.length !== 8) return json({ error: 'CEP inválido' }, 400);
    const upstream = `https://viacep.com.br/ws/${cep}/json/`;
    return fetchAndCache(req, upstream, 'application/json', 60*60*24);
  }

  // Geocode proxy: /api/geocode?address=...
  if(pathname === '/api/geocode'){
    const address = url.searchParams.get('address');
    if(!address) return json({ error: 'address required' }, 400);
    const params = new URLSearchParams({ format: 'json', limit: '1', q: address, addressdetails: '1', 'accept-language': 'pt-BR' });
    const contact = CONTACT_EMAIL || '';
    if(contact) params.append('email', contact);
    const upstream = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    return fetchAndCache(req, upstream, 'application/json', 60*60*24*7);
  }

  // Reverse geocode: /api/reverse?lat=..&lon=..
  if(pathname === '/api/reverse'){
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    if(!lat || !lon) return json({ error: 'lat and lon required' }, 400);
    const params = new URLSearchParams({ format: 'json', lat, lon, addressdetails: '1', 'accept-language': 'pt-BR' });
    const contact = CONTACT_EMAIL || '';
    if(contact) params.append('email', contact);
    const upstream = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
    return fetchAndCache(req, upstream, 'application/json', 60*60*24*7);
  }

  // Fallback: serve static content from Workers Sites is possible, but here just return 404
  return new Response('Not found', { status: 404 });
}

// Helper: fetch upstream and cache in the Cloudflare cache
async function fetchAndCache(clientReq, upstreamUrl, contentType, ttlSeconds = 3600){
  const cache = caches.default;
  const cacheKey = new Request(upstreamUrl, clientReq);
  try{
    const cached = await cache.match(cacheKey);
    if(cached) return cached;
  }catch(e){ /* ignore cache errors */ }

  // fetch upstream
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 8000);
  try{
    const fetchRes = await fetch(upstreamUrl, { method: 'GET', headers: { 'User-Agent': `cep-map-worker/1.0 ${CONTACT_EMAIL||''}` }, signal: controller.signal });
    clearTimeout(timeout);
    if(!fetchRes.ok) return new Response('Upstream error', { status: 502 });
    const response = new Response(fetchRes.body, fetchRes);
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin','*');
    if(contentType) headers.set('Content-Type', contentType);
    if(ttlSeconds > 0) headers.set('Cache-Control', `public, max-age=${ttlSeconds}`);
    const final = new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    // store in cache (clone bodies)
    eventWaitUntilSafe(cache.put(cacheKey, final.clone()));
    return final;
  }catch(err){
    clearTimeout(timeout);
    return new Response('Upstream fetch failed', { status: 502 });
  }
}

// small helper to call caches.put safely in Workers (no top-level event object)
function eventWaitUntilSafe(promise){
  // if global 'event' exists, use event.waitUntil, otherwise it's okay to fire-and-forget
  try{ if(typeof event !== 'undefined' && event && event.waitUntil) event.waitUntil(promise); else promise.catch(()=>{}); }catch(e){ promise.catch(()=>{}); }
}

function json(obj, status=200){
  return new Response(JSON.stringify(obj), { status, headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'} });
}
