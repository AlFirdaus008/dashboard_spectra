import type {ReactNode} from 'react';
import ExplorerProvider from '@/components/dashboard/ExplorerProvider';

export default function ExplorerLayout({children}: {children: ReactNode}) {
  return <ExplorerProvider>{children}</ExplorerProvider>;
}
