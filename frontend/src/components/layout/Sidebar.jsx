import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Plus, 
  CreditCard,
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useAuth } from '../../store/authStore.jsx';
import useUIStore from '../../store/uiStore.js';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: ClipboardList, label: 'My Bookings', to: '/dashboard/bookings' },
  { icon: Plus, label: 'Create Booking', to: '/booking/create', highlight: true },
  { icon: CreditCard, label: 'Payments', to: '/dashboard/payments' },
];

const bottomItems = [
  { icon: User, label: 'Profile', to: '/profile' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

const SidebarLink = ({ icon: Icon, label, to, isCollapsed, highlight }) => (
  <NavLink
    to={to}
    end={to === '/dashboard'}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-[13px] font-medium',
        highlight && !isActive && 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
        !highlight && !isActive && 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        isActive && 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
      )
    }
  >
    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isCollapsed ? 2 : 1.8} />
    <AnimatePresence mode="wait">
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className="whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </NavLink>
);

const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { logout, user } = useAuth();

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? '72px' : '240px' }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[15px] font-semibold text-gray-900 whitespace-nowrap"
              >
                Absolute Veritas
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={toggleSidebar}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} isCollapsed={isSidebarCollapsed} />
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="border-t border-gray-100 py-3 px-3 space-y-1">
        {bottomItems.map((item) => (
          <SidebarLink key={item.to} {...item} isCollapsed={isSidebarCollapsed} />
        ))}
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium',
            'text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200'
          )}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
