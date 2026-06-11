import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-av-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen pl-[232px]">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>

        <footer className="py-4 px-8 text-center text-slate-400 text-xs border-t border-slate-100 bg-white">
          © Absolute Veritas Inspection Service | Support: info@av-inspec.com
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
