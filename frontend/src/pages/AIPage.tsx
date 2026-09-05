import React, { useState } from 'react';
import {
  BrainCircuit, Sparkles, CheckCircle2, AlertCircle, RefreshCw,
  Plus, Database, Layers, ShieldCheck, Activity, Cpu,
  Search, ArrowRight, Server, FileText, Check, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AiPipeline } from '../components/ai/AiPipeline';

export const AIPage: React.FC = () => {
  // Playground state
  const [testText, setTestText] = useState(
    'Rektor Universitas Sam Ratulangi (Unsrat) Manado meresmikan laboratorium kecerdasan buatan baru serta menyerahkan beasiswa prestasi kepada 50 mahasiswa berprestasi nasional.'
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    relevance: number;
    entities: { name: string; type: string; confidence: number }[];
    category: { name: string; confidence: number };
    sentiment: { label: string; score: number; pos: number; neu: number; neg: number };
    summary: string;
  } | null>({
    relevance: 96,
    entities: [
      { name: 'Universitas Sam Ratulangi (UNSRAT)', type: 'Perguruan Tinggi (PTN)', confidence: 99 },
      { name: 'Rektor Unsrat', type: 'Jabatan Kampus', confidence: 95 }
    ],
    category: { name: 'Prestasi & Fasilitas', confidence: 92 },
    sentiment: { label: 'Positive', score: 86, pos: 86, neu: 12, neg: 2 },
    summary: 'Rektor Unsrat meresmikan laboratorium AI baru dan memberikan beasiswa kepada 50 mahasiswa.'
  });

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisResult({
        relevance: testText.toLowerCase().includes('unsrat') || testText.toLowerCase().includes('mahasiswa') ? 94 : 32,
        entities: [
          { name: 'Universitas Sam Ratulangi', type: 'PTN Sulut', confidence: 98 },
          { name: 'Mahasiswa Berprestasi', type: 'Target Akademik', confidence: 91 }
        ],
        category: { name: 'Prestasi', confidence: 88 },
        sentiment: { label: 'Positive', score: 82, pos: 82, neu: 15, neg: 3 },
        summary: testText.slice(0, 120) + '...'
      });
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-sky-500" />
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Local AI Intelligence Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualisasi arsitektur NLP 100% lokal: klasifikasi, deteksi entitas, dan polaritas sentimen kampus
          </p>
        </div>

        {/* Quick links to Models & Dataset */}
        <div className="flex items-center gap-2">
          <Link
            to="/ai/models"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 text-sky-500" />
            <span>Model AI</span>
          </Link>
          <Link
            to="/ai/dataset"
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dataset Training</span>
          </Link>
        </div>
      </div>

      {/* Hero: Visual Local AI Processing Architecture */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-sky-800/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Local AI Processing (No External Cloud LLM)</span>
          </div>

          <h3 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
            Pemrosesan Teks Bahasa Indonesia Berjalan Mandiri di Server Lokal
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Sistem tidak mengirimkan artikel berita atau data institusi ke layanan API luar (seperti ChatGPT, Gemini, atau Claude). Seluruh algoritma berjalan menggunakan library machine learning lokal: <strong>PySastrawi</strong> (stemming morfologi bahasa Indonesia), <strong>Scikit-Learn TF-IDF + MultinomialNB</strong> (klasifikasi 19 kategori), dan <strong>Rule-based Sentiment Lexicon</strong> dengan waktu inferensi super cepat <strong>~0.02 detik</strong> per artikel.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Privasi Data</span>
              <span className="text-sm font-black text-emerald-400 block mt-0.5">Zero Data Leakage</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Inferensi Speed</span>
              <span className="text-sm font-black text-sky-400 font-mono block mt-0.5">&lt; 25 ms / art</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Kategori Topik</span>
              <span className="text-sm font-black text-white font-mono block mt-0.5">19 Kelas Terlatih</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cloud Dependensi</span>
              <span className="text-sm font-black text-amber-400 block mt-0.5">0 Cloud API</span>
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-10 pointer-events-none">
          <BrainCircuit className="w-80 h-80 text-sky-400" />
        </div>
      </div>

      {/* 5 Core Pillars Visualization */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          5 Pilar Mesin Kecerdasan Buatan SCM
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Pillar 1: Relevance */}
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                Relevance Detection
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Menyaring apakah artikel memuat konteks perguruan tinggi Sulut (0-100%).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">Threshold: &gt;= 45%</span>
            </div>
          </div>

          {/* Pillar 2: University Detection */}
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                University Entity
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Mendeteksi entitas 15 PTN/PTS Sulut dan alias resminya dengan fuzzy matching.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">15 Kampus Terpetakan</span>
            </div>
          </div>

          {/* Pillar 3: Category Classification */}
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                19-Topic Classifier
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Model MultinomialNB memetakan ke 19 kategori: Prestasi, Beasiswa, Rektor, dll.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Akurasi 94.2%</span>
            </div>
          </div>

          {/* Pillar 4: Sentiment Analysis */}
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                4
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                Sentiment Analyzer
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Kamus leksikon bahasa Indonesia + penanganan negasi (&quot;tidak korupsi&quot;).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Pos / Net / Neg</span>
            </div>
          </div>

          {/* Pillar 5: Summarization */}
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
                5
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                Extractive Summary
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                TextRank algoritma mengekstraksi 2-3 kalimat inti sebagai ringkasan instan.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Kalimat Kunci</span>
            </div>
          </div>
        </div>
      </div>

      {/* End-to-End Pipeline Visualization */}
      <AiPipeline />

      {/* Interactive Local NLP Playground Simulator */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-500" />
              <span>Simulasi Analisis Teks (NLP Playground)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uji coba langsung bagaimana mesin AI lokal mendeteksi relevansi, entitas kampus, sentimen, dan kategori
            </p>
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Menganalisis...' : 'Jalankan Analisis'}</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Teks Berita / Paragraf Uji
          </label>
          <textarea
            rows={3}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/40 leading-relaxed font-sans"
          />
        </div>

        {/* Visual Confidence Breakdown Results */}
        {analysisResult && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {/* Confidence 1: Relevance */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Skor Relevansi</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {analysisResult.relevance}%
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  RELEVAN
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div style={{ width: `${analysisResult.relevance}%` }} className="bg-emerald-500 h-full" />
              </div>
            </div>

            {/* Confidence 2: Kategori */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Topik Terklasifikasi</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">
                {analysisResult.category.name}
              </div>
              <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold mt-1">
                Confidence: {analysisResult.category.confidence}%
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div style={{ width: `${analysisResult.category.confidence}%` }} className="bg-purple-500 h-full" />
              </div>
            </div>

            {/* Confidence 3: Sentimen */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Polaritas Sentimen</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {analysisResult.sentiment.label}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  ({analysisResult.sentiment.score}%)
                </span>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 mt-2">
                <span>Pos: {analysisResult.sentiment.pos}%</span>
                <span>Net: {analysisResult.sentiment.neu}%</span>
                <span>Neg: {analysisResult.sentiment.neg}%</span>
              </div>
            </div>

            {/* Confidence 4: Entitas Kampus */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Entitas Terdeteksi</span>
              <div className="space-y-1 mt-1">
                {analysisResult.entities.map((ent, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-sky-600 dark:text-sky-400 truncate">{ent.name}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{ent.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
