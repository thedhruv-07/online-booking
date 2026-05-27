import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const AuthNavbar = () => {
  const { pathname } = useLocation();
  const isSignup = pathname === '/signup';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-50 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-900 text-lg tracking-tight">Absolute Veritas</span>
      </div>
      {isSignup ? (
        <Link
          to="/login"
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm"
        >
          Sign In
        </Link>
      ) : (
        <Link
          to="/signup"
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm"
        >
          Create Account
        </Link>
      )}
    </header>
  );
};

export default AuthNavbar;
