import React from 'react';
import { Info } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase">
          DEMO DATA
        </span>
        <span>
          Aplikasi menampilkan data simulasi berita perguruan tinggi Sulawesi Utara. Data berita hasil crawling asli akan otomatis bertambah secara bertahap saat crawler aktif.
        </span>
      </div>
      <span className="hidden md:inline font-mono opacity-75">SULUT CAMPUS MONITOR v1.0.0</span>
    </div>
  );
};
