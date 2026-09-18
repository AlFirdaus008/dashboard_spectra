export function validateCollection(data, metadata, scope) {
  if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('FeatureCollection GeoJSON tidak valid.');
  const expected = scope === 'all' ? metadata.counts.total : metadata.counts.targets;
  if (data.features.length !== expected) throw new Error('Jumlah rekaman tidak sesuai dengan sumber terverifikasi.');
  const ids = new Set(), counts = {}, required = [...new Set([...metadata.contract.popup_fields, ...metadata.contract.filter_fields])];
  for (const f of data.features) {
    const p = f.properties;
    if (f.type !== 'Feature' || !p || required.some(k => !(k in p))) throw new Error('Field presentasi wajib tidak lengkap.');
    if (typeof p.grid_id !== 'string' || !p.grid_id || ids.has(p.grid_id)) throw new Error('ID Grid tidak ada atau duplikat.');
    ids.add(p.grid_id);
    if (![1,2,3,4,5,99].includes(p.recommendation_level)) throw new Error('Tingkat rekomendasi tidak dikenali.');
    if (typeof p.screening_target !== 'boolean' || p.screening_target !== (p.recommendation_level !== 99)) throw new Error('Semantik target tidak sesuai.');
    if (scope === 'targets' && !p.screening_target) throw new Error('Rekaman referensi ada di layer target.');
    if (!f.geometry || !['Polygon','MultiPolygon'].includes(f.geometry.type) || !Array.isArray(f.geometry.coordinates)) throw new Error('Geometri poligon tidak ada.');
    counts[p.recommendation_level] = (counts[p.recommendation_level] || 0) + 1;
  }
  for (const [level, count] of Object.entries(metadata.counts.levels)) {
    if (scope === 'targets' && Number(level) === 99) continue;
    if ((counts[level] || 0) !== count) throw new Error('Distribusi rekomendasi tidak sesuai.');
  }
  return data;
}
