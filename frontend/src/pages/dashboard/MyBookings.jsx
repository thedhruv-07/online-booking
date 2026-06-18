import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Trash2,
  Upload
} from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { api } from '../../services/api';
import { paymentService } from '../../services/payment.service';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Modal } from '../../components/ui';
import { toast } from 'react-hot-toast';

const statusFilters = [
  { label: 'All Bookings', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const statusStyles = {
  pending: 'bg-amber-50 text-amber-600 border-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  in_progress: 'bg-av-light-blue text-av-navy border-blue-100',
  completed: 'bg-av-orange-light text-av-orange border-av-orange/20',
  cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
  receipt_uploaded: 'bg-purple-50 text-purple-600 border-purple-100',
};

const MyBookings = () => {
  const { bookings, pagination, isLoading, fetchBookings } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchBookings({ 
      search: searchTerm, 
      status: activeFilter, 
      page: currentPage 
    });
  }, [activeFilter, currentPage]);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('scroll', handleClickOutside, true);
    window.addEventListener('resize', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('scroll', handleClickOutside, true);
      window.removeEventListener('resize', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings({ search: searchTerm, status: activeFilter, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    if (activeDropdown?.id === id) {
      setActiveDropdown(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setActiveDropdown({
      id,
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  };

  const handleDeleteClick = (e, booking) => {
    e.stopPropagation();
    setActiveDropdown(null);
    setDeleteTarget(booking);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/bookings/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchBookings({ search: searchTerm, status: activeFilter, page: currentPage });
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to delete booking.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadInvoice = async (e, bookingId) => {
    e.stopPropagation();
    setActiveDropdown(null);
    if (downloadingId) return;
    setDownloadingId(bookingId);
    try {
      const blobData = await api.get(`/invoice/${bookingId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${bookingId.slice(-8).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await api.post(`/bookings/${cancelTarget._id}/cancel`);
      setCancelTarget(null);
      fetchBookings({ search: searchTerm, status: activeFilter, page: currentPage });
      toast.success('Booking cancelled.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setReceiptError('Please upload a PDF file only.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setReceiptError('File size must be under 10 MB.');
      return;
    }
    setReceiptFile(file);
    setReceiptError('');
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile) {
      setReceiptError('Please select a PDF receipt to upload.');
      return;
    }
    setIsUploadingReceipt(true);
    try {
      await paymentService.uploadBankReceipt(confirmTarget._id, receiptFile);
      toast.success('Receipt uploaded — awaiting admin confirmation');
      setConfirmTarget(null);
      setReceiptFile(null);
      fetchBookings({ search: searchTerm, status: activeFilter, page: currentPage });
    } catch (err) {
      setReceiptError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Bookings</h1>
          <p className="text-slate-500 text-sm font-medium">Manage and track your inspection requests</p>
        </div>
        <Link 
          to="/booking/create" 
          className="bg-av-orange text-white px-5 py-2.5 rounded-[16px] font-bold flex items-center gap-2 hover:bg-av-orange-hover transition-all shadow-lg shadow-av-orange/20 w-fit"
        >
          <Plus size={20} />
          New Booking
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-[16px] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setActiveFilter(filter.value);
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-[16px] text-sm font-bold whitespace-nowrap transition-all border",
                activeFilter === filter.value 
                  ? "bg-av-orange text-white border-av-orange shadow-md shadow-av-orange/20" 
                  : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-av-orange transition-colors" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full lg:w-72 pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[16px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-av-orange/20 focus:border-av-orange transition-all"
          />
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-[16px] border border-slate-100 shadow-sm overflow-visible min-h-[400px]">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Factory / Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-6"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                    <td className="px-6 py-6 text-right"><div className="h-8 bg-slate-100 rounded ml-auto w-8"></div></td>
                  </tr>
                ))
              ) : bookings.length > 0 ? (
                bookings.map((booking) => {
                  const status = booking.status.toLowerCase();
                  return (
                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{booking.service?.name || 'Inspection'}</div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">#{booking._id.slice(-8).toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-600">{booking.factory?.name || 'Factory N/A'}</div>
                        <div className="text-xs text-slate-400 font-medium">{booking.location?.city}, {booking.location?.country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-600">
                          {new Date(booking.date || booking.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border",
                          statusStyles[
                            booking.payment?.receiptUploaded && booking.status === 'pending'
                              ? 'receipt_uploaded'
                              : status
                          ] || statusStyles.pending
                        )}>
                          {booking.payment?.receiptUploaded && booking.status === 'pending'
                            ? 'Receipt Uploaded'
                            : status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right overflow-visible">
                        <div className="flex items-center justify-end gap-2 relative">
                          {booking.payment?.method === 'bank_transfer' &&
                            booking.status === 'pending' &&
                            !booking.payment?.receiptUploaded && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmTarget(booking);
                                  setReceiptFile(null);
                                  setReceiptError('');
                                }}
                                className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                                title="Upload bank transfer receipt"
                              >
                                <Upload size={18} />
                              </button>
                            )}
                          <Link
                            to={`/dashboard/bookings/${booking._id}`}
                            className="p-2 text-slate-400 hover:text-av-orange hover:bg-av-orange-light rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>

                          <div className="relative">
                            <button 
                              onClick={(e) => toggleDropdown(e, booking._id)}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                activeDropdown?.id === booking._id 
                                  ? "bg-slate-100 text-slate-900 shadow-inner" 
                                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </div>

                          {activeDropdown?.id === booking._id && typeof document !== 'undefined' && createPortal(
                            <div
                              className="fixed w-48 bg-white rounded-[16px] shadow-2xl border border-slate-100 py-2 z-[9999] animate-in fade-in zoom-in duration-200 origin-top-right"
                              style={{
                                top: `${Math.max(8, activeDropdown.top)}px`,
                                right: `${Math.max(8, activeDropdown.right)}px`,
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                                onClick={(e) => handleDeleteClick(e, booking)}
                              >
                                <Trash2 size={16} />
                                Delete Booking
                              </button>
                              <button
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-av-orange-light hover:text-av-orange transition-colors disabled:opacity-50"
                                disabled={downloadingId === booking._id}
                                onClick={(e) => handleDownloadInvoice(e, booking._id)}
                              >
                                <Download size={16} />
                                {downloadingId === booking._id ? 'Downloading…' : 'Download Invoice'}
                              </button>
                              <div className="h-px bg-slate-50 my-1 mx-2"></div>
                              <button
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setCancelTarget(booking); }}
                              >
                                <XCircle size={16} />
                                Cancel Booking
                              </button>
                            </div>,
                            document.body
                          )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">No bookings found</h3>
                      <p className="text-slate-500 font-medium max-w-xs mt-1">Try adjusting your filters or search terms to find what you're looking for.</p>
                      <button 
                        onClick={() => {setSearchTerm(''); setActiveFilter('');}}
                        className="mt-6 text-av-orange font-bold hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-800 font-bold">{bookings.length}</span> of <span className="text-slate-800 font-bold">{pagination.total}</span> bookings
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={cn(
                      "w-9 h-9 rounded-lg text-sm font-bold transition-all",
                      currentPage === i + 1 
                        ? "bg-av-orange text-white shadow-md shadow-av-orange/20" 
                        : "text-slate-600 hover:bg-white border border-transparent hover:border-slate-200"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === pagination.pages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size="sm"
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
            <Trash2 className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Booking</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
            Are you sure you want to delete{' '}
            <span className="text-slate-800 font-bold">{deleteTarget?.service?.name || 'this booking'}</span>?
            This action cannot be undone.
          </p>

          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-[16px] font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 px-5 py-3 bg-rose-600 text-white rounded-[16px] font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        size="sm"
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Booking</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
            Are you sure you want to cancel{' '}
            <span className="text-slate-800 font-bold">{cancelTarget?.service?.name || 'this booking'}</span>?
            This cannot be undone.
          </p>
          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={() => setCancelTarget(null)}
              className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-[16px] font-bold hover:bg-slate-200 transition-all"
            >
              Keep Booking
            </button>
            <button
              onClick={confirmCancel}
              disabled={isCancelling}
              className="flex-1 px-5 py-3 bg-amber-500 text-white rounded-[16px] font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCancelling ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Cancelling...</>
              ) : (
                <><XCircle size={16} />Yes, Cancel</>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bank Transfer Receipt Upload Modal */}
      <Modal
        isOpen={!!confirmTarget}
        onClose={() => { setConfirmTarget(null); setReceiptFile(null); setReceiptError(''); }}
        title="Confirm Bank Transfer"
        size="sm"
      >
        <div className="space-y-5 py-2">
          <div className="bg-slate-50 rounded-[16px] p-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Booking</span>
              <span className="font-bold text-slate-900">
                #{confirmTarget?._id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Service</span>
              <span className="font-bold text-slate-900">
                {confirmTarget?.service?.name || 'Inspection'}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 font-medium">
            Upload your bank transfer receipt (PDF only, max 10 MB). Our team will confirm your payment manually.
          </p>

          <div>
            <input
              type="file"
              id="receipt-pdf-input"
              accept=".pdf"
              onChange={handleReceiptFileChange}
              className="hidden"
            />
            <label
              htmlFor="receipt-pdf-input"
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-[16px] cursor-pointer hover:bg-slate-50 hover:border-av-orange/60 transition-all"
            >
              <Upload size={20} className="text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {receiptFile ? receiptFile.name : 'Click to select PDF'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">PDF only, max 10 MB</p>
            </label>
          </div>

          {receiptError && (
            <p className="text-rose-600 text-sm font-bold">{receiptError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setConfirmTarget(null); setReceiptFile(null); setReceiptError(''); }}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-[16px] font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadReceipt}
              disabled={isUploadingReceipt || !receiptFile}
              className="flex-1 px-4 py-2.5 bg-av-orange text-white rounded-[16px] font-bold text-sm hover:bg-av-orange-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploadingReceipt ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
              ) : (
                <><Upload size={14} /> Upload Receipt</>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;
