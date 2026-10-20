import { readFile, writeFile } from "node:fs/promises";

const API_URL = "https://dialog.beta.gouv.fr/api/regulations/json";
const MUNICIPALITY_INSEE = "39300";
const PAGE_SIZE = 100;
const DATA_DIRECTORY = new URL("../public/data/", import.meta.url);

const MEASURE_LABELS = {
  alternateRoad: "Circulation alternée",
  noOvertaking: "Interdiction de dépasser",
  noEntry: "Interdiction de circuler",
  speedLimitation: "Limitation de vitesse",
  parkingProhibited: "Stationnement interdit",
};

const SUBJECT_LABELS = {
  roadMaintenance: "Travaux",
  incident: "Incident",
  event: "Événement",
  winterMaintenance: "Viabilité hivernale",
  other: "Autre",
};

async function readFeatureCollection(filename) {
  const path = new URL(filename, DATA_DIRECTORY);
  const collection = JSON.parse(await readFile(path, "utf8"));
  if (
    collection.type !== "FeatureCollection" ||
    !Array.isArray(collection.features)
  ) {
    throw new Error(`Invalid GeoJSON FeatureCollection: ${filename}`);
  }
  return collection;
}

function parseGeometry(value, regulationIdentifier) {
  const geometry = typeof value === "string" ? JSON.parse(value) : value;
  const geometryTypes = new Set([
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
  ]);

  function hasValidCoordinates(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length === 0) return false;
    if (typeof coordinates[0] === "number") {
      return (
        coordinates.length >= 2 &&
        Number.isFinite(coordinates[0]) &&
        Number.isFinite(coordinates[1]) &&
        coordinates[0] >= -180 &&
        coordinates[0] <= 180 &&
        coordinates[1] >= -90 &&
        coordinates[1] <= 90
      );
    }
    return coordinates.every(hasValidCoordinates);
  }

  if (
    !geometryTypes.has(geometry?.type) ||
    !hasValidCoordinates(geometry.coordinates)
  ) {
    throw new Error(
      `Invalid DiaLog geometry for regulation ${regulationIdentifier}`
    );
  }
  return geometry;
}

async function fetchRegulations() {
  const regulations = [];
  let lastPage = 1;

  for (let page = 1; page <= lastPage; page += 1) {
    const url = new URL(API_URL);
    url.search = new URLSearchParams({
      status: "current",
      category: "temporaryRegulation",
      inseeCode: MUNICIPALITY_INSEE,
      pageSize: String(PAGE_SIZE),
      page: String(page),
    });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`DiaLog API request failed: HTTP ${response.status}`);
    }

    const result = await response.json();
    const metadata = result.metadata;
    if (
      !Array.isArray(result.regulations) ||
      !Number.isSafeInteger(metadata?.lastPage) ||
      metadata.lastPage < 0 ||
      metadata.page !== page
    ) {
      throw new Error("Invalid paginated response from the DiaLog API");
    }
    lastPage = metadata.lastPage;
    regulations.push(...result.regulations);
  }

  return regulations;
}

function regulationFeatures(regulations) {
  const roadworks = [];
  const disruptions = [];

  for (const regulation of regulations) {
    if (
      typeof regulation.uuid !== "string" ||
      typeof regulation.title !== "string" ||
      !Array.isArray(regulation.measures)
    ) {
      throw new Error("Invalid regulation record returned by the DiaLog API");
    }

    const featuresByGeometry = new Map();
    for (const [measureIndex, measure] of regulation.measures.entries()) {
      if (!Array.isArray(measure.locations)) {
        throw new Error(
          `Invalid measures for DiaLog regulation ${regulation.identifier || regulation.uuid}`
        );
      }
      for (const [locationIndex, location] of measure.locations.entries()) {
        if (location.geometry == null) {
          console.warn(
            `DiaLog location has no geometry: ${regulation.identifier || regulation.uuid}`
          );
          continue;
        }
        const geometry = parseGeometry(
          location.geometry,
          regulation.identifier || regulation.uuid
        );
        const geometryKey = JSON.stringify(geometry);
        const measureType =
          MEASURE_LABELS[measure.type] || measure.type || "Restriction";
        const existingFeature = featuresByGeometry.get(geometryKey);
        if (existingFeature) {
          const measureTypes = new Set(
            existingFeature.properties.measure_type.split(" · ")
          );
          measureTypes.add(measureType);
          existingFeature.properties.measure_type = [...measureTypes].join(" · ");
          continue;
        }

        const featureId = `dialog-${regulation.uuid}-${location.uuid || `${measureIndex}-${locationIndex}`}`;
        featuresByGeometry.set(geometryKey, {
          type: "Feature",
          id: featureId,
          geometry,
          properties: {
            id: featureId,
            title: regulation.title.replace(
              /\s*\(URL\s*:\s*https?:\/\/[^)]*\)\s*$/i,
              ""
            ),
            identifier: regulation.identifier || regulation.uuid,
            category:
              regulation.category === "temporaryRegulation"
                ? "Arrêté temporaire"
                : regulation.category,
            subject:
              SUBJECT_LABELS[regulation.subject] ||
              regulation.otherCategoryText ||
              regulation.subject ||
              "Non renseigné",
            organization: regulation.organization?.name || "Non renseigné",
            measure_type: measureType,
            start_date: regulation.startDate || null,
            end_date: regulation.endDate || null,
            document_url: regulation.documentUrl || null,
            source: "DiaLog · restrictions publiées",
          },
        });
      }
    }
    const destination =
      regulation.subject === "roadMaintenance" ? roadworks : disruptions;
    destination.push(...featuresByGeometry.values());
  }
  return { roadworks, disruptions };
}

async function writeCombinedLayer(filename, staticCollection, apiFeatures) {
  const output = {
    type: "FeatureCollection",
    name: filename.replace(".geojson", ""),
    generated: new Date().toISOString(),
    features: [...staticCollection.features, ...apiFeatures],
  };
  await writeFile(
    new URL(filename, DATA_DIRECTORY),
    `${JSON.stringify(output)}\n`,
    "utf8"
  );
}

const [staticRoadworks, staticDisruptions, regulations] = await Promise.all([
  readFeatureCollection("roadworks.geojson"),
  readFeatureCollection("temporary_disruptions.geojson"),
  fetchRegulations(),
]);
const { roadworks, disruptions } = regulationFeatures(regulations);

await Promise.all([
  writeCombinedLayer(
    "dialog_roadworks.geojson",
    staticRoadworks,
    roadworks
  ),
  writeCombinedLayer(
    "dialog_temporary_disruptions.geojson",
    staticDisruptions,
    disruptions
  ),
]);

console.log(
  `DiaLog synchronisé pour Lons-le-Saunier : ${roadworks.length} objets Travaux et ${disruptions.length} objets Perturbation.`
);
