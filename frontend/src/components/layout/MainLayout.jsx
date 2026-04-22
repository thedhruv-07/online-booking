import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import useUIStore from '../../store/uiStore';

const MainLayout = () => {
  const { isSidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "pl-[80px]" : "pl-[260px]"
        )}
      >
        <Navbar />
        
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>

        <footer className="py-4 px-8 text-center text-slate-400 text-sm border-t border-slate-100 bg-white">
          &copy; {new Date().getFullYear()} BookingSaaS. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
