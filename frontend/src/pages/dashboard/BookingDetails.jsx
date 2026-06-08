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
  CheckCircle,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { cn } from '../../utils/cn';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-600 border-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  in_progress: 'bg-av-light-blue text-av-navy border-blue-100',
  completed: 'bg-av-orange-light text-av-orange border-av-orange/20',
  cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadState, setDownloadState] = useState('idle');

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

  const handleDownloadInvoice = async () => {
    if (downloadState !== 'idle') return;
    setDownloadState('loading');
    try {
      const blobData = await api.get(`/invoice/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadState('success');
      setTimeout(() => setDownloadState('idle'), 2500);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      setDownloadState('idle');
      alert('Failed to download invoice. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Dossier Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">{error || "The requested booking could not be found."}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-6 text-sm font-medium text-slate-900 hover:text-slate-600 underline underline-offset-4"
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
        <div className="space-y-1">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
          >
            <ChevronLeft size={16} />
            Back to List
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {booking.service?.name || 'Inspection Request'}
            </h1>
            <span className={cn(
              "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border",
              statusStyles[booking.status] || statusStyles.pending
            )}>
              {booking.status?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-slate-500">Dossier ID: <span className="font-mono text-slate-700">#{booking._id.toUpperCase()}</span></p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadInvoice}
            disabled={downloadState !== 'idle'}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm select-none",
              downloadState === 'idle' && "bg-slate-900 text-white hover:bg-slate-700 border border-transparent",
              downloadState === 'loading' && "bg-slate-700 text-white border border-transparent cursor-not-allowed",
              downloadState === 'success' && "bg-emerald-600 text-white border border-emerald-500"
            )}
          >
            {downloadState === 'idle' && (
              <>
                <Download size={15} className="shrink-0" />
                Download Invoice
              </>
            )}
            {downloadState === 'loading' && (
              <>
                <Loader2 size={15} className="animate-spin shrink-0" />
                Generating PDF...
              </>
            )}
            {downloadState === 'success' && (
              <>
                <CheckCircle size={15} className="shrink-0" />
                Downloaded!
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Primary Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Technical Overview */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-3">
                <FileText className="text-slate-400" size={18} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Technical Overview</h3>
              </div>
              <div className="text-xs font-bold text-slate-400">CREATED {new Date(booking.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Scheduled Date</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">
                  {new Date(booking.date || booking.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Service Location</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">
                  {booking.location?.city ? `${booking.location.city}, ${booking.location.country}` : (booking.factory?.location || 'Global/Remote')}
                </span>
              </div>
            </div>
          </div>

          {/* Factory & Logistics */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-3">
                <Factory className="text-slate-400" size={18} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Factory & Logistics</h3>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Factory Entity</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{booking.factory?.name || 'Manual Entry Factory'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Physical Address</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">
                  {booking.factory?.location || booking.location?.address || 'Address not provided'}
                  {booking.location?.city && `, ${booking.location.city}, `}{booking.location?.country} {booking.location?.postalCode}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Primary Contact</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{booking.contact?.name || 'N/A'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Phone Number</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{booking.factory?.phone || booking.contact?.phone || 'No phone provided'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Email Address</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{booking.contact?.email || 'No email provided'}</span>
              </div>
            </div>
          </div>

          {/* Quality & Inspection Standards */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-slate-400" size={18} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Quality Standards (AQL)</h3>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Lot Size</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{`${booking.aql?.lotSize?.toLocaleString() || 0} Units`}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Inspection Level</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right uppercase">{booking.aql?.inspectionLevel || 'II'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Code Letter</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{booking.aql?.codeLetter || '—'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Strictness Mode</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right capitalize">{booking.aql?.strictnessMode || 'Standard'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Quality Mode</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right capitalize">{booking.aql?.qualityMode || 'Standard'}</span>
              </div>
              
              {/* Defect Limits */}
              <div className="bg-slate-50 p-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Major Defects (AQL {booking.aql?.aqlMajor || '—'})</span>
                    <div className="flex gap-4">
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1">
                        <span className="text-[10px] font-bold text-emerald-600 block">Accept</span>
                        <span className="text-lg font-bold text-slate-900">{booking.aql?.majorLimits?.ac ?? '—'}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1">
                        <span className="text-[10px] font-bold text-rose-600 block">Reject</span>
                        <span className="text-lg font-bold text-slate-900">{booking.aql?.majorLimits?.re ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Minor Defects (AQL {booking.aql?.aqlMinor || '—'})</span>
                    <div className="flex gap-4">
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1">
                        <span className="text-[10px] font-bold text-emerald-600 block">Accept</span>
                        <span className="text-lg font-bold text-slate-900">{booking.aql?.minorLimits?.ac ?? '—'}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1">
                        <span className="text-[10px] font-bold text-rose-600 block">Reject</span>
                        <span className="text-lg font-bold text-slate-900">{booking.aql?.minorLimits?.re ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Size Highlight */}
              <div className="bg-orange-50/50 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-av-orange text-white rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-av-orange uppercase tracking-widest block leading-none mb-1">Total Sample Size</span>
                    <p className="text-xs font-medium text-slate-600">Based on ISO 2859-1 standards.</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-av-orange">{booking.aql?.sampleSize || 0}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Units</span>
                </div>
              </div>
            </div>
          </div>

          {/* Production Scope */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-3">
                <FileText className="text-slate-400" size={18} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Production Scope</h3>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Product Name</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{booking.product?.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">Order Volume</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{booking.product?.quantity} {booking.product?.unitType}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
                <span className="text-sm font-medium text-slate-500 sm:w-1/3">PO Number</span>
                <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{booking.product?.poNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          
          {/* Financial Overview Card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Financial Overview</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-slate-900">${booking.totalAmount?.toFixed(2) || '0.00'}</span>
                <span className="text-sm font-medium text-slate-500">USD</span>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs font-bold">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  booking.paymentStatus === 'paid' ? "bg-emerald-400" : "bg-amber-400"
                )}></div>
                <span className="uppercase tracking-widest text-slate-600">Payment {booking.paymentStatus || 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Documents Card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Documents</h3>
              <span className="bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                {booking.bookingFiles?.length || 0}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {booking.bookingFiles && booking.bookingFiles.length > 0 ? (
                booking.bookingFiles.map((file, idx) => (
                  <div key={file.id || idx} className="group p-3 border border-slate-200 rounded-lg hover:border-av-orange transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText size={16} className="text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{file.type?.split('/')[1] || 'DOC'} • {(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <a 
                      href={`${baseUrl}${file.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <Eye size={12} />
                      VIEW FILE
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-slate-300 mb-2" size={24} />
                  <p className="text-xs text-slate-400 uppercase tracking-widest">No documents attached</p>
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
