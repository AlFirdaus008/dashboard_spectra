import type { Metadata } from 'next';
import PipelineView from '@/components/pipeline/PipelineView';

export const metadata: Metadata = {
  title: 'Alur Proses',
  description: 'Perjalanan nyata proyek ini dari akuisisi data mentah hingga dashboard, tahap demi tahap.',
};

export default function PipelinePage() {
  return <PipelineView />;
}
