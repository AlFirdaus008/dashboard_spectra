'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import StoryLayerStage, { type ViewMode } from './StoryLayerStage';

interface StoryChapter {
  id: string;
  step: number;
  kicker: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  metrics: { label: string; value: string; desc: string }[];
  takeaway: string;
  ctaText?: string;
  ctaHref?: string;
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 'bab-1',
    step: 0,
    kicker: 'BABAK 01 · BENTANG ALAM ALAMI',
    title: 'Sistem Hidrologi yang Saling Terhubung',
    subtitle: 'Aliran air alami dari pedalaman pegunungan menuju Delta Mahakam',
    paragraphs: [
      'Daerah Aliran Sungai (DAS) Mahakam mencakup kawasan seluas lebih dari 77.000 kilometer persegi di Kalimantan Timur. Ribuan anak sungai, seperti Sungai Belayan dan Kedang Kepala, mengalirkan air dari pedalaman dataran tinggi menuju muara di Selat Makassar.',
      'Secara alami, tutupan vegetasi hutan di kawasan hulu berfungsi layaknya spons raksasa. Hutan memperlambat laju air hujan, menyerap sebagian besar volume ke dalam tanah, dan menjaga kestabilan debit air sehingga kawasan hilir terhindar dari luapan air mendadak.',
    ],
    metrics: [
      { label: 'Unit Analisis Spasial', value: '24.306 Grid', desc: 'Kotak 1×1 km terverifikasi mencakup seluruh bentang DAS' },
      { label: 'Panjang Sungai Utama', value: '920 km', desc: 'Urat nadi transportasi dan ekosistem Kalimantan Timur' },
    ],
    takeaway: 'Kondisi hutan di hulu adalah benteng perlindungan alami utama bagi warga yang tinggal di hilir.',
  },
  {
    id: 'bab-2',
    step: 1,
    kicker: 'BABAK 02 · TEKANAN LAHAN DI HULU',
    title: 'Ketika Konsesi Memotong Aliran Air',
    subtitle: 'Alih fungsi lahan tambang batubara dan perkebunan monokultur',
    paragraphs: [
      'Dalam dua dekade terakhir, aktivitas ekstraktif berkembang pesat di wilayah hulu, khususnya di Kutai Kartanegara dan Kutai Barat. Pembukaan tambang batubara terbuka dan perkebunan monokultur mengikis lapisan tanah penahan air di lereng-lereng perbukitan.',
      'Data lapangan menunjukkan laju alih fungsi lahan mencapai ratusan hektar per tahun di sekitar sempadan sungai. Hilangnya tutupan vegetasi menyebabkan air hujan tidak lagi terserap, melainkan langsung berubah menjadi limpasan permukaan yang deras dan membawa endapan lumpur pekat ke badan sungai.',
    ],
    metrics: [
      { label: 'Laju Alih Fungsi Lahan', value: '223,8 Ha/th', desc: 'Akibat pembukaan tambang terbuka di lereng tangkapan air hulu' },
      { label: 'Tumpang-Tindih Izin', value: '35,6% Grid Target', desc: 'Grid prioritas screening dengan tumpang tindih izin tambang/sawit yang tercatat' },
    ],
    takeaway: 'Pembukaan lahan di hulu secara drastis menaikkan volume air limpasan dan lumpur yang mengalir ke sungai.',
  },
  {
    id: 'bab-3',
    step: 2,
    kicker: 'BABAK 03 · DETEKSI SISTEM CERDAS (GEOAI)',
    title: 'Menemukan Simpul Kritis Antar-Wilayah',
    subtitle: 'Model spasial memetakan titik temu tempat risiko berlipat ganda',
    paragraphs: [
      'Aliran air tidak pernah berhenti di batas administrasi kabupaten. Masalah besar muncul ketika air dari beberapa anak sungai hulu bertemu pada satu titik sempit sebelum mengalir ke kabupaten tetangga.',
      'Melalui pendekatan GeoAI dan analisis jaringan hidrologi, proyek ini memetakan titik-titik tersebut sebagai bridging nodes (simpul jembatan kritis). Jika simpul ini mengalami sedimentasi parah atau tanggulnya jebol, dampaknya merembet ke seluruh sistem DAS di bawahnya.',
    ],
    metrics: [
      { label: 'Target Screening Terdeteksi', value: '1.696 Grid', desc: 'Titik prioritas yang membutuhkan pengawasan teknis terpadu' },
      { label: 'Simpul Lintas Batas Kritis', value: '3 Kategori', desc: 'Simpul lintas-sistem, jembatan struktural, dan batas administrasi' },
    ],
    takeaway: 'Bencana tidak terjadi merata di semua tempat, melainkan berpusat pada simpul-simpul kritis yang kini bisa diidentifikasi secara sistematis melalui screening.',
  },
  {
    id: 'bab-4',
    step: 3,
    kicker: 'BABAK 04 · DAMPAK HILIR & AKSI NYATA',
    title: 'Dari Risiko Tersembunyi Menuju Solusi Bersama',
    subtitle: 'Warga hilir terlindungi saat instansi terkait bertindak terkoordinasi',
    paragraphs: [
      'Puncak dari rangkaian proses ini dirasakan langsung oleh masyarakat di kawasan hilir, seperti Samarinda, Tenggarong, dan Muara Kaman. Banjir berulang yang mereka alami berkaitan dengan pola limpasan air dari wilayah hulu yang terdegradasi, bukan hanya hujan lokal semata; keterkaitan spasial ini adalah dasar screening, bukan bukti sebab-akibat.',
      'Dengan dashboard ini, koordinasi lintas instansi tidak lagi mengandalkan dugaan. Setiap grid prioritas kini memiliki panduan tindakan teknis yang jelas bagi instansi yang berwenang.',
    ],
    metrics: [
      { label: 'Penduduk di Wilayah Rentan', value: '> 500.000 Jiwa', desc: 'Masyarakat hilir yang terlindungi melalui mitigasi terkoordinasi' },
      { label: 'Kategori Rekomendasi Tindakan', value: '5 Level (R1-R5)', desc: 'Dari audit kolam tambang hingga pemulihan sempadan sungai' },
    ],
    takeaway: 'Masalah lintas batas hanya bisa diselesaikan jika pemerintah daerah dan instansi teknis memegang peta bukti yang sama.',
    ctaText: 'Buka Kasus Nyata Ini di Peta Atlas Spasial',
    ctaHref: '/atlas',
  },
];

export default function StoryScrollytelling() {
  const [activeStep, setActiveStep] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('isometric');
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Intersection observer to track which chapter is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = Number(entry.target.getAttribute('data-step'));
            if (!isNaN(stepIndex)) {
              setActiveStep(stepIndex);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-30% 0px -40% 0px',
        threshold: 0.2,
      }
    );

    chapterRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToChapter = (step: number) => {
    setActiveStep(step);
    const targetEl = chapterRefs.current[step];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="story-container">
      {/* Intro Hero Header */}
      <section className="story-hero-header">
        <div className="story-hero-copy">
          <span className="section-kicker">SOROTAN KASUS SPASIAL · 3D INTERAKTIF</span>
          <h1>Dari Izin Lahan di Hulu ke Banjir di Hilir: Anatomi Bencana DAS Mahakam</h1>
          <p>
            Telusuri bagaimana keputusan pembukaan lahan tambang dan sawit di kawasan hulu berakumulasi
            melalui jaringan sungai hingga memicu banjir di pemukiman hilir. Geser atau gulir ke bawah
            untuk melihat 4 lapisan data dalam model 3D interaktif.
          </p>
          <div className="story-hero-actions">
            <button
              type="button"
              className="primary-link"
              onClick={() => scrollToChapter(0)}
            >
              Mulai Eksplorasi 3D <span>↓</span>
            </button>
            <Link className="secondary-link" href="/atlas">
              Buka Peta Atlas Langsung <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Scrollytelling Stage & Content */}
      <div className="story-scrolly-grid">
        {/* Sticky Left Column: 3D Layering Stage */}
        <aside className="story-sticky-stage" aria-label="Visualisasi 3D Interaktif DAS Mahakam">
          <StoryLayerStage
            activeStep={activeStep}
            onStepChange={scrollToChapter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </aside>

        {/* Scrolling Right Column: Chapters & Narration */}
        <div className="story-narrative-column">
          {CHAPTERS.map((chapter, index) => (
            <div
              key={chapter.id}
              id={chapter.id}
              data-step={chapter.step}
              ref={(el) => {
                chapterRefs.current[index] = el;
              }}
              className={`story-chapter-card ${activeStep === index ? 'is-active-chapter' : ''}`}
            >
              <div className="chapter-header">
                <span className="chapter-step-badge">BABAK 0{index + 1}</span>
                <span className="chapter-kicker">{chapter.kicker}</span>
              </div>

              <h2 className="chapter-title">{chapter.title}</h2>
              <p className="chapter-subtitle">{chapter.subtitle}</p>

              <div className="chapter-body">
                {chapter.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {/* Metrics Grid */}
              <div className="chapter-metrics-grid">
                {chapter.metrics.map((m) => (
                  <div className="metric-box" key={m.label}>
                    <strong className="metric-value">{m.value}</strong>
                    <span className="metric-label">{m.label}</span>
                    <small className="metric-desc">{m.desc}</small>
                  </div>
                ))}
              </div>

              {/* Key Takeaway Banner */}
              <div className="chapter-takeaway">
                <span className="takeaway-icon" aria-hidden="true">💡</span>
                <p>{chapter.takeaway}</p>
              </div>

              {/* Chapter Action Buttons */}
              {chapter.ctaText && chapter.ctaHref && (
                <div className="chapter-cta-wrapper">
                  <Link href={chapter.ctaHref} className="chapter-cta-btn">
                    <span>{chapter.ctaText}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              )}
            </div>
          ))}

          {/* Conclusion Box */}
          <div className="story-conclusion-card">
            <h3>Siap Meneliti Lebih Lanjut?</h3>
            <p>
              Gunakan Atlas Spasial untuk memeriksa 24.306 grid kanonis DAS Mahakam secara mandiri,
              memfilter berdasarkan kabupaten, atau memeriksa data rekomendasi teknis per simpul.
            </p>
            <div className="conclusion-actions">
              <Link href="/atlas" className="primary-link">
                Eksplorasi Peta Interaktif <span>↗</span>
              </Link>
              <Link href="/" className="secondary-link">
                Kembali ke Ringkasan Proyek <span>→</span>
              </Link>
            </div>
            <small className="story-conclusion-note">
              Narasi ini adalah ringkasan screening spasial wilayah DAS Mahakam, bukan kelas risiko masa
              depan yang terkalibrasi. Tumpang tindih izin adalah evidence kontekstual, bukan jejak
              fisik di lapangan, dan keterkaitan spasial/model tidak membuktikan sebab-akibat.
              Lihat <Link href="/atlas#methodology">batasan ilmiah lengkap</Link> sebelum mengambil keputusan.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
