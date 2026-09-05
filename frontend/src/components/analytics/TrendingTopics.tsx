import React from 'react';
import { TrendingUp, Hash } from 'lucide-react';

interface TrendingTopicsProps {
  topics: { text: string; value: number; trend?: string }[];
  onTopicClick?: (topic: string) => void;
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({
  topics,
  onTopicClick
}) => {
  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-500" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Topik & Kata Kunci Populer
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          7 Hari Terakhir
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() => onTopicClick && onTopicClick(topic.text)}
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 font-semibold">
              <Hash className="w-3 h-3 text-slate-400 group-hover:text-sky-500" />
              <span>{topic.text}</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="text-slate-600 dark:text-slate-300 font-bold">{topic.value}</span>
              {topic.trend && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {topic.trend}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
