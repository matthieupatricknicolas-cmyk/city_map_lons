import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import SidebarNav from "@/components/SidebarNav";
import MapView from "@/components/MapView";
import MapControls from "@/components/MapControls";
import DetailPanel from "@/components/DetailPanel";
import { fetchLayerData, fetchLayerGeoJSON, LAYERS, stampFeatures } from "@/lib/osm";

const DEFAULT_VISIBLE = {
  mobility: {
    bike_parking: true,
    cycle_lanes: true,
    bus_shelter: true,
    bus_lines: false,
  },
  commerces: {
    shops: true,
    food: true,
  },
  nature: {
    parks: true,
  },
  stationnement: {
    parking_pay: true,
    parking_free: true,
  },
  travaux: {
    roadworks: true,
    disruptions: true,
  },
  securite: {
    dae: true,
  },
};

const INITIAL_VISIBLE = Object.fromEntries(
  Object.keys(LAYERS.mobility.items).map((layerKey) => [layerKey, false])
);

export default function CartographyPage() {
  const [activeTheme, setActiveTheme] = useState("mobility");
  const [visibleLayers, setVisibleLayers] = useState(INITIAL_VISIBLE);
  const [basemap, setBasemap] = useState("cartodb_voyager");
  const [buildings3D, setBuildings3D] = useState(false);
  const [layerData, setLayerData] = useState({}); // layerKey -> FeatureCollection (stamped)
  const [boundaryData, setBoundaryData] = useState(null);
  const [loadingLayers, setLoadingLayers] = useState({});
  const [selectedFeature, setSelectedFeature] = useState(null);
  const mapRef = useRef(null);
  const inflight = useRef(new Set());

  useEffect(() => {
    let cancelled = false;
    fetchLayerGeoJSON("commune_boundary.geojson")
      .then((geojson) => {
        if (!cancelled) setBoundaryData(geojson);
      })
      .catch((error) => {
        console.error("Commune boundary loading error", error);
        toast.error("Impossible de charger la limite communale");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchLayerIfMissing = useCallback(
    async (themeKey, layerKey) => {
      if (layerData[layerKey] || inflight.current.has(layerKey)) return;
      const meta = LAYERS[themeKey].items[layerKey];
      if (!meta) return;
      inflight.current.add(layerKey);
      setLoadingLayers((s) => ({ ...s, [layerKey]: true }));
      try {
        const fc = await fetchLayerData(meta);
        const stamped = stampFeatures(fc, themeKey, layerKey, meta);
        setLayerData((s) => ({ ...s, [layerKey]: stamped }));
        toast.success(`${meta.label} · ${stamped.features.length} objets`, {
          duration: 2200,
        });
      } catch (e) {
        console.error("GeoJSON loading error", layerKey, e);
        toast.error(`Impossible de charger « ${meta.label} »`);
      } finally {
        inflight.current.delete(layerKey);
        setLoadingLayers((s) => ({ ...s, [layerKey]: false }));
      }
    },
    [layerData]
  );

  const handleThemeChange = useCallback((themeKey) => {
    setActiveTheme(themeKey);
    setVisibleLayers(DEFAULT_VISIBLE[themeKey]);
    setSelectedFeature(null);
  }, []);

  const handleLayerToggle = useCallback((layerKey) => {
    setVisibleLayers((s) => ({ ...s, [layerKey]: !s[layerKey] }));
  }, []);

  useEffect(() => {
    Object.entries(visibleLayers).forEach(([layerKey, visible]) => {
      if (visible) fetchLayerIfMissing(activeTheme, layerKey);
    });
  }, [visibleLayers, activeTheme, fetchLayerIfMissing]);

  // Only show layers currently toggled ON (of the active theme)
  const activeLayerData = useMemo(() => {
    const out = {};
    Object.entries(visibleLayers).forEach(([k, v]) => {
      if (v && layerData[k]) out[k] = layerData[k];
    });
    return out;
  }, [visibleLayers, layerData]);

  const counts = useMemo(() => {
    const c = {};
    Object.entries(layerData).forEach(([k, fc]) => {
      c[k] = fc.features?.length || 0;
    });
    return c;
  }, [layerData]);

  const isLoading = Object.values(loadingLayers).some(Boolean);

  const handleFeatureClick = useCallback((f) => {
    setSelectedFeature(f);
    if (mapRef.current && f._clickCoords) {
      mapRef.current.flyTo({
        center: f._clickCoords,
        offset: [-160, 0],
        duration: 900,
        essential: true,
      });
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    setSelectedFeature(null);
    mapRef.current?.resetCamera();
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return toast.error("Géolocalisation non disponible");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 16,
          duration: 1400,
        });
      },
      () => toast.error("Impossible de vous localiser")
    );
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#F8FAFC]">
      <Header counts={counts} />
      <div className="flex-1 flex overflow-hidden">
        <SidebarNav
          activeTheme={activeTheme}
          onThemeChange={handleThemeChange}
          visibleLayers={visibleLayers}
          onLayerToggle={handleLayerToggle}
          loadingLayers={loadingLayers}
          counts={counts}
        />
        <main className="relative flex-1 overflow-hidden">
          <MapView
            ref={mapRef}
            basemap={basemap}
            buildings3D={buildings3D}
            layerData={activeLayerData}
            boundaryData={boundaryData}
            onFeatureClick={handleFeatureClick}
            onEmptyClick={() => setSelectedFeature(null)}
            selectedId={selectedFeature?.properties?.id}
          />
          <MapControls
            currentBasemap={basemap}
            onBasemapChange={setBasemap}
            buildings3D={buildings3D}
            onBuildings3DToggle={() => setBuildings3D((v) => !v)}
            onResetCamera={handleResetCamera}
            onLocate={handleLocate}
            isLoading={isLoading}
          />
          {selectedFeature && (
            <DetailPanel
              feature={selectedFeature}
              onClose={() => setSelectedFeature(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
