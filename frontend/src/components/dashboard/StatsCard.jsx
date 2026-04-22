import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-500 group-hover:rotate-6",
            color || "bg-indigo-50 text-indigo-600"
          )}>
            <Icon size={32} strokeWidth={2.5} />
          </div>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm border",
              trend === 'up' 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-rose-50 text-rose-600 border-rose-100"
            )}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trendValue}
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
              {value}
            </h3>
          </div>
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
            Performance Metrics
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
