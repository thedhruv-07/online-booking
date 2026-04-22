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
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
          'hover:bg-indigo-50 text-slate-600 hover:text-indigo-600',
          isActive && 'bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white'
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
            className="font-medium whitespace-nowrap"
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
    <div className="mb-6">
      {!isCollapsed && (
        <p className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
      )}
      <div className="space-y-1 px-2">
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
      animate={{ width: isSidebarCollapsed ? '80px' : '260px' }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ease-in-out"
    >
      {/* Logo Section */}
      <div className="p-4 flex items-center justify-between h-16 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          {!isSidebarCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-slate-800"
            >
              Booking<span className="text-indigo-600">SaaS</span>
            </motion.span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <SidebarGroup label="Main" isCollapsed={isSidebarCollapsed}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={ClipboardList} label="My Bookings" to="/dashboard/bookings" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={Calendar} label="Calendar" to="/calendar" isCollapsed={isSidebarCollapsed} />
        </SidebarGroup>

        <SidebarGroup label="Actions" isCollapsed={isSidebarCollapsed}>
          <SidebarItem icon={PlusCircle} label="Create Booking" to="/booking/create" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={CreditCard} label="Payments" to="/payments" isCollapsed={isSidebarCollapsed} />
        </SidebarGroup>

        <SidebarGroup label="Account" isCollapsed={isSidebarCollapsed}>
          <SidebarItem icon={User} label="Profile" to="/profile" isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={Settings} label="Settings" to="/settings" isCollapsed={isSidebarCollapsed} />
        </SidebarGroup>

        {user?.role === 'admin' && (
          <SidebarGroup label="Admin" isCollapsed={isSidebarCollapsed}>
            <SidebarItem icon={ShieldCheck} label="Admin Panel" to="/admin" isCollapsed={isSidebarCollapsed} />
          </SidebarGroup>
        )}
      </div>

      {/* User / Logout Section */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group'
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
