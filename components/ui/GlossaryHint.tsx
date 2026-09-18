'use client';
import { useState } from 'react';
import { useMountTransition } from '@/lib/hooks/useMountTransition';

export default function GlossaryHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const { shouldRender, isVisible } = useMountTransition(open, 150);
  return (
    <span className="glossary-hint">
      <button
        type="button"
        className="glossary-hint-btn"
        aria-label="Penjelasan istilah"
        aria-expanded={open}
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {shouldRender && (
        <span className={`glossary-hint-popup${isVisible ? ' is-visible' : ''}`} role="tooltip">
          {text}
        </span>
      )}
    </span>
  );
}
