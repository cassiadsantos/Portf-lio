Cloudflare Worker: proxy for tiles, ViaCEP and Nominatim

Steps to deploy (assumes Cloudflare account and Wrangler):

1. Install Wrangler (Cloudflare CLI):
   npm i -g wrangler

2. Authenticate:
   wrangler login

3. Set secrets (recommended) or vars in wrangler.toml / Cloudflare dashboard:
   wrangler secret put MAPTILER_KEY   # paste your MapTiler key
   wrangler secret put CONTACT_EMAIL  # contact email for Nominatim

4. Publish the Worker:
   wrangler publish

5. Usage from the static site:
   - Tile URLs: https://<your-worker-subdomain>/tiles/{z}/{x}/{y}.png
     Update client tile layer to use that path instead of direct MapTiler URL.
   - Geocoding: https://<your-worker-subdomain>/api/geocode?address=ADDRESS
   - Reverse: https://<your-worker-subdomain>/api/reverse?lat=..&lon=..
   - ViaCEP: https://<your-worker-subdomain>/api/viacep/01001000

Notes:
- The worker caches upstream responses using Cloudflare's cache for performance.
- The worker hides your MAPTILER_KEY by proxying tile requests.
- Monitor usage in Cloudflare dashboard and set appropriate billing/limits.

If you want, I can also update the client app.js to use the worker tile URL by default and remove direct MapTiler exposure.