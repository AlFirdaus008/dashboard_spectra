import React, { useState, useEffect, type ReactNode } from 'react';
import {
  IconMap,
  IconSearch,
  IconBuilding,
  IconInfo,
  IconClose,
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
} from '@/components/ui/Icons';
import { useMountTransition } from '@/lib/hooks/useMountTransition';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStepAction?: (step: number) => void;
}

const STORAGE_KEY = 'mahakam_atlas_onboarding_dismissed';

export function hasDismissedOnboarding(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDismissedOnboarding(dismissed: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, dismissed ? 'true' : 'false');
  } catch {
    // Ignore storage errors in private browsing
  }
}

interface StepItem {
  num: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  desc: string;
  tip: string;
}

export default function OnboardingGuide({ isOpen, onClose, onSelectStepAction }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const { shouldRender, isVisible } = useMountTransition(isOpen, 200);
  if (!shouldRender) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      setDismissedOnboarding(true);
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < 3) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onSelectStepAction?.(next);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onSelectStepAction?.(prev);
    }
  };

  const steps: StepItem[] = [
    {
      num: 1,
      badge: 'Langkah 1 dari 3',
      title: 'Pilih Wilayah Anda di Peta',
      subtitle: 'Filter Cepat Yurisdiksi Daerah',
      icon: <IconMap size={14} />,
      desc: 'Klik tombol pilihan kabupaten di bagian atas (misalnya Kutai Kartanegara, Kutai Barat, atau Kota Samarinda) untuk langsung memfokuskan amatan spasial ke wilayah kerja yurisdiksi Anda.',
      tip: 'Gunakan opsi "Seluruh DAS Mahakam" kapan saja untuk mengembalikan peta ke cakupan satu kesatuan DAS.',
    },
    {
      num: 2,
      badge: 'Langkah 2 dari 3',
      title: 'Klik Kotak Grid Berwarna',
      subtitle: 'Eksplorasi Evidence Spasial & Risiko',
      icon: <IconSearch size={14} />,
      desc: 'Klik sel grid berwarna pada peta untuk meneliti data ilmiah: tingkat kerentanan banjir retrospektif, persentase tumpang tindih konsesi tambang/sawit hulu, dan jalur simpul konektivitas hidrologi.',
      tip: 'Warna grid merefleksikan tingkatan prioritas screening (R1 hingga R5) yang telah terverifikasi secara kanonis.',
    },
    {
      num: 3,
      badge: 'Langkah 3 dari 3',
      title: 'Lihat Instansi yang Berwenang',
      subtitle: 'Aksi Nyata & Siap Rapat Koordinasi',
      icon: <IconBuilding size={14} />,
      desc: 'Periksa panel samping kanan untuk meninjau Matriks Aksi Instansi (Dinas ESDM, DLH, BPBD, Bappeda). Anda dapat mencetak Lembar Ringkasan Kebijakan satu halaman resmi untuk bahan rapat lintas dinas.',
      tip: 'Manfaatkan juga tombol "Komparasi 2 Titik" di toolbar untuk menganalisis kontras langsung antara grid hulu dan hilir.',
    },
  ];

  const activeStep = steps[currentStep - 1];

  return (
    <div
      className={`onboarding-overlay${isVisible ? ' is-visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="onboarding-backdrop" onClick={handleClose} />
      <div className="onboarding-card">
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-step-badge">
            <span className="onboarding-step-icon">{activeStep.icon}</span>
            <span>{activeStep.badge}</span>
          </div>
          <button
            type="button"
            className="btn-close-onboarding"
            onClick={handleClose}
            aria-label="Tutup panduan"
          >
            <IconClose size={13} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="onboarding-progress-track">
          <div
            className="onboarding-progress-fill"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="onboarding-body">
          <span className="onboarding-subtitle">{activeStep.subtitle}</span>
          <h3 id="onboarding-title" className="onboarding-title">
            {activeStep.title}
          </h3>
          <p className="onboarding-desc">{activeStep.desc}</p>
          <div className="onboarding-tip-box">
            <span className="tip-bullet">
              <IconInfo size={14} />
            </span>
            <p className="tip-text">{activeStep.tip}</p>
          </div>
        </div>

        {/* Footer & Controls */}
        <div className="onboarding-footer">
          <label className="onboarding-checkbox-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
            />
            <span>Jangan tampilkan lagi otomatis</span>
          </label>

          <div className="onboarding-nav-buttons">
            <div className="onboarding-step-dots">
              {steps.map(s => (
                <button
                  key={s.num}
                  type="button"
                  className={`step-dot ${currentStep === s.num ? 'is-active' : ''}`}
                  onClick={() => setCurrentStep(s.num)}
                  aria-label={`Buka langkah ${s.num}`}
                />
              ))}
            </div>

            {currentStep > 1 && (
              <button
                type="button"
                className="btn-onboarding-secondary btn-onboarding-arrow"
                onClick={handlePrev}
                aria-label="Kembali"
                title="Kembali"
              >
                <IconChevronLeft size={16} />
              </button>
            )}

            <button
              type="button"
              className={`btn-onboarding-primary${currentStep < 3 ? ' btn-onboarding-arrow' : ''}`}
              onClick={handleNext}
              aria-label={currentStep === 3 ? 'Mulai Eksplorasi' : 'Lanjut'}
              title={currentStep === 3 ? 'Mulai Eksplorasi' : 'Lanjut'}
            >
              {currentStep === 3 ? (
                <>
                  <span>Mulai Eksplorasi</span>
                  <IconCheck size={14} />
                </>
              ) : (
                <IconChevronRight size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
