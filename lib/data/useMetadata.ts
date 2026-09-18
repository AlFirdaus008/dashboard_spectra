'use client';
import {useEffect, useState} from 'react';
import type {Metadata} from '@/types/data';
import {loadMetadata} from '@/lib/data/client';

export function useMetadata() {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    loadMetadata()
      .then(m => { if (!cancelled) setMetadata(m); })
      .catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);
  return {metadata, error, loading: !metadata && !error};
}
