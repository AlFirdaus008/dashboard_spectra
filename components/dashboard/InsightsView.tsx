'use client';
import {useExplorer} from '@/components/dashboard/ExplorerProvider';
import Distribution from '@/components/charts/Distribution';
import BridgeHighlights from '@/components/charts/BridgeHighlights';

export default function InsightsView() {
  const {metadata, filters, setFilters, counts, filtered, setTier} = useExplorer();
  return (
    <>
      <Distribution counts={counts} onTier={setTier} active={filters.recommendation_level ?? ''} />
      <BridgeHighlights collection={filtered} filters={filters} onChange={setFilters} metadata={metadata} />
    </>
  );
}
