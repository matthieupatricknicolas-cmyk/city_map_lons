import React from "react";
import { Layers, Box, Crosshair, Compass, Loader2 } from "lucide-react";
import { BASEMAPS } from "@/lib/basemaps";

export default function MapControls({
  currentBasemap,
  onBasemapChange,
  buildings3D,
  onBuildings3DToggle,
  onResetCamera,
  onLocate,
  isLoading,
}) {
  const [open, setOpen] = React.useState(false);
  const current = BASEMAPS.find((b) => b.id === currentBasemap) || BASEMAPS[0];

  return (
    <>
      <div className="absolute top-4 right-4 z-30 flex w-60 flex-col items-stretch gap-2">
        <div className="relative">
          <button
            data-testid="basemap-selector-dropdown"
            onClick={() => setOpen((v) => !v)}
            className="flex h-14 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 shadow-lg backdrop-blur-md transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#003D7A]/10">
              <Layers className="h-4 w-4 text-[#003D7A]" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1 text-left leading-tight">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Fond de carte
              </div>
              <div className="truncate text-xs font-bold text-slate-800">
                {current.name}
              </div>
            </div>
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-2xl thin-scroll">
              {BASEMAPS.map((basemap) => (
                <button
                  key={basemap.id}
                  data-testid={`basemap-option-${basemap.id}`}
                  onClick={() => {
                    onBasemapChange(basemap.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    basemap.id === currentBasemap
                      ? "bg-[#003D7A] text-white"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{basemap.name}</div>
                    <div
                      className={`text-[11px] ${
                        basemap.id === currentBasemap
                          ? "text-white/70"
                          : "text-slate-500"
                      }`}
                    >
                      {basemap.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          data-testid="3d-buildings-toggle"
          onClick={onBuildings3DToggle}
          className={`flex h-14 w-full items-center gap-2 rounded-xl border px-3 shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 ${
            buildings3D
              ? "border-[#003D7A] bg-[#003D7A] text-white"
              : "border-slate-200 bg-white/95 text-slate-800"
          }`}
        >
          <Box
            className={`h-4 w-4 shrink-0 ${
              buildings3D ? "text-white" : "text-[#003D7A]"
            }`}
            strokeWidth={2.5}
          />
          <span className="truncate text-xs font-bold">Bâtiments 3D</span>
        </button>

        {isLoading && (
          <div
            data-testid="map-loading-spinner"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-md"
          >
            <Loader2 className="h-4 w-4 animate-spin text-[#003D7A]" />
            <span className="text-xs font-bold text-slate-700">
              Chargement GeoJSON…
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-[112px] right-2 z-30 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur-md">
        <button
          data-testid="map-reset-camera-button"
          onClick={onResetCamera}
          aria-label="Recentrer la carte"
          title="Recentrer la carte"
          className="flex h-11 w-11 items-center justify-center text-[#003D7A] hover:bg-slate-100"
        >
          <Compass className="h-5 w-5" strokeWidth={2.5} />
        </button>
        <button
          data-testid="map-locate-button"
          onClick={onLocate}
          aria-label="Ma position"
          title="Ma position"
          className="flex h-11 w-11 items-center justify-center border-t border-slate-200 text-[#E30613] hover:bg-slate-100"
        >
          <Crosshair className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
}
