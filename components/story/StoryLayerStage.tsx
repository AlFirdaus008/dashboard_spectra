'use client';

import React, { useState, useRef, useEffect } from 'react';

export type ViewMode = 'isometric' | 'exploded' | 'topdown';

interface StoryLayerStageProps {
  activeStep: number;
  onStepChange?: (step: number) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function StoryLayerStage({
  activeStep,
  onStepChange,
  viewMode,
  onViewModeChange,
}: StoryLayerStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [activePin, setActivePin] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 700);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Non-focused layers hide their pins (see .story-layer:not(.is-focused) .stage-pin
  // in project.css), so a popup left open on the previous layer should close too.
  useEffect(() => {
    setActivePin(null);
  }, [activeStep]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current || viewMode === 'topdown') return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Compute 3D transform base for the container
  const getContainerTransform = () => {
    if (viewMode === 'topdown') {
      return 'rotateX(0deg) rotateZ(0deg) rotateY(0deg)';
    }
    const baseRotX = 52;
    const baseRotZ = -30;
    const stepCompensation = activeStep * (isMobile ? (viewMode === 'exploded' ? 10 : 8) : (viewMode === 'exploded' ? 16 : 14));
    return `translateY(${stepCompensation}px) rotateX(${baseRotX + mouseOffset.y}deg) rotateZ(${baseRotZ + mouseOffset.x}deg)`;
  };

  // Vertical Z spacing based on viewMode and active step
  const getLayerZ = (layerIndex: number) => {
    if (viewMode === 'topdown') return 0;
    const gap = viewMode === 'exploded' ? (isMobile ? 100 : 135) : (isMobile ? 45 : 55);
    const baseZ = layerIndex * gap;
    // Elevate active layer slightly higher
    if (activeStep === layerIndex) {
      return baseZ + (viewMode === 'exploded' ? 26 : 18);
    }
    return baseZ;
  };

  return (
    <div className="story-stage-wrapper">
      {/* View Mode Controls */}
      <div className="story-stage-toolbar">
        <div className="stage-mode-segmented" role="group" aria-label="Mode Tampilan 3D">
          <button
            type="button"
            className={viewMode === 'isometric' ? 'is-active' : ''}
            onClick={() => onViewModeChange('isometric')}
            title="Perspektif 3D Isometrik"
          >
            3D Isometrik
          </button>
          <button
            type="button"
            className={viewMode === 'exploded' ? 'is-active' : ''}
            onClick={() => onViewModeChange('exploded')}
            title="Pemisahan Lapisan Meledak (Exploded View)"
          >
            Lapisan Terpisah
          </button>
          <button
            type="button"
            className={viewMode === 'topdown' ? 'is-active' : ''}
            onClick={() => onViewModeChange('topdown')}
            title="Tampilan Datar Peta"
          >
            Peta Datar
          </button>
        </div>

        <span className="stage-hint">
          {viewMode !== 'topdown' ? 'Gerakkan kursor untuk memutar perspektif 3D' : 'Tampilan tampak atas'}
        </span>
      </div>

      {/* 3D Stage Viewport */}
      <div
        ref={stageRef}
        className={`story-3d-viewport mode-${viewMode}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="story-3d-scene"
          style={{
            transform: getContainerTransform(),
          }}
        >
          {/* ============================================================
              LAYER 0: TOPOGRAFI & ALIRAN SUNGAI ALAMI (BASE)
             ============================================================ */}
          <div
            className={`story-layer layer-hydro ${activeStep === 0 ? 'is-focused' : ''}`}
            style={{
              transform: `translateZ(${getLayerZ(0)}px)`,
            }}
            onClick={() => onStepChange?.(0)}
          >
            <div className="layer-glass-plane">
              <svg viewBox="0 0 500 400" className="layer-svg" aria-hidden="true">
                <defs>
                  <linearGradient id="basinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#126e72" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#08383a" stopOpacity="0.32" />
                  </linearGradient>
                  <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#55d4b8" />
                    <stop offset="50%" stopColor="#32b5dc" />
                    <stop offset="100%" stopColor="#1b85b8" />
                  </linearGradient>
                </defs>

                {/* Basin Contour Boundary */}
                <path
                  d="M 60,180 C 70,110 140,50 240,45 C 330,40 430,85 450,160 C 470,230 440,320 350,360 C 250,400 130,370 80,310 C 50,260 50,220 60,180 Z"
                  fill="url(#basinGrad)"
                  stroke="#1b8b8f"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Topographic Contour Rings */}
                <path
                  d="M 110,190 C 120,130 180,90 260,85 C 330,80 390,120 410,180 C 420,240 380,300 310,325 C 230,350 140,320 115,260 Z"
                  fill="none"
                  stroke="#126e72"
                  strokeWidth="1"
                  opacity="0.4"
                />
                <path
                  d="M 170,200 C 180,160 220,130 280,125 C 330,120 370,150 380,190 C 390,230 350,270 300,285 C 240,300 180,270 170,230 Z"
                  fill="none"
                  stroke="#126e72"
                  strokeWidth="1"
                  opacity="0.3"
                />

                {/* Main River Arteries (Sungai Mahakam) */}
                <path
                  d="M 90,160 Q 150,170 200,210 T 290,230 T 380,240 Q 420,260 445,290"
                  fill="none"
                  stroke="url(#riverGrad)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  className="pulse-stream"
                />

                {/* Tributary 1: Sungai Belayan (Hulu Utara) */}
                <path
                  d="M 210,65 Q 220,120 200,210"
                  fill="none"
                  stroke="url(#riverGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Tributary 2: Kedang Kepala (Timur Laut) */}
                <path
                  d="M 320,80 Q 305,150 290,230"
                  fill="none"
                  stroke="url(#riverGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Tributary 3: Kedang Pahu (Barat Daya) */}
                <path
                  d="M 120,280 Q 160,250 200,210"
                  fill="none"
                  stroke="url(#riverGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Delta Outflow branches */}
                <path d="M 445,290 Q 460,300 480,310" stroke="#32b5dc" strokeWidth="2.5" fill="none" />
                <path d="M 445,290 Q 470,280 490,285" stroke="#32b5dc" strokeWidth="2" fill="none" />
                <path d="M 445,290 Q 460,325 475,340" stroke="#32b5dc" strokeWidth="1.8" fill="none" />
              </svg>

              {/* Layer Title Pill */}
              <div className="layer-tag">
                <span className="layer-number">01</span>
                <span className="layer-name">Bentang Alam &amp; Jaringan Sungai Alami</span>
              </div>

              {/* Callout Pins on Layer 1 */}
              <button
                type="button"
                className={`stage-pin pin-hulu ${activePin === 'hulu' ? 'is-open' : ''}`}
                style={{ top: '35%', left: '32%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePin(activePin === 'hulu' ? null : 'hulu');
                }}
              >
                <span className="pin-dot" />
                <span className="pin-label">Hulu Sungai Belayan</span>
                {activePin === 'hulu' && (
                  <div className="pin-popup">
                    <strong>Hulu DAS Mahakam</strong>
                    <p>Wilayah tangkapan air utama dengan topografi lereng curam penghasil debit air deras.</p>
                  </div>
                )}
              </button>

              <button
                type="button"
                className={`stage-pin pin-delta ${activePin === 'delta' ? 'is-open' : ''}`}
                style={{ top: '68%', left: '84%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePin(activePin === 'delta' ? null : 'delta');
                }}
              >
                <span className="pin-dot" />
                <span className="pin-label">Delta Mahakam</span>
                {activePin === 'delta' && (
                  <div className="pin-popup">
                    <strong>Delta &amp; Muara Selat Makassar</strong>
                    <p>Muara pelepasan seluruh volume air DAS Mahakam yang dipengaruhi pasang surut laut.</p>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* ============================================================
              LAYER 1: KAWASAN KONSESI & PERIZINAN HULU (OVERLAY)
             ============================================================ */}
          <div
            className={`story-layer layer-concessions ${activeStep === 1 ? 'is-focused' : ''}`}
            style={{
              transform: `translateZ(${getLayerZ(1)}px)`,
            }}
            onClick={() => onStepChange?.(1)}
          >
            <div className="layer-glass-plane">
              <svg viewBox="0 0 500 400" className="layer-svg" aria-hidden="true">
                {/* Mining Concession IUP Polygons (Amber / Orange) */}
                <polygon
                  points="180,110 240,105 230,170 170,160"
                  fill="rgba(204, 96, 65, 0.45)"
                  stroke="#e26c48"
                  strokeWidth="1.8"
                  className="hazard-polygon"
                />
                <polygon
                  points="130,220 185,205 175,260 120,270"
                  fill="rgba(204, 96, 65, 0.4)"
                  stroke="#e26c48"
                  strokeWidth="1.5"
                />
                <polygon
                  points="250,90 310,85 295,145 240,140"
                  fill="rgba(204, 96, 65, 0.35)"
                  stroke="#e26c48"
                  strokeWidth="1.5"
                />

                {/* Palm Oil Concessions (Yellow / Gold) */}
                <polygon
                  points="230,165 300,160 280,220 220,215"
                  fill="rgba(178, 138, 34, 0.35)"
                  stroke="#d4a326"
                  strokeWidth="1.5"
                />
                <polygon
                  points="150,150 190,145 185,185 140,180"
                  fill="rgba(178, 138, 34, 0.3)"
                  stroke="#d4a326"
                  strokeWidth="1.2"
                />

                {/* Critical Overlap Zone Indicator (Striped warning border) */}
                <rect
                  x="180"
                  y="140"
                  width="70"
                  height="50"
                  rx="6"
                  fill="rgba(220, 53, 69, 0.18)"
                  stroke="#ff4d6d"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              </svg>

              <div className="layer-tag">
                <span className="layer-number">02</span>
                <span className="layer-name">Konsesi Tambang &amp; Sawit di Hulu</span>
              </div>

              {/* Callout Pins on Layer 2 */}
              <button
                type="button"
                className={`stage-pin pin-mine ${activePin === 'mine' ? 'is-open' : ''}`}
                style={{ top: '28%', left: '42%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePin(activePin === 'mine' ? null : 'mine');
                }}
              >
                <span className="pin-dot dot-mine" />
                <span className="pin-label">Klaster Konsesi Tambang Hulu</span>
                {activePin === 'mine' && (
                  <div className="pin-popup">
                    <strong>Izin Tambang Batubara Aktif</strong>
                    <p>Kawasan izin tambang di Kutai Kartanegara hulu yang memicu deforestasi 223 Ha/tahun dan limpasan sedimen deras.</p>
                  </div>
                )}
              </button>

              <div className="layer-stat-badge" style={{ top: '48%', right: '16%' }}>
                <strong>35,6% Grid Target</strong>
                <span>Grid prioritas dengan tumpang tindih izin yang tercatat</span>
              </div>
            </div>
          </div>

          {/* ============================================================
              LAYER 2: SIMPUL KRITIS GEOAI & BRIDGING NODES (SCREENING)
             ============================================================ */}
          <div
            className={`story-layer layer-bridges ${activeStep === 2 ? 'is-focused' : ''}`}
            style={{
              transform: `translateZ(${getLayerZ(2)}px)`,
            }}
            onClick={() => onStepChange?.(2)}
          >
            <div className="layer-glass-plane">
              <svg viewBox="0 0 500 400" className="layer-svg" aria-hidden="true">
                {/* Topological Network Graph Lines */}
                <line x1="200" y1="120" x2="210" y2="200" stroke="#41d4ac" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="210" y1="200" x2="280" y2="225" stroke="#41d4ac" strokeWidth="2.5" />
                <line x1="280" y1="110" x2="280" y2="225" stroke="#41d4ac" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="280" y1="225" x2="360" y2="245" stroke="#41d4ac" strokeWidth="3" />

                {/* Pulsating Critical Hydrological Nodes */}
                <circle cx="210" cy="200" r="16" fill="rgba(65, 212, 172, 0.2)" className="pulse-circle" />
                <circle cx="210" cy="200" r="7" fill="#41d4ac" stroke="#ffffff" strokeWidth="2" />

                <circle cx="280" cy="225" r="22" fill="rgba(65, 212, 172, 0.25)" className="pulse-circle-fast" />
                <circle cx="280" cy="225" r="9" fill="#138970" stroke="#ffffff" strokeWidth="2.5" />

                <circle cx="360" cy="245" r="14" fill="rgba(65, 212, 172, 0.2)" />
                <circle cx="360" cy="245" r="6" fill="#41d4ac" stroke="#ffffff" strokeWidth="2" />
              </svg>

              <div className="layer-tag">
                <span className="layer-number">03</span>
                <span className="layer-name">Deteksi GeoAI: Simpul Kritis Jaringan</span>
              </div>

              {/* Callout Pins on Layer 3 */}
              <button
                type="button"
                className={`stage-pin pin-node ${activePin === 'node' ? 'is-open' : ''}`}
                style={{ top: '50%', left: '54%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePin(activePin === 'node' ? null : 'node');
                }}
              >
                <span className="pin-dot dot-node" />
                <span className="pin-label">Simpul Lintas Batas (Bridge Node)</span>
                {activePin === 'node' && (
                  <div className="pin-popup">
                    <strong>Simpul Penghubung Antar-Wilayah</strong>
                    <p>Titik kritis tempat run-off dari kabupaten hulu bersatu masuk ke sistem sungai utama. Kerusakan di sini langsung melipatgandakan debit hilir.</p>
                  </div>
                )}
              </button>

              <div className="layer-stat-badge is-ai" style={{ top: '16%', left: '14%' }}>
                <strong>1.696 Grid Prioritas</strong>
                <span>Terdeteksi model screening berbasis ensemble learning</span>
              </div>
            </div>
          </div>

          {/* ============================================================
              LAYER 3: PEMUKIMAN HILIR & REKOMENDASI MULTI-PIHAK (IMPACT)
             ============================================================ */}
          <div
            className={`story-layer layer-impact ${activeStep === 3 ? 'is-focused' : ''}`}
            style={{
              transform: `translateZ(${getLayerZ(3)}px)`,
            }}
            onClick={() => onStepChange?.(3)}
          >
            <div className="layer-glass-plane">
              <svg viewBox="0 0 500 400" className="layer-svg" aria-hidden="true">
                {/* Downstream Flood Risk Inundation Footprints */}
                <ellipse cx="370" cy="245" rx="42" ry="24" fill="rgba(146, 47, 88, 0.4)" stroke="#e04e84" strokeWidth="1.8" />
                <ellipse cx="430" cy="275" rx="34" ry="20" fill="rgba(146, 47, 88, 0.35)" stroke="#e04e84" strokeWidth="1.5" />
                <ellipse cx="310" cy="270" rx="28" ry="18" fill="rgba(204, 96, 65, 0.3)" stroke="#cc6041" strokeWidth="1.2" />

                {/* Flood Impact Waves */}
                <path d="M 340,240 Q 370,230 400,240" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
                <path d="M 345,250 Q 370,242 395,250" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" />
              </svg>

              <div className="layer-tag">
                <span className="layer-number">04</span>
                <span className="layer-name">Dampak Hilir &amp; Tindakan Multi-Pihak</span>
              </div>

              {/* Callout Pins on Layer 4 */}
              <button
                type="button"
                className={`stage-pin pin-impact ${activePin === 'impact' ? 'is-open' : ''}`}
                style={{ top: '56%', left: '72%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePin(activePin === 'impact' ? null : 'impact');
                }}
              >
                <span className="pin-dot dot-impact" />
                <span className="pin-label">Pemukiman Hilir (Tenggarong - Samarinda)</span>
                {activePin === 'impact' && (
                  <div className="pin-popup">
                    <strong>Penerima Dampak Terbesar</strong>
                    <p>Ratusan ribu warga berisiko terendam saat hujan lebat bertemu kiriman air dari hulu yang terdegradasi.</p>
                  </div>
                )}
              </button>

              {/* Action Badges on Top Layer */}
              <div className="layer-action-badges" style={{ bottom: '16px', left: '16px' }}>
                <span className="stakeholder-pill pill-esdm">ESDM · Audit Kolam Sedimen</span>
                <span className="stakeholder-pill pill-bpbd">BPBD · Peringatan Dini Simpul</span>
                <span className="stakeholder-pill pill-dlh">DLH · Evaluasi Izin Lingkungan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Layer Legend Quick Switcher */}
      <div className="story-layer-legend">
        {[
          { index: 0, label: '01 Topografi & Sungai', color: '#32b5dc' },
          { index: 1, label: '02 Konsesi Hulu', color: '#e26c48' },
          { index: 2, label: '03 Simpul GeoAI', color: '#41d4ac' },
          { index: 3, label: '04 Dampak & Aksi', color: '#e04e84' },
        ].map((item) => (
          <button
            key={item.index}
            type="button"
            className={`layer-legend-item ${activeStep === item.index ? 'is-selected' : ''}`}
            onClick={() => onStepChange?.(item.index)}
          >
            <span className="legend-indicator" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
