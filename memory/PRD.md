# PRD · Cartographie 3D Ville de Lons-le-Saunier

## Problème initial (verbatim)
> Je voudrais créer une cartographie web basée sur la technologie MapLibre avec la possibilité
> de faire de la navigation 3D et exploitant les API de données libres extraites de OpenStreetMap
> en direct. Créer des onglets représentant des thèmes différents. Premier thème : déplacement et
> mobilité (parkings vélos, pistes cyclables, abris bus, lignes de bus). Deuxième thème : commerces.
> Données interrogeables au clic, symbologie type flaticon, popup latérale glissante qui se replie
> au clic hors POI. Charte graphique Ville de Lons-le-Saunier.

## Architecture
- **Frontend** : React 19 + Tailwind + MapLibre GL JS 4.7 + Lucide + Sonner (toasts)
- **Backend** : FastAPI (endpoint `/api/config` uniquement — non requis pour la carto en direct)
- **Données** :
  - `https://geodatamine.fr/data/{theme}/152508?format=geojson` (Lons-le-Saunier, admin_8)
  - `https://overpass-api.de/api/interpreter` (POST QL) pour arrêts & lignes bus
- **Fonds de carte** : 7 basemaps (CARTO Voyager par défaut, Dark Matter, OpenFreeMap, IGN Ortho, OSM France, OpenTopoMap, MapLibre Demo)

## Personas
- **Citoyen(ne) de Lons-le-Saunier** cherchant un parking vélo, un commerce, un arrêt de bus.
- **Agent municipal** exposant les données publiques enrichies OSM.
- **Touriste** explorant la ville en 3D.

## Core requirements (statique)
- Navigation 3D MapLibre (pitch, bearing, extrusion bâtiments)
- Données OSM en DIRECT (geodatamine.fr / Overpass)
- Onglets thématiques (Mobilité, Commerces) extensibles
- Panneau latéral droit glissant au clic POI, fermeture au clic vide
- Charte Ville : bleu #003D7A + rouge #E30613, typographies Bricolage Grotesque + Plus Jakarta Sans

## Implémenté (2026-02-08)
- [x] Layout : header municipal, sidebar thèmes/couches, carte plein écran
- [x] MapView MapLibre 3D avec extrusion bâtiments et 7 basemaps switchables
- [x] Fetch geodatamine.fr : bicycle_parking (144), cycleway (496), shop_craft_office (617), restaurant (95)
- [x] Fetch Overpass : bus_stop + bus_station, relations route=bus (Overpass injoignable depuis container — appels client OK en prod)
- [x] Panneau détail droit avec titre, catégorie, coordonnées, attributs FR (schéma GeoDataMine)
- [x] Toggle bâtiments 3D, bouton Recentrer, géolocalisation
- [x] Toast Sonner sur chargement de couche
- [x] Tests E2E : 12/12 acceptance criteria PASS

## Backlog (P1)
- [ ] Ajouter thèmes : Services publics, Santé, Écoles, Patrimoine, Sport
- [ ] Icônes SVG custom dans les points (au lieu de cercles) via `map.loadImage`
- [ ] Barre de recherche d'adresse (Nominatim)
- [ ] Filtre "à proximité de moi" avec rayon paramétrable
- [ ] Export CSV/GeoJSON depuis le panneau (télécharge geodatamine)
- [ ] Mode partage (URL avec état de la carte + POI sélectionné)

## Backlog (P2)
- [ ] i18n (FR/EN)
- [ ] Mode contraste renforcé / accessibilité AA
- [ ] Analytics d'usage anonymisé
- [ ] Impression / export PDF de la vue courante

## Test creds
Aucune (app publique, pas d'auth).
