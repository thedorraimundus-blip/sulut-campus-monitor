import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

interface SentimentChartProps {
  data: { name: string; value: number; color: string; count?: number }[];
  title?: string;
  subtitle?: string;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({
  data,
  title = "Distribusi Sentimen Berita",
  subtitle = "Klasifikasi polaritas berbasis Local Lexicon NLP"
}) => {
  const totalCount = data.reduce((acc, curr) => acc + (curr.count || curr.value), 0);

  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="h-52 w-full my-2 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700">
                      <p className="font-bold">{d.name}</p>
                      <p className="text-sky-400 font-mono mt-0.5">
                        {d.count || d.value} artikel ({d.value}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
            Total
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-slate-50 font-mono">
            {totalCount}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                {item.name}
              </span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 pl-4">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
