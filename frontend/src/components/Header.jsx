import React from "react";
import { Database, MapPin } from "lucide-react";

export default function Header({ counts = {} }) {
  const total = Object.values(counts).reduce((s, n) => s + (n || 0), 0);
  return (
    <header
      data-testid="app-header"
      className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-slate-200 bg-white/95 backdrop-blur-md relative z-30"
    >
      <div className="flex items-center gap-3" data-testid="app-logo-lons">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm"
             style={{ background: "linear-gradient(135deg,#003D7A 0%,#00559E 60%,#E30613 130%)" }}>
          <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="font-display text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Ville de
          </div>
          <div className="font-display font-extrabold text-lg md:text-xl text-slate-900">
            Lons-le-Saunier <span className="text-[#E30613]">·</span>{" "}
            <span className="text-[#003D7A]">Cartographie 3D</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Données GeoJSON · Locales
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {total} objets chargés
          </span>
        </div>
      </div>
    </header>
  );
}
