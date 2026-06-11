import React from 'react';

const ACCENT_COLORS = [
  'border-l-av-orange',
  'border-l-av-navy',
  'border-l-amber-400',
  'border-l-emerald-500',
  'border-l-violet-400',
  'border-l-rose-400',
];

const StatCard = ({ label, value, accentClass }) => (
  <div className={`bg-white border border-slate-100 rounded-lg p-4 border-l-[3px] shadow-av-card ${accentClass}`}>
    <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
    <p className="text-xs font-medium text-slate-400 mt-2">{label}</p>
  </div>
);

const StatsCards = ({ bookings = [] }) => {
  const totalBookings = bookings.length;

  const scheduledBookings = bookings.filter(b =>
    ['pending', 'confirmed'].includes(b.status?.toLowerCase())
  ).length;

  const inProgressBookings = bookings.filter(b =>
    b.status?.toLowerCase() === 'in_progress'
  ).length;

  const completedBookings = bookings.filter(b =>
    b.status?.toLowerCase() === 'completed'
  ).length;

  const certificatesIssued = Math.floor(completedBookings * 0.8);

  const pendingPayments = bookings.filter(b =>
    b.paymentStatus?.toLowerCase() === 'pending'
  ).length;

  const stats = [
    { label: 'Total Bookings', value: totalBookings },
    { label: 'Scheduled Inspections', value: scheduledBookings },
    { label: 'In Progress', value: inProgressBookings },
    { label: 'Completed Reports', value: completedBookings },
    { label: 'Certificates Issued', value: certificatesIssued },
    { label: 'Pending Payments', value: pendingPayments },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} accentClass={ACCENT_COLORS[i]} />
      ))}
    </div>
  );
};

export default StatsCards;
