import type { Metadata } from 'next';
import MethodologyTechnical from '@/components/methodology/MethodologyTechnical';

export const metadata: Metadata = {
  title: 'Metodologi Teknis',
  description: 'Referensi metode per topik: parameter yang dipakai dan rujukan ilmiahnya, terpisah dari cerita kronologis di Alur Proses.',
};

export default function MethodologyPage() {
  return <MethodologyTechnical />;
}
