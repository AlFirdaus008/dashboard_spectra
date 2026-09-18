import Hero from '@/components/overview/Hero';
import Background from '@/components/overview/Background';
import Goals from '@/components/overview/Goals';
import DataSources from '@/components/overview/DataSources';
import Bibliography from '@/components/overview/Bibliography';

export default function Page() {
  return (
    <>
      <Hero />
      <Background />
      <Goals />
      <DataSources />
      <Bibliography />
    </>
  );
}
