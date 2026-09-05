import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface CoverageChartProps {
  data: { name: string; full_name?: string; count: number }[];
  title?: string;
  subtitle?: string;
}

const COLORS = ['#0ea5e9', '#38bdf8', '#0284c7', '#0369a1', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'];

export const CoverageChart: React.FC<CoverageChartProps> = ({
  data,
  title = "Share of Voice Perguruan Tinggi",
  subtitle = "Distribusi frekuensi pemberitaan kampus di media Sulut"
}) => {
  return (
    <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700">
                      <p className="font-bold">{d.full_name || d.name}</p>
                      <p className="text-sky-400 font-mono mt-1">{d.count} artikel dipublikasi</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
