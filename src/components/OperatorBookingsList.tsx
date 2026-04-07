import React, { useState } from 'react';
import { Check, X, MapPin, Calendar, Users, CreditCard, Loader2 } from 'lucide-react';
import { Booking, Route, BookingStatus } from '../types';

interface OperatorBookingsListProps {
  bookings: Booking[];
  routes: Route[];
  onUpdateStatus: (id: string, status: BookingStatus) => void | Promise<void>;
}

export const OperatorBookingsList: React.FC<OperatorBookingsListProps> = ({
  bookings,
  routes,
  onUpdateStatus
}) => {
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Triage-first sorting: PENDING always at top, then by date descending
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
    return new Date(b.date || b.created_at || Date.now()).getTime() - new Date(a.date || a.created_at || Date.now()).getTime();
  });

  const handleStatusUpdate = async (id: string, newStatus: BookingStatus) => {
    setUpdatingIds(prev => new Set(prev).add(id));
    try {
      await onUpdateStatus(id, newStatus);
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getRouteTitle = (routeId?: string) => {
    const r = routes.find(rt => rt.id === routeId);
    return r ? `${r.from} → ${r.to}` : 'Route details loading...';
  };

  if (sortedBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 bg-[#081221] border border-white/10 rounded-full flex items-center justify-center mb-4">
          <Check size={24} className="text-muted" />
        </div>
        <p className="ui-label text-muted text-[10px] tracking-[0.2em] mb-1">ALL CAUGHT UP</p>
        <p className="text-xs text-muted/60 max-w-xs">No bookings require your attention. New requests will appear here instantly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20 lg:pb-6">
      {sortedBookings.map(booking => {
        const isUpdating = updatingIds.has(booking.id);
        const isPending = booking.status === 'PENDING';

        return (
          <div 
            key={booking.id} 
            className={`bg-[#081221] border rounded-xl p-4 lg:p-5 transition-all duration-200 ${
              isPending ? 'border-gold/30 shadow-[0_0_15px_-5px_rgba(212,175,55,0.15)]' : 'border-white/10'
            }`}
          >
            {/* Header: Passenger & Status */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-semibold text-sm tracking-wide truncate">
                  {booking.customerName || 'Guest Passenger'}
                </h3>
                <p className="ui-label text-[9px] text-muted mt-0.5 font-mono">
                  REF: {(booking as any).reference_code || booking.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <span className={`ui-label text-[8px] px-2 py-1 rounded-full border tracking-wider ${
                booking.status === 'PENDING' ? 'border-gold/40 bg-gold/10 text-gold' :
                booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400' :
                'border-red-400/30 bg-red-400/10 text-red-400'
              }`}>
                {booking.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-4 text-xs text-muted">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-gold/60 shrink-0" />
                <span className="truncate">{getRouteTitle(booking.routeId)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-gold/60 shrink-0" />
                <span>
                  {booking.date ? new Date(booking.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={13} className="text-gold/60 shrink-0" />
                <span>{booking.seats || 1} Seat{(booking.seats || 1) > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard size={13} className="text-gold/60 shrink-0" />
                <span>₱{booking.totalPrice || booking.price || 0} • <span className="text-emerald-400">Paid</span></span>
              </div>
            </div>

            {/* Conditional Action Buttons */}
            {isPending && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg border border-red-400/20 bg-transparent text-red-400 ui-label text-[9px] tracking-[0.2em] hover:bg-red-400/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />}
                  REJECT
                </button>
                <button
                  onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')}
                  disabled={isUpdating}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gold text-ink ui-label text-[9px] tracking-[0.2em] font-bold hover:bg-[#D4AF37] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                  CONFIRM
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
