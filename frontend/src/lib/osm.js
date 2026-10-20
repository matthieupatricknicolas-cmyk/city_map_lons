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

const DAE_API_COLUMNS = [
  "gid",
  "c_nom",
  "c_lat_coor1",
  "c_long_coor1",
  "c_adr_num",
  "c_adr_voie",
  "c_com_cp",
  "c_com_insee",
  "c_com_nom",
  "c_acc",
  "c_acc_lib",
  "c_acc_pcsec",
  "c_acc_acc",
  "c_acc_etg",
  "c_acc_complt",
  "c_dispo_horaires",
  "c_etat_fonct",
  "c_etat",
  "c_date_instal",
  "c_dermnt",
  "c_maj_don",
  "c_expt_rais",
];

function daeProperties(row) {
  const booleanLabel = (value) =>
    value === "t" ? "Oui" : value === "f" ? "Non" : value;
  return {
    id: `dae-${row.gid}`,
    nom: row.c_nom,
    adresse: [row.c_adr_num, row.c_adr_voie].filter(Boolean).join(" "),
    code_postal: row.c_com_cp,
    commune: row.c_com_nom,
    acces: row.c_acc,
    acces_libre: booleanLabel(row.c_acc_lib),
    acces_premiers_secours: booleanLabel(row.c_acc_pcsec),
    acces_accessible: booleanLabel(row.c_acc_acc),
    etage: row.c_acc_etg,
    complement_acces: row.c_acc_complt,
    disponibilite_horaires: row.c_dispo_horaires,
    etat_fonctionnement: row.c_etat_fonct,
    statut: row.c_etat,
    date_installation: row.c_date_instal,
    date_derniere_maintenance: row.c_dermnt,
    date_mise_a_jour: row.c_maj_don,
    exploitant: row.c_expt_rais,
    source_donnees: "Géo'DAE · Atlasanté / data.gouv.fr",
    licence: "Licence Ouverte 2.0",
  };
}

async function fetchDaeGeoJSON(api) {
  const features = [];
  let page = 1;
  let total = Infinity;

  while (features.length < total) {
    const url = new URL(api.url);
    url.searchParams.set(`${api.filterField}__in`, api.filterValues.join(","));
    url.searchParams.set("columns", DAE_API_COLUMNS.join(","));
    url.searchParams.set("page_size", "100");
    url.searchParams.set("page", String(page));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Unable to load DAE data: HTTP ${response.status}`);
    }
    const result = await response.json();
    if (
      !Array.isArray(result.data) ||
      !Number.isSafeInteger(result.meta?.total) ||
      result.meta.total < 0
    ) {
      throw new Error("Invalid response from the national DAE API");
    }
    total = result.meta.total;

    result.data
      .filter((row) => api.filterValues.includes(row[api.filterField]))
      .forEach((row) => {
        const longitude = Number(row.c_long_coor1);
        const latitude = Number(row.c_lat_coor1);
        if (
          !Number.isFinite(longitude) ||
          !Number.isFinite(latitude) ||
          longitude < -180 ||
          longitude > 180 ||
          latitude < -90 ||
          latitude > 90
        ) {
          throw new Error(`Invalid coordinates for DAE ${row.gid}`);
        }
        features.push({
          type: "Feature",
          id: `dae-${row.gid}`,
          geometry: { type: "Point", coordinates: [longitude, latitude] },
          properties: daeProperties(row),
        });
      });

    if (result.data.length === 0 && features.length < total) {
      throw new Error("Incomplete response from the national DAE API");
    }
    page += 1;
  }

  return { type: "FeatureCollection", features };
}

export async function fetchLayerData(meta) {
  if (meta.api) return fetchDaeGeoJSON(meta.api);
  return fetchLayerGeoJSON(meta.file);
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
        parkingStyle: true,
        capacityLabelField: "capacity",
        file: "free_parking.geojson",
      },
      parking_pay: {
        label: "Stationnement payant",
        icon: "Parking",
        color: "#DC2626",
        geometry: "polygon",
        capacityLabelField: "capacity",
        file: "paid_parking.geojson",
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
  securite: {
    label: "Sécurité",
    subtitle: "Défibrillateurs",
    color: "#DC2626",
    items: {
      dae: {
        label: "Défibrillateurs (DAE)",
        icon: "HeartPulse",
        color: "#DC2626",
        geometry: "point",
        api: {
          url: "https://tabular-api.data.gouv.fr/api/resources/edb6a9e1-2f16-4bbf-99e7-c3eb6b90794c/data/",
          filterField: "c_com_insee",
          filterValues: [
            "39041", "39066", "39079", "39088", "39145", "39146", "39162", "39164",
            "39169", "39170", "39171", "39217", "39241", "39250", "39251", "39300",
            "39306", "39327", "39334", "39348", "39362", "39404", "39411", "39421",
            "39445", "39458", "39480", "39537", "39550", "39552", "39558", "39567",
          ],
        },
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
