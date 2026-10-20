import React, { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { BASEMAPS, buildRasterStyle } from "@/lib/basemaps";
import { LAYERS } from "@/lib/osm";

const COMMERCE_MARKERS = {
  food_shop: { color: "#16A34A", icon: "basket" },
  fashion: { color: "#7C3AED", icon: "shirt" },
  beauty: { color: "#DB2777", icon: "scissors" },
  home: { color: "#D97706", icon: "home" },
  auto: { color: "#2563EB", icon: "car" },
  health: { color: "#0891B2", icon: "health" },
  services: { color: "#475569", icon: "briefcase" },
  retail: { color: "#6D28D9", icon: "bag" },
  restaurant: { color: "#DC2626", icon: "restaurant" },
  fast_food: { color: "#EA580C", icon: "burger" },
  cafe: { color: "#92400E", icon: "coffee" },
  bar: { color: "#7E22CE", icon: "glass" },
};

function addCommerceMarkerImages(map) {
  Object.entries(COMMERCE_MARKERS).forEach(([category, marker]) => {
    const imageId = `commerce-${category}`;
    if (map.hasImage(imageId)) return;

    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 48;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to create commerce marker canvas");

    context.fillStyle = marker.color;
    context.beginPath();
    context.arc(24, 24, 22, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#FFFFFF";
    context.lineWidth = 2;
    context.stroke();
    context.strokeStyle = "#FFFFFF";
    context.fillStyle = "#FFFFFF";
    context.lineWidth = 2.4;
    context.lineCap = "round";
    context.lineJoin = "round";

    if (marker.icon === "bag" || marker.icon === "basket") {
      context.strokeRect(13, 20, 22, 16);
      context.beginPath();
      context.moveTo(18, 20);
      context.lineTo(20, 14);
      context.lineTo(28, 14);
      context.lineTo(30, 20);
      context.stroke();
      if (marker.icon === "basket") {
        context.beginPath();
        context.moveTo(17, 25);
        context.lineTo(31, 25);
        context.moveTo(21, 21);
        context.lineTo(22, 34);
        context.moveTo(27, 21);
        context.lineTo(26, 34);
        context.stroke();
      }
    } else if (marker.icon === "shirt") {
      context.beginPath();
      context.moveTo(18, 15);
      context.lineTo(12, 19);
      context.lineTo(16, 25);
      context.lineTo(19, 23);
      context.lineTo(19, 35);
      context.lineTo(29, 35);
      context.lineTo(29, 23);
      context.lineTo(32, 25);
      context.lineTo(36, 19);
      context.lineTo(30, 15);
      context.quadraticCurveTo(24, 21, 18, 15);
      context.stroke();
    } else if (marker.icon === "scissors") {
      context.beginPath();
      context.arc(15, 31, 4, 0, Math.PI * 2);
      context.arc(15, 17, 4, 0, Math.PI * 2);
      context.moveTo(18, 19);
      context.lineTo(33, 33);
      context.moveTo(18, 29);
      context.lineTo(33, 15);
      context.stroke();
    } else if (marker.icon === "home") {
      context.beginPath();
      context.moveTo(12, 23);
      context.lineTo(24, 13);
      context.lineTo(36, 23);
      context.lineTo(33, 23);
      context.lineTo(33, 35);
      context.lineTo(15, 35);
      context.lineTo(15, 23);
      context.stroke();
      context.strokeRect(22, 27, 5, 8);
    } else if (marker.icon === "health") {
      context.beginPath();
      context.moveTo(21, 13);
      context.lineTo(27, 13);
      context.lineTo(27, 21);
      context.lineTo(35, 21);
      context.lineTo(35, 27);
      context.lineTo(27, 27);
      context.lineTo(27, 35);
      context.lineTo(21, 35);
      context.lineTo(21, 27);
      context.lineTo(13, 27);
      context.lineTo(13, 21);
      context.lineTo(21, 21);
      context.closePath();
      context.fill();
    } else if (marker.icon === "briefcase") {
      context.beginPath();
      context.roundRect(12, 19, 24, 16, 3);
      context.stroke();
      context.beginPath();
      context.moveTo(19, 19);
      context.lineTo(19, 15);
      context.lineTo(29, 15);
      context.lineTo(29, 19);
      context.moveTo(12, 25);
      context.lineTo(36, 25);
      context.moveTo(22, 25);
      context.lineTo(22, 28);
      context.lineTo(26, 28);
      context.lineTo(26, 25);
      context.stroke();
    } else if (marker.icon === "car") {
      context.beginPath();
      context.moveTo(12, 29);
      context.lineTo(15, 21);
      context.lineTo(19, 18);
      context.lineTo(29, 18);
      context.lineTo(33, 21);
      context.lineTo(36, 29);
      context.lineTo(36, 33);
      context.lineTo(12, 33);
      context.closePath();
      context.stroke();
      context.beginPath();
      context.arc(17, 33, 2, 0, Math.PI * 2);
      context.arc(31, 33, 2, 0, Math.PI * 2);
      context.fill();
    } else if (marker.icon === "burger") {
      context.beginPath();
      context.moveTo(13, 22);
      context.arc(24, 22, 11, Math.PI, 0);
      context.lineTo(35, 24);
      context.lineTo(13, 24);
      context.moveTo(13, 27);
      context.lineTo(35, 27);
      context.lineTo(32, 31);
      context.lineTo(16, 31);
      context.closePath();
      context.stroke();
      context.beginPath();
      context.moveTo(15, 34);
      context.lineTo(33, 34);
      context.stroke();
    } else if (marker.icon === "coffee") {
      context.beginPath();
      context.moveTo(14, 21);
      context.lineTo(32, 21);
      context.lineTo(30, 34);
      context.lineTo(16, 34);
      context.closePath();
      context.moveTo(32, 24);
      context.lineTo(35, 24);
      context.quadraticCurveTo(39, 24, 36, 29);
      context.lineTo(31, 29);
      context.moveTo(19, 17);
      context.lineTo(19, 14);
      context.moveTo(25, 17);
      context.lineTo(25, 14);
      context.stroke();
    } else if (marker.icon === "glass") {
      context.beginPath();
      context.moveTo(14, 15);
      context.lineTo(34, 15);
      context.lineTo(30, 25);
      context.quadraticCurveTo(24, 32, 18, 25);
      context.closePath();
      context.moveTo(24, 30);
      context.lineTo(24, 36);
      context.moveTo(19, 36);
      context.lineTo(29, 36);
      context.stroke();
    } else {
      context.beginPath();
      context.moveTo(17, 16);
      context.lineTo(17, 35);
      context.moveTo(14, 16);
      context.lineTo(14, 22);
      context.moveTo(20, 16);
      context.lineTo(20, 22);
      context.moveTo(30, 16);
      context.bezierCurveTo(34, 20, 34, 25, 30, 26);
      context.lineTo(30, 35);
      context.stroke();
    }

    map.addImage(imageId, context.getImageData(0, 0, 48, 48), {
      pixelRatio: 2,
    });
  });
}

function commerceIconExpression() {
  return [
    "match",
    ["get", "_commerceCategory"],
    ...Object.keys(COMMERCE_MARKERS).flatMap((category) => [
      category,
      `commerce-${category}`,
    ]),
    "commerce-retail",
  ];
}

const LONS_CENTER = [5.5539, 46.6739];
const DEFAULT_VIEW = {
  center: LONS_CENTER,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

function getGeometryBounds(geometry) {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  const visit = (coordinates) => {
    if (
      Array.isArray(coordinates) &&
      typeof coordinates[0] === "number" &&
      typeof coordinates[1] === "number"
    ) {
      bounds[0] = Math.min(bounds[0], coordinates[0]);
      bounds[1] = Math.min(bounds[1], coordinates[1]);
      bounds[2] = Math.max(bounds[2], coordinates[0]);
      bounds[3] = Math.max(bounds[3], coordinates[1]);
      return;
    }
    if (Array.isArray(coordinates)) coordinates.forEach(visit);
  };
  visit(geometry?.coordinates);
  return bounds.every(Number.isFinite) ? bounds : null;
}

function fitCommuneBounds(map, boundaryData, duration = 0) {
  const feature = boundaryData?.features?.find((item) => item.geometry);
  const bounds = getGeometryBounds(feature?.geometry);
  if (!bounds) return false;
  map.fitBounds(
    [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
    { padding: 48, duration, pitch: 0, bearing: 0 }
  );
  return true;
}

function keepOverlaysAboveBasemap(map) {
  const overlayIds = [];
  if (map.getLayer("3d-buildings")) overlayIds.push("3d-buildings");
  if (map.getLayer("commune-outline")) overlayIds.push("commune-outline");

  Object.values(LAYERS).forEach((theme) => {
    Object.entries(theme.items).forEach(([layerKey, meta]) => {
      const sourceId = `osm-${layerKey}`;
      const layerIds =
        meta.geometry === "line"
          ? [`${sourceId}-halo`, `${sourceId}-fill`]
          : meta.geometry === "polygon"
            ? [`${sourceId}-fill`, `${sourceId}-outline`, `${sourceId}-symbol`, `${sourceId}-label`]
            : [`${sourceId}-halo`, `${sourceId}-fill`, `${sourceId}-symbol`];
      layerIds.forEach((id) => {
        if (map.getLayer(id)) overlayIds.push(id);
      });
    });
  });

  const layers = map.getStyle()?.layers || [];
  const topLayerIds = layers.slice(-overlayIds.length).map((layer) => layer.id);
  if (overlayIds.length && overlayIds.every((id, index) => id === topLayerIds[index])) {
    return;
  }
  overlayIds.forEach((id) => map.moveLayer(id));
}

function makeStyle(basemap) {
  if (basemap.type === "raster") return buildRasterStyle(basemap);
  return basemap.style;
}

const MapView = React.forwardRef(function MapView(
  { basemap, buildings3D, layerData, boundaryData, onFeatureClick, onEmptyClick, selectedId },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const applyRef = useRef(() => {});
  const hasFitCommune = useRef(false);

  React.useImperativeHandle(ref, () => ({
    resetCamera: () => {
      const map = mapRef.current;
      if (!map || !fitCommuneBounds(map, boundaryData, 1400)) {
        map?.flyTo({ ...DEFAULT_VIEW, duration: 1400 });
      }
    },
    flyTo: (opts) => mapRef.current?.flyTo(opts),
    getMap: () => mapRef.current,
  }));

  const applyAllSources = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // 3D buildings
    if (buildings3D) {
      if (!map.getLayer("3d-buildings")) {
        const style = map.getStyle();
        const vectorSource = Object.entries(style.sources).find(
          ([, s]) => s.type === "vector"
        );
        if (vectorSource) {
          const [srcName] = vectorSource;
          for (const sl of ["building", "buildings"]) {
            try {
              map.addLayer({
                id: "3d-buildings",
                source: srcName,
                "source-layer": sl,
                type: "fill-extrusion",
                minzoom: 14,
                paint: {
                  "fill-extrusion-color": [
                    "interpolate",
                    ["linear"],
                    [
                      "coalesce",
                      ["get", "render_height"],
                      ["get", "height"],
                      10,
                    ],
                    0, "#E2E8F0",
                    30, "#94A3B8",
                    80, "#003D7A",
                  ],
                  "fill-extrusion-height": [
                    "coalesce",
                    ["get", "render_height"],
                    ["get", "height"],
                    ["*", ["coalesce", ["get", "levels"], 2], 3],
                  ],
                  "fill-extrusion-base": [
                    "coalesce",
                    ["get", "render_min_height"],
                    ["get", "min_height"],
                    0,
                  ],
                  "fill-extrusion-opacity": 0.85,
                },
              });
              break;
            } catch (_) { /* try next */ }
          }
        }
      }
    } else if (map.getLayer("3d-buildings")) {
      map.removeLayer("3d-buildings");
    }

    // Data layers
    addCommerceMarkerImages(map);
    Object.entries(LAYERS).forEach(([themeKey, theme]) => {
      Object.entries(theme.items).forEach(([layerKey, meta]) => {
        const srcId = `osm-${layerKey}`;
        const layerIds = [
          `${srcId}-halo`,
          `${srcId}-fill`,
          `${srcId}-outline`,
          `${srcId}-symbol`,
          `${srcId}-label`,
        ];
        if (themeKey === "commerces") layerIds.push(`${srcId}-symbol`);
        const fc = layerData[layerKey];

        if (!fc) {
          layerIds.forEach((lid) => {
            if (map.getLayer(lid)) map.removeLayer(lid);
          });
          if (map.getSource(srcId)) map.removeSource(srcId);
          return;
        }

        if (map.getSource(srcId)) {
          map.getSource(srcId).setData(fc);
        } else {
          map.addSource(srcId, { type: "geojson", data: fc });
        }

        if (meta.geometry === "line") {
          if (!map.getLayer(`${srcId}-halo`)) {
            map.addLayer({
              id: `${srcId}-halo`,
              type: "line",
              source: srcId,
              paint: {
                "line-color": meta.color,
                "line-width": 9,
                "line-opacity": 0.18,
                "line-blur": 2,
              },
            });
          }
          if (!map.getLayer(`${srcId}-fill`)) {
            map.addLayer({
              id: `${srcId}-fill`,
              type: "line",
              source: srcId,
              layout: { "line-cap": "round", "line-join": "round" },
              paint: {
                "line-color": meta.color,
                "line-width": 3.4,
              },
            });
          }
        } else if (meta.geometry === "polygon") {
          if (!map.getLayer(`${srcId}-fill`)) {
            map.addLayer({
              id: `${srcId}-fill`,
              type: "fill",
              source: srcId,
              paint: { "fill-color": meta.color, "fill-opacity": 0.28 },
            });
          }
          if (!map.getLayer(`${srcId}-outline`)) {
            map.addLayer({
              id: `${srcId}-outline`,
              type: "line",
              source: srcId,
              paint: { "line-color": meta.color, "line-width": 2.2 },
            });
          }
          if (meta.labelField && !map.getLayer(`${srcId}-label`)) {
            map.addLayer({
              id: `${srcId}-label`,
              type: "symbol",
              source: srcId,
              filter: ["has", meta.labelField],
              layout: {
                "symbol-placement": "point",
                "text-field": [
                  "coalesce",
                  ["get", meta.labelField],
                  ["get", "alt_name"],
                ],
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
                "text-size": 12,
                "text-max-width": 12,
                "text-allow-overlap": false,
                "text-ignore-placement": false,
              },
              paint: {
                "text-color": "#14532D",
                "text-halo-color": "#FFFFFF",
                "text-halo-width": 1.5,
              },
            });
          }
        } else {
          if (!map.getLayer(`${srcId}-halo`)) {
            map.addLayer({
              id: `${srcId}-halo`,
              type: "circle",
              source: srcId,
              paint: {
                "circle-radius": 15,
                "circle-color": meta.color,
                "circle-opacity": 0.2,
                "circle-blur": 0.5,
              },
            });
          }
          if (!map.getLayer(`${srcId}-fill`)) {
            map.addLayer({
              id: `${srcId}-fill`,
              type: "circle",
              source: srcId,
              paint: {
                "circle-radius": [
                  "case",
                  ["==", ["get", "id"], selectedId || ""],
                  10, 7,
                ],
                "circle-color": meta.color,
                "circle-stroke-width": 2.5,
                "circle-stroke-color": "#ffffff",
              },
            });
          } else {
            map.setPaintProperty(`${srcId}-fill`, "circle-radius", [
              "case",
              ["==", ["get", "id"], selectedId || ""],
              11, 7,
            ]);
          }
          if (themeKey === "commerces" && !map.getLayer(`${srcId}-symbol`)) {
            map.addLayer({
              id: `${srcId}-symbol`,
              type: "symbol",
              source: srcId,
              layout: {
                "icon-image": commerceIconExpression(),
                "icon-size": 1,
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
              },
            });
          }
        }
      });
    });

    if (boundaryData) {
      if (!map.getSource("commune-boundary")) {
        map.addSource("commune-boundary", { type: "geojson", data: boundaryData });
      } else {
        map.getSource("commune-boundary").setData(boundaryData);
      }
      if (!map.getLayer("commune-outline")) {
        map.addLayer({
          id: "commune-outline",
          type: "line",
          source: "commune-boundary",
          paint: {
            "line-color": "#E30613",
            "line-width": 2.5,
            "line-dasharray": [3, 2],
          },
        });
      }
      if (!hasFitCommune.current) {
        hasFitCommune.current = fitCommuneBounds(map, boundaryData);
      }
    }

    keepOverlaysAboveBasemap(map);
  }, [layerData, buildings3D, selectedId, boundaryData]);

  // Init map
  useEffect(() => {
    if (mapRef.current) return;
    const bm = BASEMAPS.find((b) => b.id === basemap) || BASEMAPS[0];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: makeStyle(bm),
      center: DEFAULT_VIEW.center,
      zoom: DEFAULT_VIEW.zoom,
      pitch: 0,
      bearing: 0,
      attributionControl: { compact: true },
      maxPitch: 75,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120 }), "bottom-left");

    map.on("load", () => applyRef.current());
    map.on("styledata", () => applyRef.current());

    map.on("click", (e) => {
      const allIds = [];
      Object.keys(LAYERS).forEach((t) =>
        Object.keys(LAYERS[t].items).forEach((k) =>
          allIds.push(`osm-${k}-fill`, `osm-${k}-symbol`)
        )
      );
      const existing = allIds.filter((l) => map.getLayer(l));
      if (existing.length === 0) return onEmptyClick?.();
      // Query with a small tolerance box around the click for easier POI selection
      const bbox = [
        [e.point.x - 8, e.point.y - 8],
        [e.point.x + 8, e.point.y + 8],
      ];
      const feats = map.queryRenderedFeatures(bbox, { layers: existing });
      // Prefer point layers over line layers (POI over cycleway) when both are hit
      feats.sort((a, b) => {
        const ap = a.layer.type === "circle" ? 0 : 1;
        const bp = b.layer.type === "circle" ? 0 : 1;
        return ap - bp;
      });
      if (feats && feats.length > 0) {
        const f = feats[0];
        let coords;
        if (f.geometry.type === "Point") coords = f.geometry.coordinates;
        else if (f.geometry.type === "LineString")
          coords = f.geometry.coordinates[Math.floor(f.geometry.coordinates.length / 2)];
        else coords = [e.lngLat.lng, e.lngLat.lat];
        onFeatureClick?.({ ...f, _clickCoords: coords });
      } else {
        onEmptyClick?.();
      }
    });

    // Cursor for interactive layers
    Object.keys(LAYERS).forEach((t) =>
      Object.keys(LAYERS[t].items).forEach((k) => {
        const lid = `osm-${k}-fill`;
        map.on("mouseenter", lid, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", lid, () => (map.getCanvas().style.cursor = ""));
      })
    );

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Basemap swap (skip initial mount which uses constructor style)
  const isFirstBasemap = useRef(true);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (isFirstBasemap.current) {
      isFirstBasemap.current = false;
      return;
    }
    const bm = BASEMAPS.find((b) => b.id === basemap) || BASEMAPS[0];
    map.setStyle(makeStyle(bm));
  }, [basemap]); // eslint-disable-line

  // Re-apply sources on any data / 3D change
  useEffect(() => {
    applyRef.current = applyAllSources;
    if (!mapRef.current) return;
    if (mapRef.current.isStyleLoaded()) applyAllSources();
  }, [applyAllSources]);

  return (
    <div
      ref={containerRef}
      data-testid="map-container"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
    />
  );
});

export default MapView;
