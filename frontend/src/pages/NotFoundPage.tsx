import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-2">
        Halaman Tidak Ditemukan
      </h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
        Halaman monitoring yang Anda cari tidak tersedia atau rute URL telah dipindahkan.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
