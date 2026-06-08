import React from 'react';
import { ClipboardList, Clock, CheckCircle2, FileCheck, Award, CircleDollarSign } from 'lucide-react';
import { cn } from '../../utils/cn';

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor }) => (
  <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900 tracking-tight mb-1">{value}</p>
    <p className="text-sm font-medium text-gray-500">{label}</p>
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
    {
      label: 'Total Bookings',
      value: totalBookings,
      icon: ClipboardList,
      iconBg: 'bg-av-light-blue',
      iconColor: 'text-av-navy',
    },
    {
      label: 'Scheduled Inspections',
      value: scheduledBookings,
      icon: Clock,
      iconBg: 'bg-av-orange-light',
      iconColor: 'text-av-orange',
    },
    {
      label: 'In Progress',
      value: inProgressBookings,
      icon: CheckCircle2,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Completed Reports',
      value: completedBookings,
      icon: FileCheck,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Certificates Issued',
      value: certificatesIssued,
      icon: Award,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Pending Payments',
      value: pendingPayments,
      icon: CircleDollarSign,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
};

export default StatsCards;
