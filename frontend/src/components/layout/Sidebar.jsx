import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ClipboardList,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useAuth } from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const SidebarItem = ({ icon: Icon, label, to, isCollapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden',
          'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
          isActive && 'bg-slate-900 text-white hover:bg-slate-800'
        )
      }
    >
      <Icon className="w-5 h-5 shrink-0" />
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="font-bold text-xs uppercase tracking-widest whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
};

const SidebarGroup = ({ label, isCollapsed, children }) => {
  return (
    <div className="mb-10">
      {!isCollapsed && (
        <p className="px-6 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
          {label}
        </p>
      )}
      <div className="space-y-2 px-3">
        {children}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { logout, user } = useAuth();

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? '90px' : '280px' }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-slate-100 z-50 flex flex-col shadow-2xl shadow-slate-200/50"
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between h-24">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          {!isSidebarCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-black text-slate-900 tracking-tighter"
            >
              Booking<span className="text-indigo-600">SaaS</span>
            </motion.span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100"
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar px-1">
        <SidebarGroup label="Intelligence" isCollapsed={isSidebarCollapsed}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={ClipboardList} label="Inventory" to="/dashboard/bookings" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={Calendar} label="Scheduler" to="/calendar" isCollapsed={isSidebarCollapsed} />
        </SidebarGroup>

        <SidebarGroup label="Operations" isCollapsed={isSidebarCollapsed}>
          <SidebarItem icon={PlusCircle} label="New Directive" to="/booking/create" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={CreditCard} label="Settlements" to="/payments" isCollapsed={isSidebarCollapsed} />
        </SidebarGroup>

        <SidebarGroup label="Configuration" isCollapsed={isSidebarCollapsed}>
          <SidebarItem icon={User} label="Identity" to="/profile" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={Settings} label="Control" to="/settings" isCollapsed={isSidebarCollapsed} />
        </SidebarGroup>

        {user?.role === 'admin' && (
          <SidebarGroup label="Authority" isCollapsed={isSidebarCollapsed}>
            <SidebarItem icon={ShieldCheck} label="Command Center" to="/admin" isCollapsed={isSidebarCollapsed} />
          </SidebarGroup>
        )}
      </div>

      {/* User / Logout Section */}
      <div className="p-6 border-t border-slate-50">
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-4 py-4 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 font-bold text-xs uppercase tracking-widest'
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isSidebarCollapsed && <span>Termination</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
