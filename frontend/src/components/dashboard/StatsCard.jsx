import React from 'react';
import { ClipboardList, Clock, CheckCircle2, Wallet } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Maps country codes to currency symbols.
 */
const CURRENCY_MAP = {
  'China': '¥',
  'India': '₹',
  'United States': '$',
  'USA': '$',
  'UK': '£',
  'United Kingdom': '£',
  'Japan': '¥',
  'South Korea': '₩',
  'Thailand': '฿',
  'Vietnam': '₫',
  'Indonesia': 'Rp',
  'Hong Kong': 'HK$',
};

const getCurrencySymbol = (country) => {
  if (!country) return '$';
  return CURRENCY_MAP[country] || '$';
};

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
    <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

const StatsCards = ({ bookings = [] }) => {
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => 
    ['pending', 'confirmed', 'in_progress'].includes(b.status?.toLowerCase())
  ).length;
  const completedBookings = bookings.filter(b => 
    b.status?.toLowerCase() === 'completed'
  ).length;

  // Group revenue by country currency
  const revenueByCountry = {};
  bookings.forEach(b => {
    const country = b.location?.country || 'Global';
    const symbol = getCurrencySymbol(country);
    const amount = b.payment?.amount || b.totalAmount || 0;
    if (!revenueByCountry[symbol]) revenueByCountry[symbol] = 0;
    revenueByCountry[symbol] += amount;
  });

  // Format the revenue display — show the dominant currency
  let revenueDisplay = '$0';
  const entries = Object.entries(revenueByCountry).filter(([, v]) => v > 0);
  if (entries.length === 1) {
    const [symbol, amount] = entries[0];
    revenueDisplay = `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else if (entries.length > 1) {
    // Show the largest one
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const [symbol, amount] = sorted[0];
    revenueDisplay = `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  const stats = [
    {
      label: 'Total Bookings',
      value: totalBookings,
      icon: ClipboardList,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Bookings',
      value: activeBookings,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Completed',
      value: completedBookings,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Revenue',
      value: revenueDisplay,
      icon: Wallet,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
};

export default StatsCards;
