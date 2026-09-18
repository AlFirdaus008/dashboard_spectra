import type { Metadata } from 'next';
import StoryScrollytelling from '@/components/story/StoryScrollytelling';

export const metadata: Metadata = {
  title: 'Sorotan Kasus 3D',
  description: 'Visualisasi 3D layering interaktif: dari konsesi hulu ke dampak banjir di hilir DAS Mahakam.',
};

export default function StoryPage() {
  return <StoryScrollytelling />;
}
