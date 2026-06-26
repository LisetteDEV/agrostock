import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, MapPin, Factory, LoaderCircle, Navigation, Building2 } from 'lucide-react';
import { API_URL } from '../services/config';

const BENIN_CENTER = [9.5, 2.3];
const BENIN_ZOOM = 7;

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const MCSS = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
const MCSS_DEFAULT = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
const MJS = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';

const DEPARTMENT_COORDS = {
  atakora: [10.9, 1.9],
  alibori: [11.3, 2.9],
  atlantique: [6.68, 2.28],
  borgou: [9.5, 2.64],
  collines: [8.4, 2.2],
  couffo: [7.1, 1.8],
  donga: [9.8, 1.6],
  littoral: [6.36, 2.43],
  mono: [6.65, 1.75],
  oueme: [6.57, 2.65],
  plateau: [7.35, 2.6],
  zou: [7.2, 2.1],
};

const TYPE_COLORS = {
  pme: '#1ab273',
  cooperative: '#f59e0b',
  artisan: '#3b82f6',
};

const TILE_SOURCES = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  {
    name: 'Carto Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
];

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const isValidCoord = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

const ensureStyle = (href) => {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

const ensureScript = (src) => {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
      } else {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const loadMapLibraries = async () => {
  ensureStyle(LEAFLET_CSS);
  ensureStyle(MCSS);
  ensureStyle(MCSS_DEFAULT);

  await ensureScript(LEAFLET_JS);

  let hasCluster = false;
  try {
    await ensureScript(MJS);
    hasCluster = Boolean(window.L?.markerClusterGroup);
  } catch {
    hasCluster = false;
  }

  if (!window.L) {
    throw new Error('Leaflet indisponible');
  }

  return { L: window.L, hasCluster };
};

const buildMarkerIcon = (type) => {
  const color = TYPE_COLORS[normalize(type)] || '#1ab273';
  return window.L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:2px solid #ffffff;box-shadow:0 0 0 3px ${color}33;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const MapSection = () => {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markerIndexRef = useRef({});
  const tileLayerRef = useRef(null);
  const tileSourceIndexRef = useRef(0);
  const tileErrorCountRef = useRef(0);

  const [allProcessors, setAllProcessors] = useState([]);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [clusterEnabled, setClusterEnabled] = useState(false);
  const [tileProvider, setTileProvider] = useState(TILE_SOURCES[0].name);

  const processors = useMemo(() => {
    const q = normalize(query);
    if (!q) return allProcessors;

    return allProcessors.filter((t) => {
      const haystack = [t.nom_entreprise, t.departement, t.commune, t.type_entreprise]
        .map((v) => normalize(v))
        .join(' ');
      return haystack.includes(q);
    });
  }, [allProcessors, query]);

  const mappedCount = useMemo(() => processors.filter((t) => t.coords).length, [processors]);

  const mountTileLayer = (map, L, sourceIndex = 0) => {
    if (!map || !L) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const source = TILE_SOURCES[sourceIndex] || TILE_SOURCES[0];
    tileSourceIndexRef.current = sourceIndex;
    setTileProvider(source.name);

    const layer = L.tileLayer(source.url, {
      attribution: source.attribution,
      maxZoom: 19,
      crossOrigin: true,
    });

    layer.on('load', () => {
      tileErrorCountRef.current = 0;
    });

    layer.on('tileerror', () => {
      tileErrorCountRef.current += 1;
      if (tileErrorCountRef.current > 6 && tileSourceIndexRef.current < TILE_SOURCES.length - 1) {
        tileErrorCountRef.current = 0;
        mountTileLayer(map, L, tileSourceIndexRef.current + 1);
      }
    });

    layer.addTo(map);
    tileLayerRef.current = layer;
  };

  useEffect(() => {
    const fetchProcessors = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/transformateurs/publics`, {
          headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        const list = (data.transformateurs || []).map((t) => {
          const lat = Number(t.latitude);
          const lng = Number(t.longitude);
          const dep = normalize(t.departement);
          const fallback = DEPARTMENT_COORDS[dep] || null;
          const coords = isValidCoord(lat, lng)
            ? { lat, lng, approx: false }
            : fallback
              ? { lat: fallback[0], lng: fallback[1], approx: true }
              : null;

          return { ...t, coords };
        });
        setAllProcessors(list);
      } catch {
        setAllProcessors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcessors();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      try {
        const { L, hasCluster } = await loadMapLibraries();
        if (cancelled || !mapNodeRef.current || mapRef.current) return;

        const map = L.map(mapNodeRef.current, {
          center: BENIN_CENTER,
          zoom: BENIN_ZOOM,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        mountTileLayer(map, L, 0);

        mapRef.current = map;
        setClusterEnabled(hasCluster);
        setIsMapReady(true);
      } catch {
        setIsMapReady(false);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      tileLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !window.L) return;

    const L = window.L;
    const map = mapRef.current;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    markerIndexRef.current = {};

    const layer = clusterEnabled && L.markerClusterGroup
      ? L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 55,
          spiderfyOnMaxZoom: true,
        })
      : L.layerGroup();

    const points = processors.filter((t) => t.coords);

    points.forEach((t) => {
      const marker = L.marker([t.coords.lat, t.coords.lng], { icon: buildMarkerIcon(t.type_entreprise) });
      const popup = `
        <div style="min-width:230px;font-family:system-ui,sans-serif;">
          <div style="font-weight:700;color:#0f2a1d;margin-bottom:4px;">${t.nom_entreprise || 'Transformateur'}</div>
          <div style="font-size:12px;color:#52665b;margin-bottom:6px;">${t.type_entreprise || '-'} | ${t.nb_produits || 0} produit(s)</div>
          <div style="font-size:12px;color:#52665b;margin-bottom:8px;">${t.commune || '-'} ${t.departement ? `| ${t.departement}` : ''}</div>
          <div style="font-size:12px;color:${t.coords.approx ? '#b45309' : '#157f52'};margin-bottom:10px;">${t.coords.approx ? 'Position approx. par departement' : 'Position precise'}</div>
          <a href="/transformateur/${t.id}" style="display:inline-block;background:#1ab273;color:#fff;padding:6px 10px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:700;">Voir le profil</a>
        </div>
      `;
      marker.bindPopup(popup);
      marker.on('click', () => setSelectedId(t.id));

      markerIndexRef.current[t.id] = marker;
      layer.addLayer(marker);
    });

    layer.addTo(map);
    layerRef.current = layer;

    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((t) => [t.coords.lat, t.coords.lng]));
      map.fitBounds(bounds.pad(0.22));
    } else {
      map.setView(BENIN_CENTER, BENIN_ZOOM);
    }
  }, [processors, isMapReady, clusterEnabled]);

  const handleSearch = () => {
    setQuery(queryInput);
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const focusProcessor = (processor) => {
    if (!mapRef.current || !processor?.coords) return;
    const marker = markerIndexRef.current[processor.id];

    setSelectedId(processor.id);
    mapRef.current.setView([processor.coords.lat, processor.coords.lng], 11, { animate: true });

    if (!marker) return;
    if (clusterEnabled && layerRef.current?.zoomToShowLayer) {
      layerRef.current.zoomToShowLayer(marker, () => marker.openPopup());
    } else {
      marker.openPopup();
    }
  };

  return (
    <section id="geolocalisation" className="py-5" style={{ background: '#f8f9fa' }}>
      <div className="container py-5">
        <div className="row align-items-start g-4">
          <div className="col-lg-4">
            <div className="d-inline-flex align-items-center justify-content-center px-3 py-1 mb-3 rounded-pill" style={{ background: 'rgba(26, 178, 115, 0.1)', color: '#105c38', fontWeight: 600, fontSize: '0.9rem' }}>
              Geolocalisation
            </div>
            <h2 className="fw-bold mb-3" style={{ color: '#1A1C19', fontSize: '2.2rem' }}>
              Carte <span style={{ color: '#1ab273' }}>interactive</span> du Benin
            </h2>
            <p style={{ color: '#6c757d', fontSize: '1rem', marginBottom: 18 }}>
              Visualisez les transformateurs verifies, filtrez par zone et ouvrez leur profil en un clic.
            </p>

            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-3 px-1" style={{ color: '#105c38', fontSize: '0.9rem', fontWeight: '600' }}>
                <Factory size={16} />
                <span>{mappedCount} transformateur(s) affiché(s) sur la carte</span>
              </div>

              <div 
                className="p-1 bg-white rounded-pill d-flex align-items-center shadow-sm flex-wrap flex-sm-nowrap gap-2 gap-sm-0"
                style={{ border: '1px solid #e2ece5', transition: 'box-shadow 0.3s ease', borderRadius: '50px' }}
                onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 4px rgba(26,178,115,0.1)'}
                onBlur={(e) => e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)'}
              >
                <div className="d-flex align-items-center flex-grow-1 w-100 ps-3">
                  <div className="pe-2 text-muted flex-shrink-0">
                    <Search size={20} color="#1ab273" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ville, departement..."
                    className="form-control border-0 bg-transparent shadow-none px-0"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    onKeyDown={handleEnter}
                    style={{ fontSize: '0.95rem', fontWeight: 500, minWidth: '100px' }}
                  />
                </div>
                <button 
                  className="btn text-white fw-bold border-0 px-4 position-relative d-flex align-items-center justify-content-center flex-shrink-0 ms-sm-auto w-100" 
                  onClick={handleSearch}
                  style={{ 
                    height: '42px',
                    background: 'linear-gradient(135deg, #1ab273 0%, #128e5a 100%)', 
                    borderRadius: '50px', 
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 10px rgba(26,178,115,0.2)',
                    maxWidth: '100%',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(26,178,115,0.3)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(26,178,115,0.2)'; }}
                >
                  <span className="d-sm-none">Chercher</span>
                  <span className="d-none d-sm-inline">Rechercher</span>
                </button>
              </div>
            </div>

            <style>{`
              @media (max-width: 576px) {
                  .bg-white.rounded-pill.d-flex.align-items-center {
                      border-radius: 12px !important;
                      padding: 10px !important;
                  }
                  .bg-white.rounded-pill.d-flex.align-items-center button {
                      margin-top: 5px;
                  }
              }
            `}</style>


            <div className="d-flex flex-wrap gap-2 mb-3">
              {['Cotonou', 'Porto-Novo', 'Parakou', 'Atlantique'].map((chip) => (
                <button
                  key={chip}
                  className="btn btn-sm rounded-pill"
                  onClick={() => {
                    setQueryInput(chip);
                    setQuery(chip);
                  }}
                  style={{ background: '#e8f4ee', color: '#1a5f3e', border: '1px solid #cde9db' }}
                >
                  <MapPin size={13} className="me-1" /> {chip}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-3" style={{ background: '#ffffff', border: '1px solid #e2ece5', maxHeight: '420px', overflowY: 'auto' }}>
              <div className="small fw-bold mb-2" style={{ color: '#1f3f2f' }}>Resultats</div>
              {processors.filter((p) => p.coords).length === 0 ? (
                <div className="small" style={{ color: '#6f8278' }}>Aucun transformateur geolocalise pour ce filtre.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {processors
                    .filter((p) => p.coords)
                    .slice(0, 18)
                    .map((p) => {
                      const active = selectedId === p.id;
                      const color = TYPE_COLORS[normalize(p.type_entreprise)] || '#1ab273';
                      return (
                        <button
                          key={p.id}
                          onClick={() => focusProcessor(p)}
                          className="btn text-start w-100 p-2 rounded-3"
                          style={{
                            background: active ? '#edf8f2' : '#fff',
                            border: `1px solid ${active ? '#7ecfac' : '#e2ece5'}`,
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start gap-2">
                            <div>
                              <div className="fw-bold small" style={{ color: '#1c3a2c' }}>{p.nom_entreprise}</div>
                              <div className="small" style={{ color: '#6f8278' }}>{p.commune || '-'} {p.departement ? `| ${p.departement}` : ''}</div>
                            </div>
                            <span className="badge rounded-pill" style={{ background: `${color}22`, color }}>
                              {p.type_entreprise || 'pro'}
                            </span>
                          </div>
                          <div className="small mt-1" style={{ color: '#547063' }}>
                            <Building2 size={12} className="me-1" /> {p.nb_produits || 0} produit(s)
                            <Navigation size={12} className="ms-2 me-1" /> {p.coords.approx ? 'approx' : 'precis'}
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-8">
            <div className="position-relative w-100 rounded-4 overflow-hidden shadow-sm" style={{ height: '620px', border: '3px solid #fff', background: '#eef4f0' }}>
              {(isLoading || !isMapReady) && (
                <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center" style={{ zIndex: 500, color: '#285841' }}>
                  <LoaderCircle size={30} className="mb-2" style={{ animation: 'spin 1s linear infinite' }} />
                  <span className="small fw-semibold">Chargement de la carte...</span>
                </div>
              )}
              <div ref={mapNodeRef} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="small mt-2 d-flex flex-wrap gap-3" style={{ color: '#6b7d74' }}>
              <span><span className="me-1">Vert</span>: PME</span>
              <span><span className="me-1">Orange</span>: Cooperative</span>
              <span><span className="me-1">Bleu</span>: Artisan</span>
              <span>Clustering: {clusterEnabled ? 'actif' : 'non disponible (fallback simple)'}</span>
              <span>Fond de carte: {tileProvider}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-map-marker {
          background: transparent;
          border: none;
        }
        .leaflet-top, .leaflet-bottom {
          z-index: 400 !important;
        }
        .leaflet-container img {
          max-width: none !important;
        }
      `}</style>
    </section>
  );
};

export default MapSection;
