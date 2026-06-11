import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  CreditCard,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../store/authStore.jsx';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
      { icon: ClipboardList, label: 'My Bookings', to: '/dashboard/bookings' },
    ],
  },
  {
    label: 'Actions',
    items: [
      { icon: PlusCircle, label: 'Create Booking', to: '/booking/create' },
      { icon: CreditCard, label: 'Payments', to: '/dashboard/payments' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: User, label: 'Profile', to: '/profile' },
      { icon: Settings, label: 'Settings', to: '/settings' },
    ],
  },
];

const SidebarLink = ({ icon: Icon, label, to }) => (
  <NavLink
    to={to}
    end={to === '/dashboard'}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors duration-150 text-[13px] font-medium',
        isActive
          ? 'bg-orange-50 text-orange-700 font-semibold'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      )
    }
  >
    <Icon size={16} strokeWidth={1.75} className="shrink-0" />
    {label}
  </NavLink>
);

const Sidebar = () => {
  const { logout, user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="fixed left-0 top-0 h-screen w-[232px] bg-white border-r border-slate-100 z-50 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center">
          <img
            src="/company-logo.png"
            alt="Absolute Veritas"
            className="h-9 object-contain max-w-[160px]"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-100 p-3 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-av-navy flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
        >
          <LogOut size={16} strokeWidth={1.75} className="shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
