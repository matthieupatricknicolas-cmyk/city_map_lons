# PRD — Cartographie Ville de Lons-le-Saunier

## Problem statement (original, verbatim intent)
Application web de cartographie 3D pour la Ville de Lons-le-Saunier (39000, France), basée sur MapLibre GL JS avec données OSM temps réel via Geodatamine + Overpass. Thèmes : Mobilité (parkings vélos, pistes cyclables, arrêts/lignes de bus), Commerces (boutiques, restaurants), Culture (patrimoine, cinémas, bibliothèques, musées/théâtres/arts) et Nature (parcs, aires de jeux, fontaines, espaces verts). Interactions : clic sur un objet → panneau latéral détaillé + accès Panoramax (photo la plus proche). Charte graphique Lons-le-Saunier stricte (rouge dominant #E30613, logo officiel).

**Contrainte produit** : livrer un **fichier HTML autonome** (`lons-cartographie.html`) téléchargeable et utilisable hors-ligne / sur un serveur externe (pas de backend).

## Architecture actuelle
- **Fichier unique** : `/app/frontend/public/lons-cartographie.html` (~1100 lignes, HTML + CSS + JS vanilla).
- Aucun backend requis. `/app/backend/server.py` inutilisé.
- Sources de données : Geodatamine (`geodatamine.fr`), Overpass (kumi.systems → overpass-api.de → osm.ch → private.coffee), Nominatim (avec fallback Photon `photon.komoot.io` pour CORS), Panoramax (`api.panoramax.xyz`).

## Ce qui est implémenté
### 2026-02 — Session 1 (fork courant)
- MapLibre 3D + bâtiments extrudés, 7 fonds de carte (CARTO, IGN, OSM France, OpenFreeMap, OpenTopoMap…).
- Charte Lons-le-Saunier : rouge #E30613 dominant, logo officiel webp, contour communal (Nominatim + fallback Overpass).
- 4 thèmes : Mobilité, Commerces, Culture, **Nature** (parcs, aires de jeux, fontaines, espaces verts).
- Icônes points 100% SVG vectorielles (cercles avec logo) — rendu universel.
- Point layers systématiquement au-dessus des lignes/polygones via `map.moveLayer`.
- Panoramax "photo la plus proche" (recherche bbox progressive 0.001° → 0.012°).
- Boutons recentrage / géolocalisation compacts en bas à droite.
- **Barre de recherche d'adresse** (Nominatim + fallback Photon, biais viewbox Lons, keyboard nav ↑↓ Enter Esc).
- **Export GeoJSON** des couches visibles (téléchargement local) avec metadata (title, timestamp, layers, sources, licence ODbL).
- Logo cliquable → https://www.lonslesaunier.fr (target=_blank).
- Résilience Overpass : AbortController 20 s par endpoint, état d'erreur retry-on-click sur les layer-rows.

## Backlog priorisé
### P2
- **Mode offline** : cache localStorage des dernières couches téléchargées (Geodatamine + Overpass), utilisable sans internet.
- **Sélecteur multi-communes** : élargir aux communes voisines de la CAECL (Communauté d'Agglomération ECLA).
- **Filtre par tag OSM** dans le panneau latéral (ex : ne montrer que les commerces avec `wheelchair=yes`).
- **Impression / export PDF** de la vue courante avec légende.

### Backlog / améliorations
- Marqueurs de cluster (supercluster) quand zoom out sur > 200 points.
- Mesure distance / surface directement sur la carte.
- Partage d'URL avec position/zoom/couches actives.

## API endpoints externes
- `https://geodatamine.fr/data/{theme}/152508?format=geojson` — POI par thème pour Lons.
- `https://overpass.kumi.systems/api/interpreter` (+ 3 miroirs) — requêtes Overpass QL.
- `https://nominatim.openstreetmap.org/search?...` — géocodage principal.
- `https://photon.komoot.io/api/?q=...&bbox=5.48,46.62,5.63,46.72` — fallback géocodeur CORS-friendly.
- `https://api.panoramax.xyz/api/search?bbox=...&limit=5` — recherche photos rue-vue.

## Tests
- `/app/test_reports/iteration_3.json` — testing_agent (2026-02) : 100 % (6/8 totalement, 2 partiels dus aux limites d'egress du preview Cloudflare).
- Aucun bug bloquant. UX retry câblé correctement. Preview restrictions n'affectent PAS le fichier téléchargé (Nominatim/Overpass fonctionnent depuis un navigateur utilisateur).

## Fichiers clés
- `/app/frontend/public/lons-cartographie.html` — application entière.
- `/app/memory/PRD.md` (ce fichier).
- `/app/test_reports/iteration_3.json` — dernier rapport.
