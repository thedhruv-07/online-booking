import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { getCountries } from '../../utils/geoData';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const countries = getCountries();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationError) setValidationError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.country) {
      setValidationError('Please fill in all mandatory fields');
      return;
    }

    const result = await signup({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center"
        >
          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Check your email</h2>
          <p className="text-slate-500 font-medium mb-8">
            We've sent a verification link to <span className="text-indigo-600 font-bold">{formData.email}</span>. 
            Please verify your account to continue.
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 text-lg transition-colors"
          >
            Return to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 sm:p-12"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Registration</h1>
          <p className="text-red-500 font-medium">
            <span className="text-red-500">*</span> All fields are mandatory.
          </p>
        </div>

        <AnimatePresence>
          {(error || validationError) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-sm font-medium text-center"
            >
              {error || validationError}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          {/* First Name */}
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] items-center gap-4">
            <label className="text-right text-slate-700 font-bold text-sm whitespace-nowrap">
              First Name <span className="text-red-500">*</span> :-
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name ..."
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Last Name */}
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] items-center gap-4">
            <label className="text-right text-slate-700 font-bold text-sm whitespace-nowrap">
              Last Name <span className="text-red-500">*</span> :-
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name ..."
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Email */}
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] items-center gap-4">
            <label className="text-right text-slate-700 font-bold text-sm whitespace-nowrap">
              Email <span className="text-red-500">*</span> :-
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email id ..."
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Password */}
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] items-start gap-4">
            <label className="text-right text-slate-700 font-bold text-sm whitespace-nowrap mt-3">
              Password <span className="text-red-500">*</span> :-
            </label>
            <div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password ..."
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                required
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="showPassword" className="text-sm text-slate-600 cursor-pointer">
                  Show Password
                </label>
              </div>
            </div>
          </div>

          {/* Country */}
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] items-center gap-4">
            <label className="text-right text-slate-700 font-bold text-sm whitespace-nowrap">
              Country <span className="text-red-500">*</span> :-
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors appearance-none"
              required
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-10 py-3 rounded font-bold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
