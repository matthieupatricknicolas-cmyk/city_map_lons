import React, { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { BASEMAPS, buildRasterStyle } from "@/lib/basemaps";
import { LAYERS } from "@/lib/osm";

const LONS_CENTER = [5.5539, 46.6739];
const DEFAULT_VIEW = {
  center: LONS_CENTER,
  zoom: 15,
  pitch: 55,
  bearing: -17.6,
};

function makeStyle(basemap) {
  if (basemap.type === "raster") return buildRasterStyle(basemap);
  return basemap.style;
}

const MapView = React.forwardRef(function MapView(
  { basemap, buildings3D, layerData, onFeatureClick, onEmptyClick, selectedId },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const applyRef = useRef(() => {});

  React.useImperativeHandle(ref, () => ({
    resetCamera: () => mapRef.current?.flyTo({ ...DEFAULT_VIEW, duration: 1400 }),
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
    Object.entries(LAYERS).forEach(([themeKey, theme]) => {
      Object.entries(theme.items).forEach(([layerKey, meta]) => {
        const srcId = `osm-${layerKey}`;
        const layerIds = [`${srcId}-halo`, `${srcId}-fill`];
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
        }
      });
    });
  }, [layerData, buildings3D, selectedId]);

  // Init map
  useEffect(() => {
    if (mapRef.current) return;
    const bm = BASEMAPS.find((b) => b.id === basemap) || BASEMAPS[0];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: makeStyle(bm),
      center: DEFAULT_VIEW.center,
      zoom: DEFAULT_VIEW.zoom,
      pitch: DEFAULT_VIEW.pitch,
      bearing: DEFAULT_VIEW.bearing,
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
        Object.keys(LAYERS[t].items).forEach((k) => allIds.push(`osm-${k}-fill`))
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
