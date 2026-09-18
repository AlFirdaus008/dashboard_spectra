import type { Metadata, Viewport } from 'next';
import './globals.css';
import './project.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import ProjectShell from '@/components/dashboard/ProjectShell';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://127.0.0.1:3000');

const description = 'Screening spasial dan tindak lanjut teknis untuk wilayah DAS Mahakam.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SPECTRA',
    template: '%s · SPECTRA',
  },
  description,
  openGraph: {
    title: 'SPECTRA · Mahakam GeoAI Spatial Research',
    description,
    siteName: 'SPECTRA',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPECTRA · Mahakam GeoAI Spatial Research',
    description,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f6f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0b151a' },
  ],
};

const themeInitScript = `(function() {
  try {
    var stored = localStorage.getItem('mahakam_theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (!stored && prefersDark);
    var root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    }
  } catch (e) {}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <ProjectShell>{children}</ProjectShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
