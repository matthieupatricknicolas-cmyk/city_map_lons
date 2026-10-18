# PRD — Cartographie Ville de Lons-le-Saunier

## Problem statement (original, verbatim intent)
Application web de cartographie 3D pour la Ville de Lons-le-Saunier (39000, France), basée sur MapLibre GL JS avec données OSM temps réel via Geodatamine + Overpass. Thèmes : Mobilité (parkings vélos, pistes cyclables, arrêts/lignes de bus), Commerces (boutiques, restaurants), Culture (patrimoine, cinémas, bibliothèques, musées/théâtres/arts) et Nature (parcs, aires de jeux, fontaines, espaces verts). Interactions : clic sur un objet → panneau latéral détaillé + accès Panoramax (photo la plus proche). Charte graphique Lons-le-Saunier stricte (rouge dominant #E30613, logo officiel).

**Contrainte produit** : livrer un **fichier HTML autonome** (`lons-cartographie.html`) téléchargeable et utilisable hors-ligne / sur un serveur externe (pas de backend).

## Architecture actuelle
- **Fichier unique** : `/app/frontend/public/lons-cartographie.html` (~1250 lignes, HTML + CSS + JS vanilla).
- Aucun backend requis. `/app/backend/server.py` inutilisé.
- Sources de données : Geodatamine (`geodatamine.fr`), Overpass (kumi.systems → overpass-api.de → osm.ch → private.coffee), Nominatim (avec fallback Photon `photon.komoot.io` pour CORS), Panoramax (`api.panoramax.xyz`).

## Ce qui est implémenté
### 2026-02 — Session 1 (fork courant)

**Cartographie & UI**
- MapLibre 3D + bâtiments extrudés, 7 fonds de carte (CARTO, IGN, OSM France, OpenFreeMap, OpenTopoMap…).
- Charte Lons-le-Saunier : rouge #E30613 dominant, logo officiel webp, contour communal (Nominatim + fallback Overpass).
- 4 thèmes : Mobilité, Commerces, Culture, **Nature** (parcs, aires de jeux, fontaines, espaces verts).
- Icônes points 100% SVG vectorielles (cercles avec logo) — rendu universel.
- Point layers systématiquement au-dessus des lignes/polygones (`map.moveLayer`).
- Panoramax "photo la plus proche" (recherche bbox progressive 0.001° → 0.012°).
- Boutons recentrage / géolocalisation compacts en bas à droite.
- Logo cliquable → https://www.lonslesaunier.fr (target=_blank).

**Fonctionnalités interactives**
- **Barre de recherche d'adresse** (Nominatim + fallback Photon, biais viewbox Lons, navigation clavier ↑↓ Enter Esc).
- **Export GeoJSON** des couches visibles (téléchargement local, metadata title/timestamp/layers/sources/licence ODbL).
- **Partage d'URL** : bouton "Partager" copie une URL avec l'état complet (thème, couches visibles, zoom, centre, pitch, bearing, basemap, 3D toggle) — auto-mise à jour du hash sur pan/zoom/toggle. Restauration via `location.hash` au chargement OU via `hashchange` en cours de session.
- **Mode hors ligne (cache localStorage)** : chaque couche téléchargée avec succès est sauvegardée sous `lons-cache:v1:<layer>` (TTL 30 jours). Si un fetch échoue et le cache est disponible → chargement transparent + bandeau "Mode hors ligne · cache <n> h/j" en jaune. QuotaExceededError géré (purge auto).
- Résilience Overpass : AbortController 20 s par endpoint, état d'erreur retry-on-click sur les layer-rows.

## Backlog priorisé
### P2
- **Sélecteur multi-communes** : élargir aux communes voisines de la CAECL (Communauté d'Agglomération ECLA).
- **Filtre par tag OSM** dans le panneau latéral (ex : ne montrer que les commerces avec `wheelchair=yes`).
- **Impression / export PDF** de la vue courante avec légende.
- **Marqueurs de cluster** (supercluster) quand zoom out sur > 200 points.
- **Mesure distance / surface** directement sur la carte.

## API endpoints externes
- `https://geodatamine.fr/data/{theme}/152508?format=geojson` — POI par thème.
- `https://overpass.kumi.systems/api/interpreter` (+ 3 miroirs) — requêtes Overpass QL.
- `https://nominatim.openstreetmap.org/search?...` — géocodage principal.
- `https://photon.komoot.io/api/?q=...&bbox=5.48,46.62,5.63,46.72` — fallback CORS-friendly.
- `https://api.panoramax.xyz/api/search?bbox=...&limit=5` — recherche photos rue-vue.

## URL scheme (share link)
```
#t=<theme>&l=<comma-sep-layer-keys>&z=<zoom>&c=<lng,lat>&p=<pitch>&b=<bearing>&bm=<basemap-id>&d=<0|1>
```
Exemple : `#t=commerces&l=shops&z=17&c=5.5539,46.6739&p=45&b=0&bm=cartodb_voyager&d=1`

## localStorage schema
```
lons-cache:v1:<layerKey> = { at: <timestamp>, fc: <FeatureCollection> }
```
TTL : 30 jours. Purge auto sur QuotaExceededError.

## Tests
- `/app/test_reports/iteration_3.json` — testing_agent : 100 % (6/8 totalement, 2 partiels dus aux limites d'egress du preview Cloudflare).
- Vérifications manuelles Playwright post-implémentation URL sharing + offline cache : tout OK (theme/zoom/pitch restaurés, hashchange live, cache localStorage rempli automatiquement).
- Aucun bug bloquant.

## Fichiers clés
- `/app/frontend/public/lons-cartographie.html` — application entière.
- `/app/memory/PRD.md` (ce fichier).
- `/app/test_reports/iteration_3.json` — dernier rapport testing_agent.
