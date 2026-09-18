'use client';
import { useId } from 'react';

export default function BrandMark({ className }: { className?: string }) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="4" y1="7" x2="35" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#eafff5" />
          <stop offset="1" stopColor="#36d6b0" />
        </linearGradient>
      </defs>
      <path
        d="M11 9 C14 13 17 16 20 20"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M7 31 C12 25 15 23 20 20 C25 17 28 15 33 9"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="7" cy="31" r="2.4" fill="#eafff5" />
      <circle cx="20" cy="20" r="3.4" fill="#eafff5" />
      <circle cx="33" cy="9" r="2.4" fill="#eafff5" />
    </svg>
  );
}
