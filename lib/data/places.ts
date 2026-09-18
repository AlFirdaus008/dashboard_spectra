export type Place = {
  name: string;
  kind: 'kabupaten' | 'kecamatan' | 'sungai';
  kabupaten?: string;
  bbox: [number, number, number, number];
};

let placesPromise: Promise<Place[]> | null = null;

// Search index for "Cari Lokasi": kabupaten/kecamatan/sungai names with a
// bounding box to fly the map to. Not a model feature, not evidence; see
// public/data/context/places_index.json's own role_statement.
export function loadPlaces(): Promise<Place[]> {
  if (!placesPromise) placesPromise = (async () => {
    const r = await fetch('/data/context/places_index.json');
    if (!r.ok) throw new Error('Indeks lokasi gagal dimuat.');
    const payload = await r.json();
    return payload.places as Place[];
  })().catch(e => { placesPromise = null; throw e; });
  return placesPromise;
}

export function searchPlaces(places: Place[], query: string, limit = 8): Place[] {
  const q = query.trim().toLowerCase().replace(/^sungai\s+/, '');
  if (!q) return [];
  return places
    .map(p => {
      const name = p.name.toLowerCase();
      let score = -1;
      if (name === q) score = 0;
      else if (name.startsWith(q)) score = 1;
      else if (name.includes(q)) score = 2;
      return {p, score};
    })
    .filter(x => x.score >= 0)
    .sort((a, b) => a.score - b.score || a.p.name.localeCompare(b.p.name, 'id'))
    .slice(0, limit)
    .map(x => x.p);
}
