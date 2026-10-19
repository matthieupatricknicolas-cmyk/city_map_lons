const PANORAMAX_API = "https://api.panoramax.xyz";

function distanceSquared(lon1, lat1, lon2, lat2) {
  const meanLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const dx = (lon2 - lon1) * Math.cos(meanLat);
  const dy = lat2 - lat1;
  return dx * dx + dy * dy;
}

export async function findNearestPanoramaxImage(lon, lat, signal) {
  const deltas = [0.001, 0.003, 0.006, 0.012];
  let nearest = null;
  let nearestDistance = Infinity;

  for (const delta of deltas) {
    const bbox = [
      lon - delta,
      lat - delta,
      lon + delta,
      lat + delta,
    ].join(",");
    const response = await fetch(
      `${PANORAMAX_API}/api/search?bbox=${bbox}&limit=100`,
      { signal }
    );
    if (!response.ok) {
      throw new Error(`Panoramax search failed: HTTP ${response.status}`);
    }

    const result = await response.json();
    for (const feature of result.features || []) {
      const [imageLon, imageLat] = feature.geometry?.coordinates || [];
      if (
        !feature.id ||
        typeof imageLon !== "number" ||
        typeof imageLat !== "number"
      ) {
        continue;
      }
      const distance = distanceSquared(lon, lat, imageLon, imageLat);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = feature;
      }
    }
    const nearestOutsideDistance = delta * Math.cos(lat * (Math.PI / 180));
    if (nearest && nearestDistance <= nearestOutsideDistance ** 2) break;
  }

  if (!nearest) return null;

  const thumbnailUrl =
    nearest.assets?.thumb?.href ||
    nearest.properties?.["geovisio:thumbnail"];
  if (!thumbnailUrl) return null;

  const viewerUrl = new URL("/", `${PANORAMAX_API}/`);
  viewerUrl.search = new URLSearchParams({
    focus: "pic",
    pic: nearest.id,
    map: `18/${lat.toFixed(6)}/${lon.toFixed(6)}`,
  }).toString();

  return { thumbnailUrl, viewerUrl: viewerUrl.toString() };
}
