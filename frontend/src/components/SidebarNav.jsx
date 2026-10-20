import React from "react";
import {
  Bike,
  Bus,
  Navigation,
  Route,
  ShoppingBag,
  Utensils,
  Construction,
  HeartPulse,
  TriangleAlert,
  SquareParking,
  Layers as LayersIcon,
  Sparkles,
} from "lucide-react";
import { LAYERS } from "@/lib/osm";

const ICON_MAP = {
  Bike,
  Bus,
  Navigation,
  Route,
  ShoppingBag,
  Utensils,
  Construction,
  HeartPulse,
  TriangleAlert,
  Parking: SquareParking,
};

export default function SidebarNav({
  activeTheme,
  onThemeChange,
  visibleLayers,
  onLayerToggle,
  loadingLayers,
  counts,
}) {
  const themeKeys = Object.keys(LAYERS);

  return (
    <aside className="w-[280px] shrink-0 border-r border-slate-200 bg-white flex flex-col relative z-20">
      {/* Theme rail */}
      <div className="px-4 pt-5 pb-3">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-slate-400 mb-2">
          Thématiques
        </div>
        <div className="grid grid-cols-2 gap-2">
          {themeKeys.map((key) => {
            const theme = LAYERS[key];
            const active = key === activeTheme;
            return (
              <button
                key={key}
                data-testid={`tab-${key}-button`}
                onClick={() => onThemeChange(key)}
                className={`relative group rounded-xl px-3 py-3 text-left transition-all duration-200 border ${
                  active
                    ? "bg-[#003D7A] border-[#003D7A] text-white shadow-lg shadow-blue-900/20"
                    : "bg-slate-50 border-slate-200 hover:border-[#003D7A]/40 text-slate-700"
                }`}
              >
                {active && (
                  <span className="absolute -left-[1px] top-3 bottom-3 w-[3px] rounded-r tab-active-indicator" />
                )}
                <div className="flex items-center gap-2">
                  {key === "mobility" ? <Bike className="w-4 h-4" /> :
                    key === "travaux" ? <Construction className="w-4 h-4" /> :
                    key === "stationnement" ? <SquareParking className="w-4 h-4" /> :
                    key === "securite" ? <HeartPulse className="w-4 h-4" /> :
                    <ShoppingBag className="w-4 h-4" />}
                  <span className="font-display font-bold text-sm">
                    {theme.label}
                  </span>
                </div>
                <div
                  className={`mt-1 text-[10px] uppercase tracking-wider font-semibold ${
                    active ? "text-white/70" : "text-slate-400"
                  }`}
                >
                  {theme.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layers of the active theme */}
      <div className="px-4 pb-4 flex-1 overflow-y-auto thin-scroll">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-slate-400 mb-2 mt-2">
          Couches à afficher
        </div>
        <div className="space-y-2">
          {Object.entries(LAYERS[activeTheme].items).map(([layerKey, meta]) => {
            const Icon = ICON_MAP[meta.icon] || LayersIcon;
            const isVisible = visibleLayers[layerKey];
            const isLoading = loadingLayers[layerKey];
            const count = counts[layerKey] || 0;
            return (
              <label
                key={layerKey}
                data-testid={`layer-${layerKey.replace("_", "-")}-checkbox`}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 select-none ${
                  isVisible
                    ? "bg-white border-slate-300 shadow-sm hover:-translate-y-0.5"
                    : "bg-slate-50/60 border-slate-200 hover:bg-white"
                }`}
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isVisible ? meta.color : "#E2E8F0",
                    boxShadow: isVisible
                      ? `0 6px 14px ${meta.color}40`
                      : "none",
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    color={isVisible ? "white" : "#64748B"}
                    strokeWidth={2.4}
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">
                    {meta.label}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {isLoading
                      ? "Chargement des données…"
                      : isVisible
                      ? `${count} objets chargés`
                      : "Cliquez pour activer"}
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={!!isVisible}
                  onChange={() => onLayerToggle(layerKey)}
                />
                <span
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    isVisible ? "bg-[#003D7A]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      isVisible ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </label>
            );
          })}
        </div>

        {activeTheme === "stationnement" && (
          <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 rounded-lg bg-slate-50 p-2 text-[10px] font-medium text-slate-600">
            {[
              ["#2563EB", "Rue"],
              ["#059669", "Parking public"],
              ["#EA580C", "Clientèle"],
              ["#7C3AED", "Résidentiel / privé"],
            ].map(([color, label]) => (
              <div key={label} className="flex min-w-0 items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-xl bg-gradient-to-br from-[#003D7A] to-[#00559E] text-white p-4 relative overflow-hidden">
          <Sparkles className="w-16 h-16 absolute -right-3 -bottom-3 text-white/10" />
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70">
            Astuce
          </div>
          <div className="text-sm font-semibold leading-snug mt-1">
            Cliquez sur un objet pour ouvrir sa fiche détaillée. Cliquez dans le
            vide pour la refermer.
          </div>
        </div>
      </div>
    </aside>
  );
}
