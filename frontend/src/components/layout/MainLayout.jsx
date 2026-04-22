import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import useUIStore from '../../store/uiStore.js';

const MainLayout = () => {
  const { isSidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50 flex transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "pl-[90px]" : "pl-[280px]"
        )}
      >
        <Navbar />
        
        <main className="flex-1 p-10 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>

        <footer className="py-8 px-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-t border-slate-100 bg-white transition-colors">
          &copy; {new Date().getFullYear()} BookingSaaS Infrastructure. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
