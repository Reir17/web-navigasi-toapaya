'use client';

import dynamic from 'next/dynamic';
import { UMKM } from '@/data/umkm';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-emerald-400 gap-3">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold tracking-wide text-slate-300">
        Memuat Peta Navigasi Toapaya...
      </p>
    </div>
  ),
});

interface InteractiveMapProps {
  data: UMKM[];
  selectedUMKM: UMKM | null;
  onSelectUMKM: (umkm: UMKM) => void;
}

export default function InteractiveMap(props: InteractiveMapProps) {
  return <Map {...props} />;
}