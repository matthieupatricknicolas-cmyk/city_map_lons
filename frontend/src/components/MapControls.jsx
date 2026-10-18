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
    <div className="absolute top-4 left-4 z-30 flex flex-col gap-3">
      {/* Basemap switcher */}
      <div className="relative">
        <button
          data-testid="basemap-selector-dropdown"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg hover:-translate-y-0.5 transition-transform"
        >
          <span className="w-8 h-8 rounded-lg bg-[#003D7A]/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#003D7A]" strokeWidth={2.5} />
          </span>
          <div className="text-left leading-tight">
            <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400">
              Fond de carte
            </div>
            <div className="text-xs font-bold text-slate-800">
              {current.name}
            </div>
          </div>
        </button>
        {open && (
          <div className="absolute top-full mt-2 left-0 w-72 max-h-[70vh] overflow-y-auto thin-scroll rounded-xl bg-white border border-slate-200 shadow-2xl p-2">
            {BASEMAPS.map((b) => (
              <button
                key={b.id}
                data-testid={`basemap-option-${b.id}`}
                onClick={() => {
                  onBasemapChange(b.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2 transition-colors ${
                  b.id === currentBasemap
                    ? "bg-[#003D7A] text-white"
                    : "hover:bg-slate-50 text-slate-800"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{b.name}</div>
                  <div
                    className={`text-[11px] ${
                      b.id === currentBasemap ? "text-white/70" : "text-slate-500"
                    }`}
                  >
                    {b.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D toggle */}
      <button
        data-testid="3d-buildings-toggle"
        onClick={onBuildings3DToggle}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 ${
          buildings3D
            ? "bg-[#003D7A] text-white border-[#003D7A]"
            : "bg-white/95 text-slate-800 border-slate-200"
        }`}
      >
        <Box
          className={`w-4 h-4 ${buildings3D ? "text-white" : "text-[#003D7A]"}`}
          strokeWidth={2.5}
        />
        <span className="text-xs font-bold">Bâtiments 3D</span>
      </button>

      {/* Reset camera */}
      <button
        data-testid="map-reset-camera-button"
        onClick={onResetCamera}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg text-slate-800 hover:-translate-y-0.5 transition-transform"
      >
        <Compass className="w-4 h-4 text-[#003D7A]" strokeWidth={2.5} />
        <span className="text-xs font-bold">Recentrer</span>
      </button>

      {/* Locate */}
      <button
        data-testid="map-locate-button"
        onClick={onLocate}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg text-slate-800 hover:-translate-y-0.5 transition-transform"
      >
        <Crosshair className="w-4 h-4 text-[#E30613]" strokeWidth={2.5} />
        <span className="text-xs font-bold">Ma position</span>
      </button>

      {/* Loading indicator */}
      {isLoading && (
        <div
          data-testid="map-loading-spinner"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg"
        >
          <Loader2 className="w-4 h-4 text-[#003D7A] animate-spin" />
          <span className="text-xs font-bold text-slate-700">
            Chargement GeoJSON…
          </span>
        </div>
      )}
    </div>
  );
}
