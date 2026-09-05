import React from 'react';
import { ArrowRight, CheckCircle2, Cpu, Globe, Database, FileText, Search, Sparkles, ShieldCheck } from 'lucide-react';
import { AiPipelineNode } from '../../types';

interface AiPipelineProps {
  nodes?: AiPipelineNode[];
}

export const AiPipeline: React.FC<AiPipelineProps> = ({ nodes }) => {
  const defaultNodes = [
    {
      step: 1,
      name: "Media Scraper",
      type: "Ingestion",
      desc: "Polling RSS & HTML dari media lokal Sulut setiap 15 menit",
      status: "ACTIVE"
    },
    {
      step: 2,
      name: "HTML Cleaner & Boilerplate Stripper",
      type: "Preprocessing",
      desc: "Menghapus iklan, navigasi, dan script, menyisakan teks berita murni",
      status: "ACTIVE"
    },
    {
      step: 3,
      name: "Sastrawi Stemmer & Tokenizer",
      type: "NLP Foundation",
      desc: "Stemming kata dasar bahasa Indonesia dan eliminasi stop words",
      status: "ACTIVE"
    },
    {
      step: 4,
      name: "Campus Entity Detector",
      type: "NER & Alias Matching",
      desc: "Mencocokkan nama dan alias 15 PTN/PTS Sulut (UNSRAT, UNIMA, UNKLAB, dll)",
      status: "ACTIVE"
    },
    {
      step: 5,
      name: "Relevance Engine (0-100%)",
      type: "Binary Relevance Filter",
      desc: "Menyaring artikel dengan threshold minimal >= 45% skor relevansi kampus",
      status: "ACTIVE"
    },
    {
      step: 6,
      name: "MultinomialNB Classifier",
      type: "19-Category Classification",
      desc: "Model lokal v1.0.1 memetakan topik: Prestasi, Beasiswa, Rektor, dll",
      status: "ACTIVE"
    },
    {
      step: 7,
      name: "Indonesian Sentiment Analyzer",
      type: "Lexicon + Negation Rules",
      desc: "Skoring polaritas Positif, Netral, Negatif dengan bobot kata krisis",
      status: "ACTIVE"
    },
    {
      step: 8,
      name: "Extractive Summarizer",
      type: "TextRank Key Sentences",
      desc: "Mengekstraksi 2-3 kalimat inti sebagai ringkasan instan",
      status: "ACTIVE"
    },
    {
      step: 9,
      name: "SQLite & Live Alert Dispatch",
      type: "Storage & Notification",
      desc: "Penyimpanan data relasional dan trigger alert krisis realtime",
      status: "ACTIVE"
    }
  ];

  const pipeline = nodes && nodes.length > 0 ? nodes : defaultNodes;

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 dark:border-slate-800/80 mb-6">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-500" />
            <span>Local NLP Processing Pipeline</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arsitektur pemrosesan berita 100% offline tanpa ketergantungan API cloud
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Engine Active</span>
        </div>
      </div>

      {/* Grid of Pipeline Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pipeline.map((node: any, index: number) => (
          <div
            key={index}
            className="relative bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-sky-500/50 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {node.step || index + 1}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate">
                  {node.type || 'Engine Step'}
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {node.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {node.desc || node.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Siap & Aktif</span>
              </span>
              <span className="text-slate-400 font-mono">0.02s latency</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
