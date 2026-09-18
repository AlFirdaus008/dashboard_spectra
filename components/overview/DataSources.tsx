type DataSourceEntry = {
  agency: string;
  role: string;
};

const SOURCES: DataSourceEntry[] = [
  {
    agency: 'Kementerian Lingkungan Hidup dan Kehutanan (KLHK)',
    role: 'Data tutupan lahan (land cover) untuk memetakan konteks perubahan tutupan hutan dan jaringan hidrologi di sekitar setiap grid.',
  },
  {
    agency: 'Kementerian Energi dan Sumber Daya Mineral (ESDM)',
    role: 'Data izin usaha pertambangan aktif sebagai indikator tumpang-tindih kebijakan ekstraktif per unit grid.',
  },
  {
    agency: 'Kementerian Pertanian (Kementan)',
    role: 'Data konsesi dan perizinan perkebunan sawit sebagai indikator eksposur kebijakan komoditas monokultur skala luas.',
  },
  {
    agency: 'Badan Nasional Penanggulangan Bencana (BNPB / DIBI)',
    role: 'Data kejadian bencana hidrometeorologi (banjir bandang, longsor) sebagai label historis empiris pemodelan spasial.',
  },
  {
    agency: 'Badan Pusat Statistik (BPS)',
    role: 'Statistik tanaman pangan dan indikator sosial-ekonomi regional sebagai referensi dinamika wilayah dan kerentanan pangan.',
  },
  {
    agency: 'Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)',
    role: 'Data iklim historis termasuk curah hujan anteseden sebagai prediktor utama analisis kerentanan banjir.',
  },
];

export default function DataSources() {
  return (
    <section className="content-section" id="data-sources">
      <span className="section-kicker">PENGGUNAAN DATA</span>
      <h2>Enam sumber data resmi</h2>
      <p>
        Data dari keenam sumber berikut di-resampling ke resolusi 30 meter dan diikat ke satu geodatabase terpadu
        berbasis grid 1 km². Nilai iklim yang hilang diinterpolasi dengan metode IDW (Inverse Distance Weighting).
      </p>
      <div className="source-grid">
        {SOURCES.map(s => (
          <div className="source-card" key={s.agency}>
            <div className="source-card-head">
              <strong>{s.agency}</strong>
            </div>
            <p>{s.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
