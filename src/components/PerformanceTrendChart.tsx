import React from 'react';
import { KPIEntry } from '../lib/storage';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO, subDays } from 'date-fns';

interface PerformanceTrendChartProps {
  entries: KPIEntry[];
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ entries }) => {
  const trendData = React.useMemo(() => {
    // Last 14 days
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      return format(date, 'yyyy-MM-dd');
    });

    const kpis = Array.from(new Set(entries.map(e => e.kpi)));

    return last14Days.map(date => {
      const dayData: any = { date: format(parseISO(date), 'MMM dd') };
      kpis.forEach(kpi => {
        const achieved = entries
          .filter(e => e.date === date && e.kpi === kpi)
          .reduce((sum, e) => sum + e.achieved, 0);
        dayData[kpi] = achieved;
      });
      return dayData;
    });
  }, [entries]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  const kpis = Array.from(new Set(entries.map(e => e.kpi)));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Daily Performance Trends
        </h3>
        <div className="flex gap-2">
           <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase font-bold tracking-wider">Last 14 Days</span>
        </div>
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} 
              width={40}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
            {kpis.map((kpi, idx) => (
              <Line 
                key={kpi}
                type="monotone" 
                dataKey={kpi} 
                stroke={COLORS[idx % COLORS.length]} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};