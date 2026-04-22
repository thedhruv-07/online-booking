import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
                trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {trendValue}
              </span>
              <span className="text-xs text-slate-400">vs last month</span>
            </div>
          )}
        </div>

        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          color || "bg-indigo-50 text-indigo-600"
        )}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
