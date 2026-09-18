'use client';
import {useExplorer} from '@/components/dashboard/ExplorerProvider';
import MethodologyInfo from '@/components/scientific/MethodologyInfo';

export default function MethodologySection() {
  const {metadata} = useExplorer();
  return (
    <div id="methodology">
      <MethodologyInfo metadata={metadata} />
    </div>
  );
}
