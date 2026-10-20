# Données des couches cartographiques

La plupart des couches thématiques et la limite communale sont chargées depuis
les fichiers GeoJSON versionnés dans le dépôt. La couche des DAE utilise l'API
open data officielle Géo'DAE, filtrée sur la commune de Lons-le-Saunier
(code INSEE 39300). Les autres fichiers sont des instantanés exportés le
18 octobre 2026 ; ils peuvent être modifiés ou remplacés indépendamment du code.

| Fichier | Couche | Source de l’instantané |
| --- | --- | --- |
| `bike_parking.geojson` | Parkings vélos | [GeoDataMine](https://geodatamine.fr/data/bicycle_parking/152508?format=geojson) |
| `cycle_lanes.geojson` | Pistes cyclables | [GeoDataMine](https://geodatamine.fr/data/cycleway/152508?format=geojson) |
| `shops.geojson` | Boutiques et magasins | [GeoDataMine](https://geodatamine.fr/data/shop_craft_office/152508?format=geojson) |
| `restaurants.geojson` | Restaurants, cafés et bars | [GeoDataMine](https://geodatamine.fr/data/restaurant/152508?format=geojson) |
| `historic.geojson` | Patrimoine historique | [GeoDataMine](https://geodatamine.fr/data/historic/152508?format=geojson) |
| `cinemas.geojson` | Cinémas | [GeoDataMine](https://geodatamine.fr/data/cinema/152508?format=geojson) |
| `libraries.geojson` | Bibliothèques | [GeoDataMine](https://geodatamine.fr/data/library/152508?format=geojson) |
| `bus_stops.geojson` | Arrêts et stations de bus | [Overpass API](https://overpass-api.de/) · arrêts/stations dans un rayon de 4 km autour de Lons-le-Saunier |
| `bus_lines.geojson` | Lignes de bus | [Overpass API](https://overpass-api.de/) · relations `route=bus` dans le même rayon, regroupées par itinéraire |
| `arts_venues.geojson` | Musées, théâtres et lieux artistiques | [Overpass API](https://overpass-api.de/) · rayon de 5 km |
| `parks.geojson` | Parcs et jardins | [Overpass API](https://overpass-api.de/) · rayon de 4,5 km |
| `playgrounds.geojson` | Aires de jeux | Jeu GeoJSON déjà présent dans le dépôt |
| `fountains.geojson` | Fontaines et eau potable | [Overpass API](https://overpass-api.de/) · rayon de 4,5 km |
| `green_spaces.geojson` | Espaces verts | [Overpass API](https://overpass-api.de/) · rayon de 4 km |
| `paid_parking.geojson` | Stationnement payant | [Overpass API](https://overpass-api.de/) · rayon de 4 km · instantané actuellement vide |
| `free_parking.geojson` | Stationnement gratuit | [Overpass API](https://overpass-api.de/) · rayon de 4 km |
| `parking_meters.geojson` | Horodateurs | [Overpass API](https://overpass-api.de/) · rayon de 4 km |
| `accessible_parking.geojson` | Places PMR | [Overpass API](https://overpass-api.de/) · rayon de 5 km |
| `drop_off.geojson` | Arrêts minute | [Overpass API](https://overpass-api.de/) · rayon de 4 km |
| `loading_zones.geojson` | Zones de livraison | [Overpass API](https://overpass-api.de/) · rayon de 4 km |
| `commune_boundary.geojson` | Limite communale | [Nominatim](https://nominatim.openstreetmap.org/) · relation OSM 152508 |
| `roadworks.geojson` | Travaux | Couche locale vide · géométries `Polygon` / `MultiPolygon` |
| `temporary_disruptions.geojson` | Perturbations temporaires | Couche locale vide · géométries `LineString` / `MultiLineString` |
| API Géo'DAE | Défibrillateurs automatisés externes | [API tabulaire data.gouv.fr](https://tabular-api.data.gouv.fr/api/resources/edb6a9e1-2f16-4bbf-99e7-c3eb6b90794c/data/?c_com_insee__exact=39300&page_size=100) · filtrée sur le code INSEE 39300 |

Les données Géo'DAE sont publiées par [Atlasanté](https://www.data.gouv.fr/datasets/geodae-base-nationale-des-defibrillateurs/) sous [Licence Ouverte 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).

Les données OpenStreetMap sont © [contributeurs OpenStreetMap](https://www.openstreetmap.org/copyright)
et disponibles sous licence [ODbL](https://opendatacommons.org/licenses/odbl/).
Les propriétés de provenance incluses dans les GeoJSON sont conservées.

## Modifier une couche

Remplacez le contenu du fichier correspondant par un GeoJSON
`FeatureCollection` valide, en coordonnées WGS 84 (longitude, latitude), puis
mettez à jour ce tableau et la date de l’instantané si nécessaire. Les noms de
fichiers sont référencés dans `frontend/src/lib/osm.js` et dans la page
autonome `frontend/public/lons-cartographie.html`. Les propriétés des entités
sont affichées dans leur fiche ; conservez leurs identifiants OSM (`id_osm`,
`osm_id` ou `id`) lorsqu’ils existent pour garder des identifiants stables.
Les lignes de bus regroupent les segments d’une même relation et utilisent des
géométries `LineString` ou `MultiLineString`.

Les fonds de carte, les bâtiments 3D, la recherche d’adresses et les photos
Panoramax utilisent toujours leurs services distants ; cette liste concerne les
couches de données cartographiques et la limite communale.
