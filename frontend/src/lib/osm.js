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
  nature: {
    label: "Nature",
    subtitle: "Espaces verts",
    color: "#16A34A",
    items: {
      parks: {
        label: "Parcs & jardins",
        icon: "Tree",
        color: "#16A34A",
        geometry: "polygon",
        labelField: "name",
        file: "parks.geojson",
      },
    },
  },
  stationnement: {
    label: "Parking",
    subtitle: "Se garer",
    color: "#16A34A",
    items: {
      parking_free: {
        label: "Stationnement gratuit",
        icon: "Parking",
        color: "#16A34A",
        geometry: "polygon",
        showIcon: false,
        file: "free_parking.geojson",
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

const FOOD_SHOP_TYPES = new Set([
  "alcohol",
  "bakery",
  "beverages",
  "butcher",
  "cheese",
  "confectionery",
  "convenience",
  "deli",
  "greengrocer",
  "seafood",
  "supermarket",
  "wine",
]);

const FASHION_SHOP_TYPES = new Set([
  "bag",
  "clothes",
  "fabric",
  "jewelry",
  "shoes",
  "watches",
]);

const HOME_SHOP_TYPES = new Set([
  "bathroom_furnishing",
  "doityourself",
  "furniture",
  "garden_centre",
  "hardware",
  "houseware",
  "interior_decoration",
  "kitchen",
]);

const AUTO_SHOP_TYPES = new Set([
  "car",
  "car_repair",
  "car_parts",
  "motorcycle",
  "tyres",
]);
const HEALTH_SHOP_TYPES = new Set([
  "chemist",
  "hearing_aids",
  "medical_supply",
  "optician",
  "pharmacy",
]);
const SERVICE_SHOP_TYPES = new Set([
  "bank",
  "company",
  "driving_school",
  "employment_agency",
  "insurance",
  "photographer",
  "post_office",
  "travel_agency",
  "travel_agent",
]);

function commerceCategory(layerKey, properties = {}) {
  if (layerKey === "food") {
    if (properties.type === "cafe") return "cafe";
    if (properties.type === "bar" || properties.type === "pub") return "bar";
    if (properties.type === "fast_food") return "fast_food";
    return "restaurant";
  }

  const shopType = properties.type;
  if (FOOD_SHOP_TYPES.has(shopType)) return "food_shop";
  if (FASHION_SHOP_TYPES.has(shopType)) return "fashion";
  if (HOME_SHOP_TYPES.has(shopType)) return "home";
  if (AUTO_SHOP_TYPES.has(shopType)) return "auto";
  if (HEALTH_SHOP_TYPES.has(shopType)) return "health";
  if (SERVICE_SHOP_TYPES.has(shopType)) return "services";
  if (shopType === "estate_agent" || shopType === "property_management") return "home";
  if (shopType === "beauty" || shopType === "hairdresser") return "beauty";
  return "retail";
}

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
        _commerceCategory:
          themeKey === "commerces"
            ? commerceCategory(layerKey, feature.properties)
            : undefined,
        id:
          feature.properties?.id ||
          feature.properties?.id_osm ||
          feature.properties?.osm_id ||
          `${themeKey}-${layerKey}-${index}`,
      },
    })),
  };
}
