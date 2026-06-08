import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import useUIStore from '../../store/uiStore.js';

const DashboardLayout = () => {
  const { isSidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-av-background flex">
      <Sidebar />

      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out",
          isSidebarCollapsed ? "pl-[72px]" : "pl-[240px]"
        )}
      >
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>

        <footer className="py-4 px-8 text-center text-gray-400 text-xs border-t border-av-border bg-white">
          © Absolute Veritas Inspection Service | Support: info@av-inspec.com
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
