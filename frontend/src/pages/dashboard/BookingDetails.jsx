import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Factory, 
  User, 
  FileText, 
  Eye, 
  Download,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { cn } from '../../utils/cn';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-600 border-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  in_progress: 'bg-blue-50 text-blue-600 border-blue-100',
  completed: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/bookings/${id}`);
      setBooking(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading dossier details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Dossier Not Found</h2>
        <p className="text-slate-500 mt-2">{error || "The requested booking could not be found."}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-6 text-indigo-600 font-bold hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').split('/api')[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors mb-4"
          >
            <ChevronLeft size={16} />
            Back to List
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {booking.service?.name || 'Inspection Request'}
            </h1>
            <span className={cn(
              "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border",
              statusStyles[booking.status] || statusStyles.pending
            )}>
              {booking.status?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-500 font-medium">Dossier ID: <span className="text-slate-900 font-bold font-mono">#{booking._id.toUpperCase()}</span></p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            Download Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Primary Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                <FileText className="text-indigo-600" size={24} />
                Technical Overview
              </h2>
              <div className="text-xs font-bold text-slate-400">CREATED {new Date(booking.createdAt).toLocaleDateString()}</div>
            </div>
            
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Scheduled Date</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Calendar size={20} />
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {new Date(booking.date || booking.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Service Location</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <MapPin size={20} />
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {booking.location?.city ? `${booking.location.city}, ${booking.location.country}` : (booking.factory?.location || 'Global/Remote')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Factory & Logistics Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10">
            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Factory size={16} />
              </div>
              Factory & Logistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Factory Entity</label>
                  <div className="text-lg font-bold text-slate-900">{booking.factory?.name || 'Manual Entry Factory'}</div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Physical Address</label>
                  <div className="flex items-start gap-2 text-slate-600 font-medium leading-relaxed">
                    <MapPin size={16} className="mt-1 text-slate-400 shrink-0" />
                    <span>
                      {booking.factory?.location || booking.location?.address || 'Address not provided'}<br />
                      {booking.location?.city && `${booking.location.city}, `}{booking.location?.country} {booking.location?.postalCode}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Primary Contact</label>
                  <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <User size={18} className="text-indigo-600" />
                    {booking.contact?.name || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Clock size={14} className="text-slate-400" />
                    {booking.factory?.phone || booking.contact?.phone || 'No phone provided'}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <FileText size={14} className="text-slate-400" />
                    {booking.contact?.email || 'No email provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quality & Inspection Standards */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10">
            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <CheckCircle2 size={16} />
              </div>
              Quality & Inspection Standards
            </h2>
            
            {/* Row 1: Core AQL Parameters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="p-4 bg-slate-50/50 rounded-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lot Size</div>
                <div className="text-lg font-black text-slate-900">{booking.aql?.lotSize?.toLocaleString() || 'N/A'}</div>
                <div className="text-[10px] font-bold text-slate-400">Units</div>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Sample Size</div>
                <div className="text-lg font-black text-emerald-700">{booking.aql?.sampleSize || 0}</div>
                <div className="text-[10px] font-bold text-emerald-400">Units to Inspect</div>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inspection Level</div>
                <div className="text-lg font-black text-slate-900 uppercase">{booking.aql?.inspectionLevel || 'II'}</div>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Code Letter</div>
                <div className="text-lg font-black text-slate-900">{booking.aql?.codeLetter || '—'}</div>
              </div>
            </div>

            {/* Row 2: Mode & AQL Values */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="p-4 bg-slate-50/50 rounded-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Strictness Mode</div>
                <div className="text-sm font-bold text-slate-800 capitalize">{booking.aql?.strictnessMode || 'Standard'}</div>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Quality Mode</div>
                <div className="text-sm font-bold text-slate-800 capitalize">{booking.aql?.qualityMode || 'Standard'}</div>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">AQL Major</div>
                <div className="text-sm font-bold text-slate-800">{booking.aql?.aqlMajor || '—'}</div>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">AQL Minor</div>
                <div className="text-sm font-bold text-slate-800">{booking.aql?.aqlMinor || '—'}</div>
              </div>
            </div>

            {/* Row 3: Accept/Reject Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Major Defect Limits</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Accept</div>
                    <div className="text-2xl font-black text-emerald-700">{booking.aql?.majorLimits?.ac ?? '—'}</div>
                  </div>
                  <div className="flex-1 text-center p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Reject</div>
                    <div className="text-2xl font-black text-rose-600">{booking.aql?.majorLimits?.re ?? '—'}</div>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Minor Defect Limits</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Accept</div>
                    <div className="text-2xl font-black text-emerald-700">{booking.aql?.minorLimits?.ac ?? '—'}</div>
                  </div>
                  <div className="flex-1 text-center p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Reject</div>
                    <div className="text-2xl font-black text-rose-600">{booking.aql?.minorLimits?.re ?? '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Protocol Note */}
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-[24px]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">AQL Inspection Protocol</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Based on ISO 2859-1 standard, inspection level <span className="text-slate-900 font-bold uppercase">{booking.aql?.inspectionLevel || 'II'}</span> with code letter <span className="text-slate-900 font-bold">{booking.aql?.codeLetter || '—'}</span>. Our inspector will randomly select <span className="text-indigo-600 font-bold">{booking.aql?.sampleSize || 0} units</span> from the total lot of <span className="text-slate-900 font-bold">{booking.aql?.lotSize?.toLocaleString() || 0}</span> for physical inspection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Production Scope Details */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Production Scope</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50/50 rounded-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Product Name</div>
                <div className="text-xs font-bold text-slate-900 truncate">{booking.product?.name}</div>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Volume</div>
                <div className="text-xs font-bold text-slate-900">{booking.product?.quantity} {booking.product?.unitType}</div>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PO Number</div>
                <div className="text-xs font-bold text-slate-900">{booking.product?.poNumber || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          {/* Payment Status Card */}
          <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-6">Financial Overview</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black">${booking.totalAmount?.toFixed(2) || '0.00'}</span>
                <span className="text-xs font-bold opacity-60">USD</span>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs font-bold">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  booking.paymentStatus === 'paid' ? "bg-emerald-400" : "bg-amber-400"
                )}></div>
                <span className="uppercase tracking-widest">Payment {booking.paymentStatus || 'Pending'}</span>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Documents Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center justify-between">
              Documents
              <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-[10px] font-black">
                {booking.bookingFiles?.length || 0}
              </span>
            </h3>

            <div className="space-y-4">
              {booking.bookingFiles && booking.bookingFiles.length > 0 ? (
                booking.bookingFiles.map((file, idx) => (
                  <div key={file.id || idx} className="group p-4 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 rounded-2xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 truncate">{file.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{file.type?.split('/')[1] || 'DOC'} • {(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                      <a 
                        href={`${baseUrl}${file.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-center flex items-center justify-center gap-2"
                      >
                        <Eye size={12} />
                        VIEW
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[24px]">
                  <FileText className="mx-auto text-slate-200 mb-2" size={32} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No documents attached</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
