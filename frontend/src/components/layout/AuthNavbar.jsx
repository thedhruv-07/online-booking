import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const AuthNavbar = () => {
  const { pathname } = useLocation();
  const isSignup = pathname === '/signup';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-50 shadow-sm">
      <div className="flex items-center">
        <img src="/company-logo.png" alt="Absolute Veritas" className="h-10 object-contain" />
      </div>
      {isSignup ? (
        <Link
          to="/login"
          className="px-5 py-2 bg-av-orange text-white rounded-xl font-bold text-sm hover:bg-av-orange-hover transition-all shadow-sm"
        >
          Sign In
        </Link>
      ) : (
        <Link
          to="/signup"
          className="px-5 py-2 bg-av-orange text-white rounded-xl font-bold text-sm hover:bg-av-orange-hover transition-all shadow-sm"
        >
          Create Account
        </Link>
      )}
    </header>
  );
};

export default AuthNavbar;
