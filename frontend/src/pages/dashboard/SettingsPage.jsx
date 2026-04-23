import React, { useState, useEffect } from 'react';
import { Bell, Lock, Globe, Palette, Loader2, Save } from 'lucide-react';
import { useAuth } from '../../store/authStore';

const SettingsPage = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    notifications: {
      bookingUpdates: true,
      paymentReminders: true,
      marketing: false,
    },
    preferences: {
      language: 'English (US)',
      timezone: 'UTC (GMT+0)',
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        notifications: user.notifications || {
          bookingUpdates: true,
          paymentReminders: true,
          marketing: false,
        },
        preferences: user.preferences || {
          language: 'English (US)',
          timezone: 'UTC (GMT+0)',
        }
      });
    }
  }, [user]);

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked
      }
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }));
  };

  const handleSave = async () => {
    await updateProfile({
      notifications: formData.notifications,
      preferences: formData.preferences,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your app preferences and configurations.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Notifications */}
        <div className="p-6 border-b border-slate-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
            <Bell className="text-indigo-600" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Notifications</h3>
            <p className="text-sm text-slate-500 mb-4">Choose what updates you want to receive via email.</p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="bookingUpdates"
                  checked={formData.notifications.bookingUpdates}
                  onChange={handleNotificationChange}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600 transition-colors" 
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Booking status updates</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="paymentReminders"
                  checked={formData.notifications.paymentReminders}
                  onChange={handleNotificationChange}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600 transition-colors" 
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Payment receipts and reminders</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="marketing"
                  checked={formData.notifications.marketing}
                  onChange={handleNotificationChange}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600 transition-colors" 
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Marketing and promotional emails</span>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="p-6 border-b border-slate-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
            <Lock className="text-slate-600" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Security</h3>
            <p className="text-sm text-slate-500 mb-4">Manage your password and security preferences.</p>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
            <Globe className="text-slate-600" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Regional Preferences</h3>
            <p className="text-sm text-slate-500 mb-4">Set your default language and timezone.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Language</label>
                <select 
                  name="language"
                  value={formData.preferences.language}
                  onChange={handlePreferenceChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Timezone</label>
                <select 
                  name="timezone"
                  value={formData.preferences.timezone}
                  onChange={handlePreferenceChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all cursor-pointer"
                >
                  <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                  <option value="EST (GMT-5)">EST (GMT-5)</option>
                  <option value="PST (GMT-8)">PST (GMT-8)</option>
                  <option value="IST (GMT+5:30)">IST (GMT+5:30)</option>
                  <option value="AEST (GMT+10)">AEST (GMT+10)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Preferences
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
              <p className="text-sm text-slate-500">Enter your current password and a new one below.</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
