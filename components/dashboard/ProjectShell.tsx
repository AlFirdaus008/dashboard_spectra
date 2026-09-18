'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/theme/ThemeToggle';
import BrandMark from '@/components/ui/BrandMark';

const SIDEBAR_STORAGE_KEY = 'mahakam_sidebar_collapsed';

const navigation = [
  { href: '/', label: 'Ringkasan Proyek', icon: 'overview' },
  { href: '/story', label: 'Sorotan Kasus 3D', icon: 'layers', badge: '3D' },
  { href: '/atlas', label: 'Eksplorasi Spasial', icon: 'map' },
  { href: '/pipeline', label: 'Alur Proses', icon: 'flow' },
  { href: '/methodology', label: 'Metodologi Teknis', icon: 'book' },
] as const;

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === 'map' ? (
        <>
          <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z" />
          <path d="M9 3v16M15 5v16" />
        </>
      ) : name === 'layers' ? (
        <>
          <path d="m12 2 10 5-10 5-10-5Z" />
          <path d="m2 12 10 5 10-5" />
          <path d="m2 17 10 5 10-5" />
        </>
      ) : name === 'chart' ? (
        <>
          <path d="M4 3v17h17M9 15V9M14 15V5M19 15v-4" />
        </>
      ) : name === 'science' ? (
        <>
          <path d="m12 3 8 4v6c0 4-8 8-8 8s-8-4-8-8V7Z" />
          <path d="m8 12 3 3 5-6" />
        </>
      ) : name === 'flow' ? (
        <>
          <circle cx="5" cy="6" r="2.3" />
          <circle cx="12" cy="12" r="2.3" />
          <circle cx="19" cy="18" r="2.3" />
          <path d="m7 7.3 3 3M14 14.3l3 3" />
        </>
      ) : name === 'data' ? (
        <>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v7c0 4 16 4 16 0V5M4 12v7c0 4 16 4 16 0v-7" />
        </>
      ) : name === 'book' ? (
        <>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        </>
      ) : (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      )}
    </svg>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {collapsed ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
    </svg>
  );
}

export default function ProjectShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1');
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(next => {
      const value = !next;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, value ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      return value;
    });
  };

  return (
    <div className={collapsed ? 'project-shell sidebar-collapsed' : 'project-shell'}>
      <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
      <aside className="project-sidebar" aria-label="Navigasi proyek">
        <Link className="project-brand" href="/">
          <span className="project-logo">
            <BrandMark />
          </span>
          <span>SPECTRA</span>
        </Link>
        <div className="nav-caption">RUANG KERJA</div>
        <nav>
          {navigation.map(n => (
            <Link
              key={n.href}
              href={n.href}
              aria-label={n.label}
              title={n.label}
              aria-current={pathname === n.href ? 'location' : undefined}
            >
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {'badge' in n && n.badge && <span className="nav-badge">{n.badge}</span>}
              {pathname === n.href && <span className="nav-indicator" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <Icon name="science" />
          <strong>Dukungan Keputusan Geospasial</strong>
          <p>Platform analitik terpadu tata kelola perizinan, dinamika hidrologi, dan mitigasi banjir hulu–hilir DAS Mahakam.</p>
          <span>BRINATHON 2026 · TATA KELOLA LINGKUNGAN</span>
        </div>
        <div className="sidebar-actions">
          <ThemeToggle className="sidebar-theme-toggle" />
          <Link className="sidebar-bottom" href="/atlas#methodology">Batasan Ilmiah <span>↗</span></Link>
        </div>
      </aside>
      <div className="project-content">
        <div className="project-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-collapse-toggle"
              onClick={toggleCollapsed}
              aria-pressed={collapsed}
              aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
              title={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
            >
              <CollapseIcon collapsed={collapsed} />
            </button>
            <span>Ruang kerja riset <span className="topbar-slash">/</span> <strong>DAS Mahakam</strong></span>
          </div>
          <div className="topbar-actions">
            <ThemeToggle className="topbar-theme-toggle" />
            <Link href="/atlas#methodology" className="topbar-link">
              <span className="status-dot" />
              <span>Screening Ilmiah</span> <span>↗</span>
            </Link>
          </div>
        </div>
        <main id="main-content">
          {children}
        </main>
        <footer>
          <Link className="footer-brand" href="/">SPECTRA</Link>
          <span>BRINATHON · Dukungan Keputusan Riset</span>
          <Link href="/atlas#methodology">Batasan Ilmiah ↗</Link>
        </footer>
      </div>
    </div>
  );
}
