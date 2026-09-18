const GOALS: {title: string; description: string}[] = [
  {
    title: 'Pipeline prediksi terpadu berbasis spatial ensemble learning',
    description:
      'Mengintegrasikan data izin tambang/perkebunan, tutupan lahan, produktivitas pertanian, dan kejadian bencana ke dalam satu basis data spasial skala DAS, dengan target klasifikasi kerentanan bencana yang andal dan terverifikasi secara spasial.',
  },
  {
    title: 'Identifikasi bridging nodes kritis',
    description:
      'Mengidentifikasi node-node kritis (bridging nodes) dalam jaringan hidrologis lintas-administratif melalui deteksi komunitas hidrologis, sebagai dasar prioritas koordinasi lintas kabupaten/provinsi.',
  },
  {
    title: 'Rekomendasi teknis sistem peringatan dini',
    description:
      'Merumuskan rekomendasi teknis yang siap diadopsi oleh BNPB, Bappenas, dan Kementerian Lingkungan Hidup sebagai instrumen pelaksana PP No. 26/2025.',
  },
];

export default function Goals() {
  return (
    <section className="content-section" id="goals">
      <span className="section-kicker">TUJUAN & GOALS</span>
      <h2>Tiga tujuan penelitian</h2>
      <ol className="goal-list">
        {GOALS.map((g, i) => (
          <li key={g.title}>
            <div className="goal-heading">
              <span className="goal-index">{i + 1}</span>
              <h3>{g.title}</h3>
            </div>
            <p>{g.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
