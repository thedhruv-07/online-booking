import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Clock, 
  BarChart3, 
  Globe, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X,
  PlayCircle
} from 'lucide-react';
import { cn } from '../utils/cn';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      title: 'Global Inspection Network',
      description: 'Access certified inspectors in over 50 countries, ready to visit your factory within 24 hours.',
      icon: Globe,
    },
    {
      title: 'Real-time Reporting',
      description: 'Receive detailed PDF reports with high-resolution photos and videos the same day of inspection.',
      icon: Clock,
    },
    {
      title: 'Quality Analytics',
      description: 'Track defect trends and supplier performance with our advanced AI-driven analytics dashboard.',
      icon: BarChart3,
    },
    {
      title: 'Secure Payments',
      description: 'Transparent pricing with secure payment options. Pay only for the inspections you book.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <ShieldCheck size={24} />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight uppercase">BookingSaaS</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#solutions" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Solutions</a>
              <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Pricing</a>
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Log In</Link>
              <Link to="/signup" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                Get Started
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <a href="#features" className="block text-lg font-bold text-slate-800">Features</a>
                <a href="#solutions" className="block text-lg font-bold text-slate-800">Solutions</a>
                <a href="#pricing" className="block text-lg font-bold text-slate-800">Pricing</a>
                <div className="pt-4 flex flex-col gap-3">
                  <Link to="/login" className="w-full py-4 text-center font-bold text-slate-600 bg-slate-50 rounded-2xl">Log In</Link>
                  <Link to="/signup" className="w-full py-4 text-center font-bold text-white bg-indigo-600 rounded-2xl">Get Started</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              The Future of Global Inspections
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
              Trust Your Supply Chain <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 italic">With Absolute Certainty.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              Book certified professional inspections anywhere in the world. Manage your quality control with our AI-powered SaaS platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group">
                Start Free Trial
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-lg text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                <PlayCircle className="text-indigo-600" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-20 pt-10 border-t border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Trusted by global supply leaders</p>
              <div className="flex flex-wrap justify-center items-center gap-10 opacity-40 grayscale group-hover:grayscale-0 transition-all font-black tracking-tighter text-2xl">
                <div>AMAZON</div>
                <div>WALMART</div>
                <div>SAMSUNG</div>
                <div>NIKE</div>
                <div>APPLE</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Everything you need for QC</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Our platform streamlines the entire inspection lifecycle from booking to corrective action.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all"
              >
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[3rem] p-12 lg:p-20 text-white text-center relative overflow-hidden">
             {/* Decor */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -ml-48 -mb-48"></div>

             <div className="relative z-10 max-w-3xl mx-auto">
               <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight tracking-tight">Ready to secure your product quality?</h2>
               <p className="text-xl text-indigo-100 font-medium mb-12">Join thousands of companies who trust BookingSaaS for their global quality control operations.</p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Link to="/signup" className="w-full sm:w-auto bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-xl hover:bg-slate-100 transition-all shadow-2xl shadow-indigo-900/20">
                   Get Started Now
                 </Link>
                 <Link to="/contact" className="w-full sm:w-auto px-12 py-5 rounded-2xl font-black text-xl border-2 border-white/30 hover:bg-white/10 transition-all">
                   Contact Sales
                 </Link>
               </div>
               <div className="mt-12 flex items-center justify-center gap-8 text-indigo-200">
                 <div className="flex items-center gap-2">
                   <CheckCircle2 size={20} />
                   <span className="text-sm font-bold uppercase tracking-widest">No Card Required</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <CheckCircle2 size={20} />
                   <span className="text-sm font-bold uppercase tracking-widest">14-Day Free Trial</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight uppercase">BookingSaaS</span>
              </div>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                Simplifying global quality control with cutting-edge technology and a certified inspection network.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">Features</a></li>
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">Solutions</a></li>
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">Integrations</a></li>
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Resources</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">Documentation</a></li>
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">Help Center</a></li>
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">API Reference</a></li>
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Contact</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">Sales</a></li>
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">Support</a></li>
                <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm font-bold">Partners</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} BookingSaaS Platform. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest">Terms</a>
              <a href="#" className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
