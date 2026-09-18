import { ImageResponse } from 'next/og';

export const alt = 'SPECTRA, Mahakam GeoAI Spatial Research';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '84px',
          background: '#0b151a',
          backgroundImage:
            'radial-gradient(circle at 82% 18%, rgba(19,137,112,0.35), transparent 55%), radial-gradient(circle at 8% 92%, rgba(54,214,176,0.18), transparent 50%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginBottom: 36 }}>
          <div
            style={{
              width: 108,
              height: 116,
              borderRadius: 26,
              background: '#138970',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(19,137,112,0.4)',
            }}
          >
            <svg width="72" height="72" viewBox="0 0 40 40">
              <defs>
                <linearGradient id="g" x1="4" y1="7" x2="35" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#eafff5" />
                  <stop offset="1" stopColor="#36d6b0" />
                </linearGradient>
              </defs>
              <path d="M11 9 C14 13 17 16 20 20" stroke="url(#g)" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity={0.8} />
              <path d="M7 31 C12 25 15 23 20 20 C25 17 28 15 33 9" stroke="url(#g)" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              <circle cx="7" cy="31" r="2.6" fill="#eafff5" />
              <circle cx="20" cy="20" r="3.6" fill="#eafff5" />
              <circle cx="33" cy="9" r="2.6" fill="#eafff5" />
            </svg>
          </div>
          <span style={{ fontSize: 84, fontWeight: 700, color: '#f3fbf9', letterSpacing: -2 }}>SPECTRA</span>
        </div>
        <span style={{ fontSize: 32, color: '#6bb9a4', fontWeight: 600, letterSpacing: 1 }}>
          Mahakam GeoAI Spatial Research
        </span>
        <span style={{ display: 'flex', fontSize: 24, color: '#8fb3a8', marginTop: 26, maxWidth: 860 }}>
          Screening spasial dan tindak lanjut teknis untuk wilayah DAS Mahakam.
        </span>
      </div>
    ),
    { ...size }
  );
}
