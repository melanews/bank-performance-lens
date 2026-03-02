import React, { useMemo } from 'react';
import { KPIEntry, downloadBackup, autoBackup, User } from '../lib/storage';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import { 
  TrendingUp, Users, CreditCard, Smartphone, ShieldCheck, QrCode, HardDrive, 
  Database, LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { TargetVsAchieved } from './TargetVsAchieved';
import { toast } from 'sonner';

interface DashboardProps {
  entries: KPIEntry[];
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ entries, user, onLogout }) => {
  const stats = useMemo(() => {
    const totals: Record<string, number> = {
      Deposit: 0,
      Account: 0,
      USSD: 0,
      IBMB: 0,
      'E-birr': 0,
      QR: 0,
      POS: 0,
    };

    entries.forEach(entry => {
      if (totals[entry.kpi] !== undefined) {
        totals[entry.kpi] += entry.achieved;
      }
    });

    return totals;
  }, [entries]);

  const chartData = Object.entries(stats).map(([name, value]) => ({ name, value }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const getIcon = (kpi: string) => {
    switch (kpi) {
      case 'Deposit': return <TrendingUp className="w-5 h-5" />;
      case 'Account': return <Users className="w-5 h-5" />;
      case 'USSD': return <Smartphone className="w-5 h-5" />;
      case 'IBMB': return <ShieldCheck className="w-5 h-5" />;
      case 'E-birr': return <CreditCard className="w-5 h-5" />;
      case 'QR': return <QrCode className="w-5 h-5" />;
      case 'POS': return <HardDrive className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const handleManualBackup = () => {
    autoBackup(user.id);
    downloadBackup(user.id);
    toast.success('Backup generated and downloaded successfully!');
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Welcome, {user.name}!</h2>
          <p className="text-slate-500 font-medium">Track your daily performance and achievements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleManualBackup}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
          >
            <Database className="w-4 h-4" />
            Backup Data
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        {Object.entries(stats).map(([kpi, value], idx) => (
          <motion.div 
            key={kpi}
            variants={itemVariants}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2 hover:shadow-md transition-shadow group"
          >
            <div 
              className="p-3 rounded-2xl transition-all group-hover:scale-110"
              style={{ backgroundColor: `${COLORS[idx]}15`, color: COLORS[idx] }}
            >
              {getIcon(kpi)}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi}</p>
            <p className="text-lg font-black text-slate-900">{value.toLocaleString()}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Target Section */}
      <TargetVsAchieved entries={entries} userId={user.id} />

      {/* Trend Chart */}
      <PerformanceTrendChart entries={entries} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Total Distribution
            </h3>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Bar View</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                  width={40}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Product Mix
            </h3>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Pie View</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="transparent"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Legend 
                  layout="horizontal" 
                  align="center" 
                  verticalAlign="bottom" 
                  iconType="circle" 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};