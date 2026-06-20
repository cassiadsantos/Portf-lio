const form = document.getElementById('cepForm');
const cepInput = document.getElementById('cepInput');
const result = document.getElementById('result');

// Leaflet map initialization and marker history
let map;
let markerLayer;
let markerHistory = [];

function colorFromCep(cep){
  const colors = ['#2b8cbe','#e6550d','#31a354','#756bb1','#d95f02','#1f78b4','#e41a1c'];
  if(!cep) return colors[0];
  let h = 0;
  for(let i=0;i<cep.length;i++){ h = (h*31 + cep.charCodeAt(i)) >>> 0; }
  return colors[h % colors.length];
}

function getIcon(color){
  const svg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M18 0C11.4 0 6 5.4 6 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="18" cy="12" r="5" fill="#fff"/></svg>`);
  return L.icon({ iconUrl: 'data:image/svg+xml;utf8,' + svg, iconSize: [36,36], iconAnchor:[18,36], popupAnchor:[0,-36]});
}

function initMap(){
  try{
    map = L.map('map').setView([-15.7801, -47.9292], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    try{ markerHistory = JSON.parse(localStorage.getItem('marker_history_v1') || '[]'); }catch(e){ markerHistory = []; }
    markerHistory.forEach(m=>{
      const mk = L.marker([m.lat, m.lon]).addTo(markerLayer);
      mk.bindPopup(m.popup || m.display_name || '');
    });

    // if there is history, fit bounds to show all markers and center on last
    if(markerHistory.length){
      const latlngs = markerHistory.map(m=>[m.lat, m.lon]);
      try{
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds.pad(0.25));
      }catch(e){}
      // ensure proper rendering after layout changes
      setTimeout(()=>{
        try{ map.invalidateSize(); }catch(e){}
        const last = markerHistory[markerHistory.length-1];
        if(last){ try{ map.setView([last.lat, last.lon], Math.max(map.getZoom(),12), {animate:true}); }catch(e){} }
      }, 200);
    }else{
      setTimeout(()=>{ try{ map.invalidateSize(); }catch(e){} }, 200);
    }
  }catch(e){ console.warn('Leaflet init error', e); }
}

function addMarkerIfHasGeo(data){
  const latStr = (data.latitude !== undefined ? data.latitude : (data.lat !== undefined ? data.lat : null));
  const lonStr = (data.longitude !== undefined ? data.longitude : (data.lon !== undefined ? data.lon : null));
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  const popup = (data.display_name || `${data.localidade||''} ${data.uf||''}`).trim();
  if(!Number.isFinite(lat) || !Number.isFinite(lon) || !map || !markerLayer) return;

  // derive color from CEP
  const cepKey = (data.cep || '').toString().replace(/\D/g,'');
  const color = colorFromCep(cepKey);
  const icon = getIcon(color);

  try{
    const mk = L.marker([lat, lon], { icon });
    markerLayer.addLayer(mk);
    mk.bindPopup(popup || '');
    mk.openPopup();

    const entry = { lat, lon, popup, display_name: data.display_name || '', cep: cepKey, color };
    markerHistory.push(entry);
    try{ localStorage.setItem('marker_history_v1', JSON.stringify(markerHistory)); }catch(e){}

    setTimeout(()=>{
      try{ map.invalidateSize(); }catch(e){}
      try{ if(map.flyTo) map.flyTo([lat, lon], 15, {animate:true}); else map.setView([lat, lon], 15, {animate:true}); }catch(e){ console.warn('Error centering map', e); }
    }, 200);
  }catch(e){ console.warn('Error adding marker', e); }
}

// initialize map after full load to ensure correct sizing
window.addEventListener('load', ()=>{
  if(document.getElementById('map')) initMap();
  // attach clear history button if present
  const clearBtn = document.getElementById('clearHistoryBtn');
  if(clearBtn){
    clearBtn.addEventListener('click', ()=>{
      if(!confirm('Limpar todo o histórico de marcadores?')) return;
      try{
        markerHistory = [];
        localStorage.removeItem('marker_history_v1');
        if(markerLayer && markerLayer.clearLayers) markerLayer.clearLayers();
        showError('Histórico limpo.');
      }catch(e){
        console.warn('Error clearing history', e);
        showError('Falha ao limpar histórico.');
      }
    });
  }
});

function showError(msg){ result.innerHTML = `<div class="entry error">${msg}</div>`; }
function showData(data){
  const fields = ['cep','logradouro','complemento','bairro','localidade','uf','ibge','gia','ddd','siafi','display_name','latitude','longitude'];
  result.innerHTML = fields.map(f=> `<div class="entry"><span class="key">${f}:</span><span class="value">${data[f]||''}</span></div>`).join('');
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const raw = cepInput.value || '';
  const cep = raw.replace(/\D/g,'');
  if(cep.length !== 8){ showError('CEP inválido. Digite 8 dígitos.'); return; }

  result.innerHTML = '<div class="entry">Buscando...</div>';
  try{
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if(!res.ok){ showError('Erro na requisição: ' + res.status); return; }
    const data = await res.json();
    if(data.erro){ showError('CEP não encontrado.'); return; }

    // geolocation cache in localStorage
    const cacheKey = 'geo_cache_v1';
    let cache = {};
    try{ cache = JSON.parse(localStorage.getItem(cacheKey) || '{}'); }catch(e){ cache = {}; }

    if(cache[cep]){
      Object.assign(data, cache[cep]);
      showData(data);
      addMarkerIfHasGeo(data);
      return;
    }

    // build query from address parts
    const parts = [data.logradouro, data.bairro, data.localidade, data.uf, 'Brasil'].filter(Boolean);
    const q = encodeURIComponent(parts.join(', '));
    // Replace the email param value with your contact email to comply with Nominatim policy
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}&addressdetails=1&accept-language=pt-BR&email=seu-email@exemplo.com`;

    try{
      const r2 = await fetch(nominatimUrl);
      if(r2.ok){
        const j2 = await r2.json();
        if(Array.isArray(j2) && j2.length){
          const g = j2[0];
          const geo = { display_name: g.display_name, latitude: g.lat, longitude: g.lon, importance: g.importance || '' };
          Object.assign(data, geo);
          // save to cache
          cache[cep] = geo;
          try{ localStorage.setItem(cacheKey, JSON.stringify(cache)); }catch(e){}
        }
      }
    }catch(e){
      // ignore nominatim errors, still show viacep data
      console.warn('Nominatim error', e);
    }

    showData(data);
    addMarkerIfHasGeo(data);
  }catch(err){ showError('Erro de rede: ' + err.message); }
});

// Allow formatting as 00000-000 while typing
cepInput.addEventListener('input', ()=>{
  let v = cepInput.value.replace(/\D/g,'');
  if(v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8);
  cepInput.value = v;
});
