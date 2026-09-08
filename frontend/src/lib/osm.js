import axios from "axios";

// GeoDataMine boundary ID for Lons-le-Saunier (admin_8, INSEE 39300)
export const LONS_BOUNDARY_ID = "152508";
export const LONS_INSEE = "39300";
export const LONS_CENTER = { lat: 46.6739, lon: 5.5539 };

const GEODATAMINE_BASE = "https://geodatamine.fr";

// Public Overpass endpoints (client-side calls have better network reach than backend)
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

/** Fetch a theme from GeoDataMine as GeoJSON */
export async function fetchGeoDataMine(themeId, radiusKm = null) {
  const params = new URLSearchParams({ format: "geojson" });
  if (radiusKm) params.set("radius", radiusKm.toString());
  const url = `${GEODATAMINE_BASE}/data/${themeId}/${LONS_BOUNDARY_ID}?${params.toString()}`;
  const { data } = await axios.get(url, { timeout: 45000 });
  return data;
}

/** Fetch raw data via Overpass QL, trying multiple mirrors */
export async function fetchOverpass(query) {
  let lastErr;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const { data } = await axios.post(
        endpoint,
        new URLSearchParams({ data: query }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 45000,
        }
      );
      if (data && Array.isArray(data.elements)) return data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Overpass unavailable");
}

/** Convert Overpass elements → GeoJSON FeatureCollection */
export function overpassToGeoJSON(elements, tagPrefix = "") {
  const features = [];
  const nodes = new Map();
  elements.forEach((e) => {
    if (e.type === "node") nodes.set(e.id, [e.lon, e.lat]);
  });

  elements.forEach((e) => {
    if (e.type === "node") {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [e.lon, e.lat] },
        properties: {
          id: `node/${e.id}`,
          osm_type: "node",
          osm_id: e.id,
          ...(e.tags || {}),
        },
      });
    } else if (e.type === "way" && e.geometry) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: e.geometry.map((g) => [g.lon, g.lat]),
        },
        properties: {
          id: `way/${e.id}`,
          osm_type: "way",
          osm_id: e.id,
          ...(e.tags || {}),
        },
      });
    } else if (e.type === "relation" && e.members) {
      e.members.forEach((m, idx) => {
        if (m.geometry && m.geometry.length > 1) {
          features.push({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: m.geometry.map((g) => [g.lon, g.lat]),
            },
            properties: {
              id: `rel/${e.id}/${idx}`,
              osm_type: "relation",
              osm_id: e.id,
              ...(e.tags || {}),
            },
          });
        }
      });
    }
  });

  return { type: "FeatureCollection", features };
}

// -------- Layer registry --------
// Each layer has: fetcher() → FeatureCollection, plus display metadata
export const LAYERS = {
  mobility: {
    label: "Mobilité",
    subtitle: "Déplacement",
    color: "#003D7A",
    items: {
      bike_parking: {
        label: "Parkings vélos",
        icon: "Bike",
        color: "#059669",
        geometry: "point",
        fetcher: async () => fetchGeoDataMine("bicycle_parking"),
      },
      cycle_lanes: {
        label: "Pistes cyclables",
        icon: "Navigation",
        color: "#10B981",
        geometry: "line",
        fetcher: async () => fetchGeoDataMine("cycleway"),
      },
      bus_shelter: {
        label: "Arrêts & Abris bus",
        icon: "Bus",
        color: "#2563EB",
        geometry: "point",
        fetcher: async () => {
          const q = `[out:json][timeout:25];(node["highway"="bus_stop"](around:4000,${LONS_CENTER.lat},${LONS_CENTER.lon});node["amenity"="bus_station"](around:4000,${LONS_CENTER.lat},${LONS_CENTER.lon}););out body;`;
          const raw = await fetchOverpass(q);
          return overpassToGeoJSON(raw.elements);
        },
      },
      bus_lines: {
        label: "Lignes de bus",
        icon: "Route",
        color: "#3B82F6",
        geometry: "line",
        fetcher: async () => {
          const q = `[out:json][timeout:40];relation["route"="bus"](around:4000,${LONS_CENTER.lat},${LONS_CENTER.lon});out body geom;`;
          const raw = await fetchOverpass(q);
          return overpassToGeoJSON(raw.elements);
        },
      },
    },
  },
  commerces: {
    label: "Commerces",
    subtitle: "Vie locale",
    color: "#B45309",
    items: {
      shops: {
        label: "Boutiques & Magasins",
        icon: "ShoppingBag",
        color: "#8B5CF6",
        geometry: "point",
        fetcher: async () => fetchGeoDataMine("shop_craft_office"),
      },
      food: {
        label: "Restaurants, cafés & bars",
        icon: "Utensils",
        color: "#EC4899",
        geometry: "point",
        fetcher: async () => fetchGeoDataMine("restaurant"),
      },
    },
  },
};

/** Enrich GeoJSON features with theme/layer metadata (for click handling / styling) */
export function stampFeatures(fc, themeKey, layerKey, meta) {
  return {
    type: "FeatureCollection",
    features: (fc.features || []).map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        _theme: themeKey,
        _layer: layerKey,
        _color: meta.color,
        _icon: meta.icon,
        _label: meta.label,
        id: f.properties?.id || f.properties?.id_osm || `${themeKey}-${layerKey}-${Math.random()}`,
      },
    })),
  };
}
