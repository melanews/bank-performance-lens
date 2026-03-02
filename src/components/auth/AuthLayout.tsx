import React from 'react';
import { motion } from 'framer-motion';
import { Landmark } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-emerald-600 p-4 rounded-3xl shadow-lg shadow-emerald-200 mb-6">
              <Landmark className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
            <p className="text-slate-500 font-medium mt-2">{subtitle}</p>
          </div>
          {children}
        </div>
      </motion.div>
      <p className="mt-8 text-slate-400 text-sm font-medium">© {new Date().getFullYear()} Bankers PMS. All rights reserved.</p>
    </div>
  );
};