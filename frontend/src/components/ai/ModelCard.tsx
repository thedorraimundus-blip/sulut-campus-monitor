import React from 'react';
import { Cpu, CheckCircle2, RotateCw, BarChart2, ShieldCheck, Database } from 'lucide-react';
import { AiModel } from '../../types';
import { Badge } from '../ui/Badge';

interface ModelCardProps {
  model: AiModel;
  onRetrain?: (modelId: string) => void;
  isRetraining?: boolean;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onRetrain,
  isRetraining = false
}) => {
  const accuracyPct = Math.round((model.accuracy || 0.94) * 100);

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-sky-500/50 transition-all">
      <div>
        {/* Header: Model title & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {model.name}
                </h3>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {model.version}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {model.type}
              </p>
            </div>
          </div>

          <Badge variant="success" size="sm">
            {model.status}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {model.description}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 uppercase font-bold block">
              Akurasi Pengujian
            </span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {accuracyPct}%
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 uppercase font-bold block">
              Sampel Training
            </span>
            <span className="text-base font-black text-slate-800 dark:text-slate-200 font-mono">
              {model.samples} Data
            </span>
          </div>
        </div>
      </div>

      {/* Footer Details & Retrain Button */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local Engine</span>
        </div>

        {onRetrain && (
          <button
            onClick={() => onRetrain(model.id)}
            disabled={isRetraining}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isRetraining
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin text-sky-500' : ''}`} />
            <span>{isRetraining ? 'Melatih...' : 'Latih Ulang'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
