import React from 'react';
import { useAuth } from '../../store/authStore.jsx';
import useUIStore from '../../store/uiStore.js';
import { Bell, Search, User as UserIcon, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 transition-all duration-300 sticky top-0 z-40">
      <div className="flex items-center gap-6 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
        >
          {isSidebarCollapsed ? <Menu size={22} /> : <X size={22} />}
        </button>

        <div className="relative max-w-md w-full hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors w-4 h-4" />
          <input
            type="text"
            placeholder="Search bookings, invoices..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all uppercase tracking-widest"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-slate-100">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        </button>

        <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{user?.name}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">{user?.role || 'Operator'}</p>
          </div>
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-slate-200 overflow-hidden hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-indigo-500">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={22} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
