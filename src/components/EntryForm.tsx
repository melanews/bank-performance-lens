import React, { useState } from 'react';
import { KPIEntry } from '../lib/storage';
import { Calendar, Layers, Hash, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface EntryFormProps {
  onAdd: (entry: Omit<KPIEntry, 'id' | 'created_at' | 'user_id'>) => void;
}

const PRODUCTS = ["Deposit", "Account", "USSD", "IBMB", "E-birr", "QR", "POS"];

export const EntryForm: React.FC<EntryFormProps> = ({ onAdd }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [kpi, setKpi] = useState(PRODUCTS[0]);
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || isNaN(Number(value))) return;

    onAdd({
      date,
      kpi,
      achieved: parseFloat(value),
    });

    setValue('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Add Performance Record</h2>
        <p className="text-slate-500">Register your daily achievements here.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            Product Name
          </label>
          <select
            value={kpi}
            onChange={(e) => setKpi(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
          >
            {PRODUCTS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-600" />
            Achieved Value
          </label>
          <input
            type="number"
            step="any"
            placeholder="Enter value..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
        >
          <Save className="w-5 h-5" />
          Record Data
        </button>
      </form>
    </motion.div>
  );
};