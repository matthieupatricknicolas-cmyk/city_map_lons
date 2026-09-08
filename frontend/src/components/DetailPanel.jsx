import React from "react";
import { X, ExternalLink, MapPin, Tag, Info, Clock, Phone, Globe, Building2 } from "lucide-react";
import { LAYERS } from "@/lib/osm";

// Merge English OSM + French GeoDataMine schema labels
const KEY_LABELS = {
  // Common OSM
  name: "Nom",
  operator: "Opérateur",
  capacity: "Capacité",
  covered: "Couvert",
  bicycle_parking: "Type support",
  access: "Accès",
  fee: "Payant",
  surface: "Revêtement",
  lit: "Éclairé",
  shelter: "Abri",
  bench: "Banc",
  network: "Réseau",
  ref: "Ligne",
  route: "Itinéraire",
  opening_hours: "Horaires",
  phone: "Téléphone",
  website: "Site web",
  brand: "Enseigne",
  cuisine: "Cuisine",
  shop: "Type de commerce",
  amenity: "Catégorie",
  highway: "Type de voie",
  cycleway: "Type piste",
  // GeoDataMine French schema
  nom: "Nom",
  capacite: "Capacité",
  capacite_cargo: "Capacité cargo",
  type_accroche: "Type d'accroche",
  mobilier: "Mobilier",
  acces: "Accès",
  gratuit: "Gratuit",
  protection: "Protection",
  couverture: "Couverture",
  surveillance: "Surveillance",
  lumiere: "Éclairage",
  proprietaire: "Propriétaire",
  station_service: "Type",
  code_com: "Commune (INSEE)",
  type_voie: "Type de voie",
  bidirect: "Bidirectionnel",
  categorie: "Catégorie",
  cuisine_ou_specialite: "Spécialité",
  telephone: "Téléphone",
  site_web: "Site web",
  horaires: "Horaires",
  adresse: "Adresse",
  enseigne: "Enseigne",
  type: "Type",
};

function humanize(v) {
  if (v === "yes" || v === "true" || v === true) return "Oui";
  if (v === "no" || v === "false" || v === false) return "Non";
  if (typeof v === "string") return v.replace(/_/g, " ");
  if (v === null || v === undefined) return "—";
  return String(v);
}

export default function DetailPanel({ feature, onClose }) {
  if (!feature) return null;
  const props = feature.properties || {};
  const themeKey = props._theme;
  const layerKey = props._layer;
  const themeMeta = LAYERS[themeKey];
  const layerMeta = themeMeta?.items?.[layerKey];

  const title =
    props.name ||
    props.nom ||
    props.brand ||
    props.enseigne ||
    props.operator ||
    props.ref ||
    layerMeta?.label ||
    "Objet cartographique";

  const category =
    props.categorie ||
    props.shop ||
    props.amenity ||
    props.highway ||
    props.cycleway ||
    props.type ||
    layerMeta?.label ||
    "OSM";

  // Get anchor coordinates - prefer the click coordinates recorded by MapView,
  // fall back to geometry, then to GeoDataMine's coordonneesxy
  let lon = 0, lat = 0;
  if (feature._clickCoords) {
    [lon, lat] = feature._clickCoords;
  } else if (Array.isArray(props.coordonneesxy)) {
    [lon, lat] = props.coordonneesxy;
  } else if (feature.geometry?.type === "Point") {
    [lon, lat] = feature.geometry.coordinates;
  } else if (feature.geometry?.type === "LineString") {
    const c = feature.geometry.coordinates[Math.floor(feature.geometry.coordinates.length / 2)];
    if (c) [lon, lat] = c;
  }

  const IGNORED = new Set([
    "id", "id_local", "id_osm", "coordonneesxy",
    "_theme", "_layer", "_color", "_icon", "_label",
  ]);

  const entries = Object.entries(props)
    .filter(([k, v]) => {
      if (k.startsWith("_")) return false;
      if (IGNORED.has(k)) return false;
      if (v === null || v === "" || typeof v === "object") return false;
      return true;
    })
    .sort(([a], [b]) => {
      // Push key info to top
      const priority = ["name", "nom", "brand", "enseigne", "amenity", "shop", "categorie", "type"];
      const pa = priority.indexOf(a);
      const pb = priority.indexOf(b);
      if (pa === -1 && pb === -1) return a.localeCompare(b);
      if (pa === -1) return 1;
      if (pb === -1) return -1;
      return pa - pb;
    });

  const osmType = props.osm_type || props.id_osm?.split("/")?.[0] || "node";
  const osmId = props.osm_id || props.id_osm?.split("/")?.[1] || props.id;

  return (
    <div
      data-testid="side-detail-panel"
      className="slide-in-panel absolute top-4 right-4 bottom-4 w-[92vw] sm:w-[420px] bg-white rounded-2xl shadow-[0_30px_60px_rgba(8,112,184,0.18)] border border-slate-200 overflow-hidden flex flex-col z-40"
    >
      <div
        className="p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${layerMeta?.color || "#003D7A"} 0%, #003D7A 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 20%, white 0.5px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <button
          data-testid="side-detail-panel-close"
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm transition-colors"
        >
          <X className="w-4 h-4 text-white" strokeWidth={2.5} />
        </button>
        <div
          data-testid="poi-category-badge"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
        >
          <Tag className="w-3 h-3" />
          {humanize(category)}
        </div>
        <h2
          data-testid="poi-title"
          className="font-display text-2xl font-extrabold text-white leading-tight"
        >
          {humanize(title)}
        </h2>
        <div className="mt-2 flex items-center gap-1.5 text-white/80 text-xs font-mono">
          <MapPin className="w-3 h-3" />
          {lat.toFixed(5)}, {lon.toFixed(5)}
        </div>
      </div>

      <div
        data-testid="poi-details-container"
        className="flex-1 overflow-y-auto thin-scroll p-5 space-y-3"
      >
        {entries.length === 0 && (
          <div className="text-sm text-slate-500 flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Pas de données détaillées supplémentaires. Contribuez à
              OpenStreetMap pour l&apos;enrichir.
            </span>
          </div>
        )}
        {entries.map(([k, value]) => {
          const label = KEY_LABELS[k] || k.replace(/_/g, " ");
          if (k === "website" || k === "url" || k === "site_web") {
            const href = /^https?:\/\//.test(value) ? value : `https://${value}`;
            return (
              <a
                key={k}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-[#003D7A]">
                  <Globe className="w-4 h-4" /> {label}
                </span>
                <ExternalLink className="w-4 h-4 text-[#003D7A]" />
              </a>
            );
          }
          if (k === "phone" || k === "telephone") {
            return (
              <a
                key={k}
                href={`tel:${value}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-white transition-colors"
              >
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="w-4 h-4" /> {label}
                </span>
                <span className="text-sm font-mono font-semibold text-slate-800">
                  {value}
                </span>
              </a>
            );
          }
          if (k === "opening_hours" || k === "horaires") {
            return (
              <div key={k} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5" /> {label}
                </div>
                <div className="text-sm font-mono text-slate-800 whitespace-pre-wrap">
                  {value}
                </div>
              </div>
            );
          }
          return (
            <div
              key={k}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
            >
              <span className="text-xs uppercase tracking-wider font-bold text-slate-500 truncate mr-3">
                {label}
              </span>
              <span className="text-sm font-semibold text-slate-800 text-right max-w-[60%] truncate">
                {humanize(value)}
              </span>
            </div>
          );
        })}

        <div className="pt-3 space-y-2">
          {osmId && (
            <a
              href={`https://www.openstreetmap.org/${osmType}/${osmId}`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#003D7A] hover:bg-[#002855] text-white text-sm font-bold transition-colors"
            >
              <Building2 className="w-4 h-4" /> Voir sur OpenStreetMap
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
