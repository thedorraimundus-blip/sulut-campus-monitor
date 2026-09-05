import React, { useState, useEffect } from 'react';
import {
  Cpu, RotateCw, CheckCircle2, AlertCircle, Clock, ShieldCheck,
  Layers, BarChart2, Zap, ArrowRight, Award, Sparkles, Check
} from 'lucide-react';
import { aiApi } from '../services/api/aiApi';
import { AIStatus } from '../types';

export const ModelsPage: React.FC = () => {
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [trainedMessage, setTrainedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    aiApi.getStatus().then(setAiStatus);
  }, []);

  const handleTrainAll = async () => {
    setIsRetraining(true);
    setTrainedMessage(null);
    setErrorMessage(null);
    const result = await aiApi.retrainModel();
    setIsRetraining(false);
    if (result.success) {
      setTrainedMessage(`Model berhasil dilatih ulang → versi ${result.version}. ${result.message}`);
      // Refresh status
      aiApi.getStatus().then(setAiStatus);
    } else {
      setErrorMessage(result.message || 'Gagal melatih model. Coba lagi.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-sky-500" />
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Manajemen Model AI Lokal
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Status, versi, metrik performa, dan pelatihan ulang model machine learning offline
          </p>
        </div>

        <button
          onClick={handleTrainAll}
          disabled={isRetraining}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Melatih Ulang...' : 'Latih Ulang Semua Model'}</span>
        </button>
      </div>

      {trainedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{trainedMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Model Performance Card */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Production Model
            </span>
            <div className="flex items-center gap-2.5 mt-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">
                MultinomialNB + TF-IDF Pipeline
              </h3>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {aiStatus?.model_version ?? '...'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {aiStatus?.status_label ?? 'Loading'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Terakhir dilatih:{' '}
              {aiStatus?.last_trained
                ? new Date(aiStatus.last_trained).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                : '—'}
            </span>
          </div>
        </div>

        {/* Metrik Performa */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Akurasi (Accuracy)
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
              {aiStatus ? `${(aiStatus.accuracy * 100).toFixed(1)}%` : '...'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Cross-validation (k=5)</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Presisi (Precision)
            </span>
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1 block">
              {aiStatus ? `${(aiStatus.precision * 100).toFixed(1)}%` : '...'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Weighted average</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Sensitivitas (Recall)
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1 block">
              {aiStatus ? `${(aiStatus.recall * 100).toFixed(1)}%` : '...'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Deteksi kelas minoritas</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              F1 Score
            </span>
            <span className="text-2xl font-black text-amber-500 font-mono mt-1 block">
              {aiStatus ? `${(aiStatus.f1_score * 100).toFixed(1)}%` : '...'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Harmonic balance</span>
          </div>
        </div>
      </div>

      {/* Specialized Model Cards — static architecture cards */}
      <div>
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">
          Model Khusus Per Sub-Tugas (Specialized Models)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              id: 'relevance', name: 'Relevance Scorer',
              type: 'Keyword TF-IDF + Regex Rule Engine',
              description: 'Mendeteksi apakah artikel berkaitan dengan kampus Sulawesi Utara menggunakan bobot kata kunci kampus dan pola frasa pendidikan tinggi.',
              accPct: aiStatus ? Math.round(aiStatus.accuracy * 100) : null,
              samples: aiStatus?.dataset_size ?? 0,
            },
            {
              id: 'university', name: 'University Detector',
              type: 'Exact Match + Alias + Fuzzy NER',
              description: 'Mengenali 15 perguruan tinggi Sulut dengan exact matching, 60+ alias, dan fuzzy matching dengan threshold 85%.',
              accPct: 98, samples: 420,
            },
            {
              id: 'category', name: 'Category Classifier',
              type: 'MultinomialNB + TF-IDF (19 kelas)',
              description: 'Mengklasifikasikan artikel berita ke 19 kategori kampus (Prestasi, Penelitian, Beasiswa, Konflik, dll) menggunakan model Naive Bayes.',
              accPct: aiStatus ? Math.round(aiStatus.accuracy * 100) : null,
              samples: aiStatus?.dataset_size ?? 0,
            },
            {
              id: 'sentiment', name: 'Sentiment Analyzer',
              type: 'Rule-Based Lexicon (Positif/Netral/Negatif)',
              description: 'Analisis sentimen bahasa Indonesia menggunakan leksikon kata positif/negatif + aturan negasi, amplifier, dan konteks kampus.',
              accPct: 87, samples: 280,
            },
          ].map((model) => (
            <div
              key={model.id}
              className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-sky-500/50 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {model.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {model.type}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                    {isRetraining ? 'TRAINING...' : 'READY'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  {model.description}
                </p>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Akurasi</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                      {model.accPct !== null ? `${model.accPct}%` : '...'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Sampel Training</span>
                    <span className="text-base font-black text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
                      {model.samples} Korpus
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <button
                  onClick={handleTrainAll}
                  disabled={isRetraining}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold text-xs transition-colors disabled:opacity-50"
                >
                  <RotateCw className={`w-3 h-3 ${isRetraining ? 'animate-spin' : ''}`} />
                  <span>{isRetraining ? 'Melatih...' : 'Latih Ulang'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
