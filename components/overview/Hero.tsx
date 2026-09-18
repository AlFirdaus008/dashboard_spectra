import Link from 'next/link';

export default function Hero() {
  return (
    <section className="project-intro">
      <div className="intro-copy">
        <div className="intro-eyebrow"><span /> DUKUNGAN KEPUTUSAN GEOSPASIAL</div>
        <h1>Pandangan yang lebih jelas.<br /><span>Titik awal yang lebih baik.</span></h1>
        <p>Jelajahi DAS Mahakam melalui evidence jaringan hidrologi, kerentanan retrospektif, dan konteks tumpang tindih kebijakan.</p>
        <div className="intro-actions">
          <Link className="primary-link" href="/atlas">Jelajahi atlas <span>↗</span></Link>
          <Link className="secondary-link story-intro-link" href="/story">Sorotan Kasus 3D <span>→</span></Link>
          <Link className="secondary-link" href="/methodology">Pahami sains di baliknya <span>→</span></Link>
        </div>
      </div>
      <div className="intro-aside">
        <span className="intro-index">01 / WILAYAH KAJIAN</span>
        <h2>SPECTRA</h2>
        <p>Dari screening spasial<br />menuju tindak lanjut teknis yang terinformasi.</p>
        <div className="intro-tags">
          <span>DAS Mahakam</span>
          <span>Dukungan Keputusan</span>
        </div>
        <div className="intro-footnote">Eksplorasi berbasis evidence.<br />Keputusan di tangan manusia.</div>
      </div>
    </section>
  );
}
