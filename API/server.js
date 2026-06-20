const express = require('express');
const path = require('path');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory caches
const viacepCache = new NodeCache({ stdTTL: 60 * 60 * 24, checkperiod: 120 }); // 1 day
const nominatimCache = new NodeCache({ stdTTL: 60 * 60 * 24 * 7, checkperiod: 600 }); // 7 days

// Rate limiter for API endpoints
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

// Serve a dynamic config.js that exposes the MAPTILER_KEY from environment to the client
app.get('/config.js', (req, res) => {
  const key = process.env.MAPTILER_KEY || '';
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`const CONFIG = { MAPTILER_KEY: '${key.replace(/'/g,"\\'")}' };`);
});

// API: proxy to ViaCEP with caching
app.get('/api/viacep/:cep', apiLimiter, async (req, res) => {
  const raw = (req.params.cep || '').toString();
  const cep = raw.replace(/\D/g, '');
  if (cep.length !== 8) return res.status(400).json({ error: 'CEP inválido' });

  const cacheKey = `viacep:${cep}`;
  const cached = viacepCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const r = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 5000 });
    const data = r.data;
    viacepCache.set(cacheKey, data);
    return res.json(data);
  } catch (err) {
    console.warn('ViaCEP proxy error', err.message || err);
    return res.status(502).json({ error: 'Falha ao consultar ViaCEP' });
  }
});

// API: geocode (forward to Nominatim) with caching
app.get('/api/geocode', apiLimiter, async (req, res) => {
  const address = (req.query.address || '').toString();
  if (!address) return res.status(400).json({ error: 'address query required' });

  const cacheKey = `nominatim:${address}`;
  const cached = nominatimCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const params = new URLSearchParams({ format: 'json', limit: '1', q: address, addressdetails: '1', 'accept-language': 'pt-BR' });
    const contact = process.env.CONTACT_EMAIL || '';
    if (contact) params.append('email', contact);
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const r = await axios.get(url, { headers: { 'User-Agent': `cep-map-app/1.0 ${contact || ''}` }, timeout: 8000 });
    const data = r.data;
    nominatimCache.set(cacheKey, data);
    return res.json(data);
  } catch (err) {
    console.warn('Nominatim proxy error', err.message || err);
    return res.status(502).json({ error: 'Falha ao consultar Nominatim' });
  }
});

// API: reverse geocode
app.get('/api/reverse', apiLimiter, async (req, res) => {
  const lat = req.query.lat; const lon = req.query.lon;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
  const cacheKey = `nominatim_reverse:${lat},${lon}`;
  const cached = nominatimCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const params = new URLSearchParams({ format: 'json', lat: lat.toString(), lon: lon.toString(), addressdetails: '1', 'accept-language': 'pt-BR' });
    const contact = process.env.CONTACT_EMAIL || '';
    if (contact) params.append('email', contact);
    const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
    const r = await axios.get(url, { headers: { 'User-Agent': `cep-map-app/1.0 ${contact || ''}` }, timeout: 8000 });
    const data = r.data;
    nominatimCache.set(cacheKey, data);
    return res.json(data);
  } catch (err) {
    console.warn('Nominatim reverse error', err.message || err);
    return res.status(502).json({ error: 'Falha ao consultar Nominatim (reverse)' });
  }
});

// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
