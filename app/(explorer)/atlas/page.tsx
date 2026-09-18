import AtlasView from '@/components/dashboard/AtlasView';
import InsightsView from '@/components/dashboard/InsightsView';
import MethodologySection from '@/components/dashboard/MethodologySection';

export default function Page() {
  return (
    <>
      <AtlasView />
      <InsightsView />
      <MethodologySection />
    </>
  );
}
