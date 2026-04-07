import React, { useState } from 'react';
import { Check, X, MapPin, Calendar, Users, CreditCard, Loader2 } from 'lucide-react';
import { Booking, Route, BookingStatus } from '../types';

interface OperatorBookingsListProps {
  bookings: Partial<Booking & Record<string, any>>[];
  routes: Route[];
  operatorId?: string;
  onUpdateStatus: (id: string, status: BookingStatus) => void | Promise<void>;
}

export const OperatorBookingsList: React.FC<OperatorBookingsListProps> = ({
  bookings,
  routes,
  operatorId,
  onUpdateStatus
}) => {
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // FIX: Use snake_case 'operator_id' for filtering as per Supabase schema
  const pendingBookings = bookings
    .filter(b => b.operator_id === operatorId && b.status === 'PENDING')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleStatusUpdate = async (id: string, status: BookingStatus) => {
    setUpdatingIds(prev => new Set(prev).add(id));
    try {
      await onUpdateStatus(id, status);
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // FIX: Use snake_case 'route_id' for lookup
  const getRouteTitle = (routeId?: string) => {
    const r = routes.find(rt => rt.id === routeId);
    return r ? `${r.from} → ${r.to}` : 'Unknown Route';
  };

  if (pendingBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 bg-[#081221] border border-white/10 rounded-full flex items-center justify-center mb-4">
          <Check size={24} className="text-muted" />
        </div>
        <p className="ui-label text-[10px] text-muted mb-2 tracking-[0.2em]">ALL CAUGHT UP</p>
        <p className="text-xs text-muted/60 max-w-xs">No pending bookings require your attention. New requests will appear here instantly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20 lg:pb-6">
      {pendingBookings.map(booking => {
        const isUpdating = updatingIds.has(booking.id);
        const routeId = booking.route_id; // Use snake_case from DB

        return (
          <div 
            key={booking.id} 
            className="bg-[#081221] border border-gold/30 shadow-[0_0_15px_-5px_rgba(212,175,55,0.15)] rounded-xl p-4 lg:p-5 transition-all duration-200"
          >
            {/* Header: Passenger & Status */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-semibold text-sm tracking-wide truncate">
                  {booking.customerName || booking.customer_name || 'Guest Passenger'}
                </h3>
                <p className="ui-label text-[9px] text-muted mt-0.5 font-mono">
                  REF: {booking.reference_code || booking.referenceCode || booking.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <span className="ui-label text-[8px] px-2 py-1 rounded-full bg-gold/10 text-gold border border-gold/40 tracking-wider">
                PENDING
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-4 text-xs text-muted">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-gold/60 shrink-0" />
                <span className="truncate">{getRouteTitle(routeId as string)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-gold/60 shrink-0" />
                <span>
                  {booking.date ? new Date(booking.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={13} className="text-gold/60 shrink-0" />
                <span>{booking.seats} Seat{booking.seats > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard size={13} className="text-gold/60 shrink-0" />
                <span>₱{booking.totalPrice || booking.total_price} • <span className="text-emerald-400">Paid</span></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
              <button
                onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-400/20 bg-transparent text-red-400 ui-label text-[9px] hover:bg-red-400/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />}
                REJECT
              </button>
              <button
                onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')}
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold text-ink ui-label text-[9px] font-bold hover:bg-[#D4AF37] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                CONFIRM
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
