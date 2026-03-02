import React, { useState, useEffect, useMemo } from 'react';
import { KPIEntry, Target, getTargets, saveTarget } from '../lib/storage';
import { Target as TargetIcon, Plus, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface TargetVsAchievedProps {
  entries: KPIEntry[];
  userId: string;
}

const PRODUCTS = ["Deposit", "Account", "USSD", "IBMB", "E-birr", "QR", "POS"];

export const TargetVsAchieved: React.FC<TargetVsAchievedProps> = ({ entries, userId }) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showForm, setShowForm] = useState(false);
  const [newKpi, setNewKpi] = useState(PRODUCTS[0]);
  const [newTarget, setNewTarget] = useState('');
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTargets = async () => {
    const data = await getTargets(userId);
    setTargets(data);
  };

  useEffect(() => {
    fetchTargets();
  }, [userId]);

  const currentMonthData = useMemo(() => {
    const monthTargets = targets.filter(t => t.month === selectedMonth);
    
    return PRODUCTS.map(kpi => {
      const target = monthTargets.find(t => t.kpi === kpi);
      const achieved = entries
        .filter(e => e.kpi === kpi && e.date.startsWith(selectedMonth))
        .reduce((sum, e) => sum + e.achieved, 0);
      
      const percentage = target && target.target_value > 0 
        ? Math.min((achieved / target.target_value) * 100, 100)
        : 0;

      return {
        kpi,
        target: target?.target_value || 0,
        achieved,
        percentage
      };
    }).filter(d => d.target > 0 || d.achieved > 0);
  }, [entries, targets, selectedMonth]);

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget || isNaN(Number(newTarget))) return;

    setLoading(true);
    const result = await saveTarget({
      kpi: newKpi,
      month: selectedMonth,
      target_value: parseFloat(newTarget),
      user_id: userId
    });

    if (result) {
      toast.success('Target saved successfully');
      setNewTarget('');
      setShowForm(false);
      fetchTargets();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <TargetIcon className="w-6 h-6 text-emerald-600" />
            Target vs Achieved
          </h3>
          <p className="text-sm text-slate-500">Monthly goal tracking and progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold bg-white"
          />
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-50 p-6 rounded-2xl border border-slate-200 overflow-hidden"
        >
          <form onSubmit={handleSaveTarget} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Product</label>
              <select 
                value={newKpi}
                onChange={(e) => setNewKpi(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              >
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Monthly Target</label>
              <input 
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="Enter target amount"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Set Target
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentMonthData.map((data, idx) => (
          <motion.div 
            key={data.kpi}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-900">{data.kpi}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Goal</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${data.percentage >= 100 ? 'text-emerald-600' : 'text-orange-500'}`}>
                  {data.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Target: {data.target.toLocaleString()}</span>
                <span className="text-slate-900 font-bold">{data.achieved.toLocaleString()} achieved</span>
              </div>
              
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.percentage}%` }}
                  className={`h-full rounded-full ${data.percentage >= 100 ? 'bg-emerald-500' : 'bg-orange-400'}`}
                />
              </div>

              {data.percentage >= 100 && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 p-1.5 rounded-lg justify-center">
                  <CheckCircle2 className="w-3 h-3" />
                  TARGET ACHIEVED
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {currentMonthData.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
             <p className="font-medium">No targets set for {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}</p>
             <p className="text-xs mt-1">Click the plus button to add your first goal</p>
          </div>
        )}
      </div>
    </div>
  );
};