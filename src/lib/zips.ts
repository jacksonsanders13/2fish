import centroids from "@/data/zip-centroids.json";

// Census ZCTA centers, already rounded to 2 decimals (~1 km). That's the only
// location precision the app ever stores.
const ZIPS = centroids as unknown as Record<string, [number, number]>;

export function lookupZip(zip: string): { lat: number; lng: number } | null {
  const hit = ZIPS[zip];
  if (!hit) return null;
  return { lat: hit[0], lng: hit[1] };
}
