// Basemap style definitions for MapLibre GL
// Note: JAWG requires a token; we replace it with CARTO Dark Matter (free night style)
// to honor the "Mode Nuit" intent without any API key.

export const BASEMAPS = [
  {
    id: "openfreemap",
    name: "OpenFreeMap · Liberty",
    subtitle: "Vectoriel clair (défaut)",
    type: "style",
    style: "https://tiles.openfreemap.org/styles/liberty",
  },
  {
    id: "cartodb_voyager",
    name: "CARTO · Voyager",
    subtitle: "Vectoriel éditorial",
    type: "style",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
  {
    id: "carto_dark",
    name: "CARTO · Dark Matter",
    subtitle: "Mode nuit",
    type: "style",
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  {
    id: "ign_ortho",
    name: "IGN · Orthophoto",
    subtitle: "Satellite français",
    type: "raster",
    tiles: [
      "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}",
    ],
    attribution: "© IGN-F / Géoportail",
    maxzoom: 19,
  },
  {
    id: "osm_fr",
    name: "OSM · France",
    subtitle: "Raster classique",
    type: "raster",
    tiles: [
      "https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
      "https://b.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
      "https://c.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
    ],
    attribution: "© OpenStreetMap France",
    maxzoom: 19,
  },
  {
    id: "opentopomap",
    name: "OpenTopoMap · Relief",
    subtitle: "Topographique",
    type: "raster",
    tiles: [
      "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
      "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
      "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
    ],
    attribution: "© OpenTopoMap (CC-BY-SA)",
    maxzoom: 17,
  },
  {
    id: "maplibre_demo",
    name: "MapLibre · Demo",
    subtitle: "Style minimaliste",
    type: "style",
    style: "https://demotiles.maplibre.org/style.json",
  },
];

export function buildRasterStyle(basemap) {
  return {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      "raster-src": {
        type: "raster",
        tiles: basemap.tiles,
        tileSize: 256,
        attribution: basemap.attribution || "",
        maxzoom: basemap.maxzoom || 19,
      },
    },
    layers: [
      {
        id: "raster-layer",
        type: "raster",
        source: "raster-src",
      },
    ],
  };
}
