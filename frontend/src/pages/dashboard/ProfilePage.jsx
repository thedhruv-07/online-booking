import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Building, Save, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../store/authStore';

const ProfilePage = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        company: user.company || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      company: formData.company,
    });
    if (result.success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name || 'User'}</h2>
              <p className="text-sm text-slate-500">{user?.role === 'admin' ? 'Administrator' : 'Standard User'}</p>
            </div>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              ) : (
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {user?.name || 'Not provided'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" /> Email Address
              </label>
              <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 font-medium cursor-not-allowed">
                {user?.email || 'Not provided'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Shield size={16} className="text-slate-400" /> Account Status
              </label>
              <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                Active
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building size={16} className="text-slate-400" /> Company
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              ) : (
                <div className={cn("w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium", 
                  user?.company ? "bg-slate-50 text-slate-800" : "bg-slate-50 text-slate-400 italic"
                )}>
                  {user?.company || 'No company added'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Phone Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 234 567 890"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              ) : (
                <div className={cn("w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium", 
                  user?.phone ? "bg-slate-50 text-slate-800" : "bg-slate-50 text-slate-400 italic"
                )}>
                  {user?.phone || 'No phone number added'}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || '',
                    phone: user.phone || '',
                    company: user.company || '',
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                <X size={18} /> Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default ProfilePage;
