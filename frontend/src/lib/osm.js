export async function fetchLayerGeoJSON(filename) {
  const response = await fetch(
    `${process.env.PUBLIC_URL || ""}/data/${filename}`
  );
  if (!response.ok) {
    throw new Error(`Unable to load ${filename}: HTTP ${response.status}`);
  }

  const geojson = await response.json();
  if (geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
    throw new Error(`Invalid GeoJSON FeatureCollection: ${filename}`);
  }

  return geojson;
}

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
        file: "bike_parking.geojson",
      },
      cycle_lanes: {
        label: "Pistes cyclables",
        icon: "Navigation",
        color: "#10B981",
        geometry: "line",
        file: "cycle_lanes.geojson",
      },
      bus_shelter: {
        label: "Arrêts & Abris bus",
        icon: "Bus",
        color: "#2563EB",
        geometry: "point",
        file: "bus_stops.geojson",
      },
      bus_lines: {
        label: "Lignes de bus",
        icon: "Route",
        color: "#3B82F6",
        geometry: "line",
        file: "bus_lines.geojson",
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
        file: "shops.geojson",
      },
      food: {
        label: "Restaurants, cafés & bars",
        icon: "Utensils",
        color: "#EC4899",
        geometry: "point",
        file: "restaurants.geojson",
      },
    },
  },
  travaux: {
    label: "Travaux",
    subtitle: "Chantiers & perturbations",
    color: "#B45309",
    items: {
      roadworks: {
        label: "Travaux",
        icon: "Construction",
        color: "#DC2626",
        geometry: "polygon",
        file: "roadworks.geojson",
      },
      disruptions: {
        label: "Perturbations temporaires",
        icon: "TriangleAlert",
        color: "#F59E0B",
        geometry: "line",
        file: "temporary_disruptions.geojson",
      },
    },
  },
};

/** Add display metadata and a stable ID for map interaction. */
export function stampFeatures(fc, themeKey, layerKey, meta) {
  return {
    type: "FeatureCollection",
    features: fc.features.map((feature, index) => ({
      ...feature,
      properties: {
        ...feature.properties,
        _theme: themeKey,
        _layer: layerKey,
        _color: meta.color,
        _icon: meta.icon,
        _label: meta.label,
        id:
          feature.properties?.id ||
          feature.properties?.id_osm ||
          feature.properties?.osm_id ||
          `${themeKey}-${layerKey}-${index}`,
      },
    })),
  };
}
