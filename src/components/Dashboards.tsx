import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BookOpen, Map, Users, CreditCard, BarChart3, 
  UserCircle, Settings as SettingsIcon, Check, X, Plus, 
  MapPin, Calendar, Users as UsersIcon, CreditCard as CreditCardIcon, 
  Loader2, Menu, Trash2, Edit2, Upload, Image, Copy
} from 'lucide-react';
import { Route, Operator, Booking, BookingStatus } from '../types';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  routes: Route[];
  operators: Operator[];
  bookings: Booking[];
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void | Promise<void>;
  onAddRoute: (route: any) => void;
  onEditRoute: (route: any) => void;
  onDeleteRoute: (id: string) => void;
  onAddOperator: (op: any) => void;
  onEditOperator: (op: any) => void;
  onDeleteOperator: (id: string) => void;
  onBack: () => void;
  isOperatorPortal?: boolean;
  operatorId?: string;
}

type AdminTab = 'DASHBOARD' | 'BOOKINGS' | 'ROUTES' | 'OPERATORS' | 'PAYMENTS' | 'REPORTS' | 'PASSENGERS' | 'SETTINGS';

// ============================================
// OPERATOR PROFILE SETTINGS (FULL FORM)
// ============================================
const OperatorProfileSettings = ({ operator, onUpdate }: { operator: any; onUpdate: (op: any) => void }) => {
  const [formData, setFormData] = React.useState({
    name: operator?.name || '',
    phone: operator?.phone || '',
    whatsapp: operator?.whatsapp || '',
    email: operator?.email || '',
    location: operator?.location || '',
    description: operator?.description || '',
    type: operator?.type || 'VAN',
    passkey: operator?.passkey || '',
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [vehicleImages, setVehicleImages] = React.useState<string[]>(operator?.vehicle_photos || operator?.images || []);
  const [permitImage, setPermitImage] = React.useState<string>(operator?.permits?.[0] || '');
  const [uploadingVehicle, setUploadingVehicle] = React.useState(false);
  const [uploadingPermit, setUploadingPermit] = React.useState(false);

  const uploadImage = async (file: File, bucket: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleVehicleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingVehicle(true);
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file, 'vehicle-photos');
      if (url) urls.push(url);
    }
    setVehicleImages(prev => [...prev, ...urls]);
    setUploadingVehicle(false);
  };

  const handlePermitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPermit(true);
    const url = await uploadImage(file, 'operator-permits');
    if (url) setPermitImage(url);
    setUploadingPermit(false);
  };

  const handleSave = async () => {
    if (!operator?.id) return;
    setIsSaving(true);
    
    // Explicitly map fields to prevent sending undefined or extra properties
    const updateData = {
      name: formData.name,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      location: formData.location,
      description: formData.description,
      type: formData.type,
      passkey: formData.passkey || '',
      vehicle_photos: vehicleImages,
      images: vehicleImages,
      permits: permitImage ? [permitImage] : [],
    };

    const { error } = await supabase
      .from('operators')
      .update(updateData)
      .eq('id', operator.id);

    if (error) {
      console.error('Error updating operator:', error.message, error.details);
      alert(`Failed to save: ${error.message}`);
    } else {
      onUpdate({ ...operator, ...updateData });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setIsSaving(false);
  };

  const [isAssigning, setIsAssigning] = React.useState(false);

  const handleAssignAllRoutes = async () => {
    if (!operator?.id) return;
    if (!confirm('Link ALL existing routes to this operator? This will overwrite previous assignments.')) return;
    
    setIsAssigning(true);
    const { error } = await supabase
      .from('routes')
      .update({ operator_id: operator.id })
      .filter('id', 'not.is', null);

    if (error) {
      alert(`Error linking routes: ${error.message}`);
    } else {
      alert('All routes successfully linked to this operator!');
      window.location.reload();
    }
    setIsAssigning(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-white font-display italic">Operator Profile</h2>
        <button 
          onClick={handleAssignAllRoutes}
          disabled={isAssigning}
          className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 ui-label text-[8px] tracking-[0.2em] hover:bg-emerald-500/20 transition-all flex items-center gap-2"
        >
          {isAssigning ? <Loader2 size={12} className="animate-spin" /> : <Map Pin size={12} />}
          ASSIGN ALL ROUTES
        </button>
      </div>

      <div className="bg-[#081221] border border-white/10 rounded-xl p-6 space-y-4">
        <p className="ui-label text-[9px] text-gold tracking-[0.2em]">BASIC INFORMATION</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { field: 'name', label: 'COMPANY NAME' },
            { field: 'phone', label: 'PHONE NUMBER' },
            { field: 'whatsapp', label: 'WHATSAPP' },
            { field: 'email', label: 'EMAIL' },
            { field: 'location', label: 'BASE LOCATION' },
          ].map(({ field, label }) => (
            <div key={field} className="space-y-1">
              <label className="ui-label text-[8px] text-muted tracking-[0.2em]">{label}</label>
              <input
                value={(formData as any)[field]}
                onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded transition-colors"
              />
            </div>
          ))}
          <div className="space-y-1">
            <label className="ui-label text-[8px] text-muted tracking-[0.2em]">SERVICE TYPE</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded transition-colors"
            >
              <option value="VAN">Van / Shuttle (Land Transport)</option>
              <option value="BOAT">Bangka / Boat (Island Hopping)</option>
              <option value="PRIVATE">Private Transfer</option>
              <option value="BOTH">Both Land & Sea</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="ui-label text-[8px] text-muted tracking-[0.2em]">PORTAL PASSKEY</label>
            <input
              value={formData.passkey}
              onChange={e => setFormData({ ...formData, passkey: e.target.value })}
              placeholder="e.g. OP123"
              className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-gold outline-none focus:border-gold rounded transition-colors font-mono tracking-wider"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="ui-label text-[8px] text-muted tracking-[0.2em]">DESCRIPTION</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded resize-none transition-colors"
            placeholder="Describe your service to passengers..."
          />
        </div>
      </div>

      <div className="bg-[#081221] border border-white/10 rounded-xl p-6 space-y-4">
        <p className="ui-label text-[9px] text-gold tracking-[0.2em]">VEHICLE / BOAT PHOTOS</p>
        <div className="grid grid-cols-3 gap-3">
          {vehicleImages.map((url, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setVehicleImages(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full w-5 h-5 items-center justify-center hidden group-hover:flex text-xs"
              >×</button>
            </div>
          ))}
          <label className="aspect-video rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-gold/40 transition-colors">
            {uploadingVehicle ? (
              <Loader2 size={20} className="text-muted animate-spin" />
            ) : (
              <>
                <Upload size={20} className="text-muted mb-1" />
                <span className="ui-label text-[8px] text-muted">ADD PHOTO</span>
              </>
            )}
            <input type="file" accept="image/*" multiple onChange={handleVehicleUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-[#081221] border border-white/10 rounded-xl p-6 space-y-4">
        <p className="ui-label text-[9px] text-gold tracking-[0.2em]">BUSINESS PERMIT / LICENSE</p>
        {permitImage ? (
          <div className="relative rounded-lg overflow-hidden border border-white/10 group">
            <img src={permitImage} alt="Permit" className="w-full max-h-48 object-contain bg-[#050B14]" />
            <button
              onClick={() => setPermitImage('')}
              className="absolute top-2 right-2 bg-red-500/80 text-white rounded px-2 py-1 ui-label text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
            >REMOVE</button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border border-dashed border-white/20 rounded-lg p-8 cursor-pointer hover:border-gold/40 transition-colors">
            {uploadingPermit ? (
              <Loader2 size={24} className="text-muted animate-spin" />
            ) : (
              <>
                <Image size={24} className="text-muted mb-2" />
                <span className="ui-label text-[9px] text-muted">UPLOAD PERMIT / LICENSE IMAGE</span>
                <span className="ui-label text-[8px] text-muted/50 mt-1">JPG, PNG accepted</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handlePermitUpload} className="hidden" />
          </label>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-4 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em] hover:bg-[#D4AF37] disabled:opacity-50 transition-all rounded"
      >
        {isSaving ? 'SAVING...' : saved ? '✓ SAVED!' : 'SAVE PROFILE'}
      </button>
    </div>
  );
};

// ============================================
// OPERATOR BOOKINGS LIST
// ============================================
const OperatorBookingsView = ({ bookings, routes, onUpdateStatus }: { bookings: Booking[]; routes: Route[]; onUpdateStatus: (id: string, status: BookingStatus) => void | Promise<void> }) => {
  const [updatingIds, setUpdatingIds] = React.useState<Set<string>>(new Set());

  const statusOrder: Record<string, number> = { PENDING: 0, ACCEPTED: 1, CONFIRMED: 2, COMPLETED: 3, CANCELLED: 4 };
  const statusColor = (status: string) => {
    if (status === 'PENDING') return 'bg-gold/10 text-gold border border-gold/30';
    if (status === 'ACCEPTED' || status === 'CONFIRMED') return 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30';
    if (status === 'CANCELLED') return 'bg-red-400/10 text-red-400 border border-red-400/30';
    return 'bg-muted/10 text-muted border border-muted/20';
  };

  const allBookings = bookings.sort((a, b) => {
    const orderDiff = (statusOrder[(a as any).status] ?? 9) - (statusOrder[(b as any).status] ?? 9);
    if (orderDiff !== 0) return orderDiff;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const handleUpdate = async (id: string, status: BookingStatus) => {
    setUpdatingIds(prev => new Set(prev).add(id));
    try { await onUpdateStatus(id, status); }
    finally { setUpdatingIds(prev => { const next = new Set(prev); next.delete(id); return next; }); }
  };

  if (allBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-[#081221] border border-white/10 rounded-full flex items-center justify-center mb-4">
          <Check size={24} className="text-muted" />
        </div>
        <p className="ui-label text-[10px] tracking-[0.2em] text-muted mb-2">NO BOOKINGS YET</p>
        <p className="text-xs text-muted/60 max-w-xs">When customers book your routes, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {allBookings.map(booking => {
        const isUpdating = updatingIds.has(booking.id);
        const isPending = booking.status === 'PENDING';
        const route = routes.find(r => r.id === (booking as any).route_id || r.id === booking.routeId);
        return (
          <div key={booking.id} className={`bg-[#081221] border rounded-xl p-4 ${isPending ? 'border-gold/20 shadow-[0_0_15px_-5px_rgba(212,175,55,0.15)]' : 'border-white/10'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-semibold text-sm">{(booking as any).customer_name || booking.customerName || 'Guest'}</h3>
                <p className="ui-label text-[9px] text-muted font-mono mt-0.5">REF: {(booking as any).reference_code || booking.id.slice(0, 8)}</p>
              </div>
              <span className={`ui-label text-[8px] px-2 py-1 rounded-full tracking-wider ${statusColor((booking as any).status || 'PENDING')}`}>{(booking as any).status || 'PENDING'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-3 text-xs text-muted">
              <div className="flex items-center gap-2"><MapPin size={13} className="text-gold/60 shrink-0" /><span className="truncate">{route ? `${route.from} → ${route.to}` : 'Unknown Route'}</span></div>
              <div className="flex items-center gap-2"><Calendar size={13} className="text-gold/60 shrink-0" /><span>{new Date(booking.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span></div>
              <div className="flex items-center gap-2"><UsersIcon size={13} className="text-gold/60 shrink-0" /><span>{booking.seats} Seat{booking.seats > 1 ? 's' : ''}</span></div>
              <div className="flex items-center gap-2"><CreditCardIcon size={13} className="text-gold/60 shrink-0" /><span>₱{(booking as any).total_price || booking.totalPrice} • <span className="text-emerald-400">Paid</span></span></div>
            </div>
            {isPending && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <button onClick={() => handleUpdate(booking.id, 'CANCELLED')} disabled={isUpdating} className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-400/20 text-red-400 ui-label text-[9px] hover:bg-red-400/10 active:scale-[0.98] transition-all disabled:opacity-50">
                  {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />} REJECT
                </button>
                <button onClick={() => handleUpdate(booking.id, 'ACCEPTED')} disabled={isUpdating} className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold text-ink ui-label text-[9px] font-bold hover:bg-[#D4AF37] active:scale-[0.98] transition-all disabled:opacity-50">
                  {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} CONFIRM
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// ADMIN BOOKINGS TABLE
// ============================================
const AdminBookingsView = ({ bookings, onUpdateStatus }: { bookings: Booking[]; onUpdateStatus: (id: string, status: BookingStatus) => void | Promise<void> }) => (
  <div className="bg-[#081221] border border-white/10 overflow-hidden rounded-xl">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-[#050B14] border-b border-white/10">
          <tr>
            {['PASSENGER', 'ROUTE', 'DATE', 'STATUS', 'ACTIONS'].map(h => (
              <th key={h} className="ui-label text-[9px] text-muted tracking-[0.2em] p-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {bookings.map(b => (
            <tr key={b.id} className="hover:bg-white/5 transition-colors">
              <td className="p-4 ui-label text-[10px] text-white">{(b as any).customer_name || b.customerName || 'Guest'}</td>
              <td className="p-4 ui-label text-[10px] text-muted font-mono">{(b as any).route_id || b.routeId}</td>
              <td className="p-4 ui-label text-[10px] text-muted">{new Date(b.date).toLocaleDateString()}</td>
              <td className="p-4"><span className={`ui-label text-[9px] px-2 py-1 rounded-full ${b.status === 'PENDING' ? 'bg-gold/10 text-gold' : b.status === 'ACCEPTED' || b.status === 'CONFIRMED' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>{b.status}</span></td>
              <td className="p-4">
                {b.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <button onClick={() => onUpdateStatus(b.id, 'ACCEPTED')} className="text-gold hover:text-white ui-label text-[9px]">ACCEPT</button>
                    <button onClick={() => onUpdateStatus(b.id, 'CANCELLED')} className="text-red-400 hover:text-white ui-label text-[9px]">REJECT</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ============================================
// DASHBOARD SUMMARY
// ============================================
// ============================================
// OPERATOR DAILY VIEW — TODAY'S BOOKINGS + MONTH SUMMARY
// ============================================
const OperatorDashboardView = ({ bookings, routes }: { bookings: Booking[]; routes: Route[] }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === today);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthBookings = bookings.filter(b => (b.date || '').startsWith(thisMonth));

  return (
    <div className="space-y-6">
      {/* TODAY'S BOOKINGS */}
      <div>
        <h3 className="ui-label text-[9px] text-gold tracking-[0.2em] mb-4">TODAY'S BOOKINGS — {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
        {todayBookings.length === 0 && (
          <div className="bg-[#081221] border border-white/10 rounded-xl p-8 text-center">
            <Calendar size={32} className="text-muted mx-auto mb-3" />
            <p className="ui-label text-[10px] text-muted tracking-[0.2em]">NO BOOKINGS FOR TODAY</p>
          </div>
        )}
        <div className="space-y-3">
          {todayBookings.map(b => {
            const route = routes.find(r => r.id === (b as any).route_id || r.id === (b as any).routeId);
            const statusColor = (s: string) => {
              if (s === 'PENDING') return 'bg-gold/10 text-gold border border-gold/30';
              if (s === 'ACCEPTED' || s === 'CONFIRMED') return 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30';
              return 'bg-muted/10 text-muted border';
            };
            return (
              <div key={b.id} className="bg-[#081221] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{(b as any).customer_name || b.customerName || 'Guest'}</p>
                  <p className="ui-label text-[8px] text-muted mt-0.5">{route ? `${route.from} → ${route.to}` : 'Unknown route'}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="ui-label text-[7px] text-muted">PIN</p>
                    <p className="font-mono text-xs text-gold tracking-wider">{(b as any).pin_code || '—'}</p>
                  </div>
                  <span className={`ui-label text-[8px] px-2 py-1 rounded-full tracking-wider ${statusColor((b as any).status || 'PENDING')}`}>{(b as any).status || 'PENDING'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* THIS MONTH SUMMARY */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#081221] border border-white/10 p-4 rounded-xl text-center">
          <p className="ui-label text-[7px] text-muted tracking-[0.2em]">THIS MONTH</p>
          <p className="text-xl text-white font-display mt-1">{monthBookings.length}</p>
        </div>
        <div className="bg-[#081221] border border-white/10 p-4 rounded-xl text-center">
          <p className="ui-label text-[7px] text-muted tracking-[0.2em]">PENDING</p>
          <p className="text-xl text-gold font-display mt-1">{monthBookings.filter(b => b.status === 'PENDING').length}</p>
        </div>
        <div className="bg-[#081221] border border-white/10 p-4 rounded-xl text-center">
          <p className="ui-label text-[7px] text-muted tracking-[0.2em]">CONFIRMED</p>
          <p className="text-xl text-emerald-400 font-display mt-1">{monthBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'ACCEPTED').length}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ADMIN DASHBOARD SUMMARY (3 CARD VIEW)
// ============================================
const DashboardSummary = ({ bookings, routes }: { bookings: Booking[]; routes: Route[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <div className="bg-[#081221] border border-white/10 p-5">
      <p className="ui-label text-[9px] text-muted tracking-[0.2em]">TOTAL BOOKINGS</p>
      <p className="text-2xl text-white font-display mt-1">{bookings.length}</p>
    </div>
    <div className="bg-[#081221] border border-white/10 p-5">
      <p className="ui-label text-[9px] text-muted tracking-[0.2em]">ACTIVE ROUTES</p>
      <p className="text-2xl text-gold font-display mt-1">{routes.length}</p>
    </div>
    <div className="bg-[#081221] border border-white/10 p-5">
      <p className="ui-label text-[9px] text-muted tracking-[0.2em]">PENDING ACTIONS</p>
      <p className="text-2xl text-white font-display mt-1">{bookings.filter(b => b.status === 'PENDING').length}</p>
    </div>
  </div>
);

// ============================================
// ROUTES VIEW
// ============================================
const RoutesView = ({ routes, onAdd, onEdit, onDelete }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl text-white font-display italic">Route Management</h2>
      <button onClick={onAdd} className="bg-gold text-ink px-5 py-2.5 ui-label text-[9px] font-bold tracking-[0.2em] flex items-center gap-2 hover:bg-[#D4AF37] transition-colors">
        <Plus size={14} /> ADD ROUTE
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {routes.map((r: any) => (
        <div key={r.id} className="bg-[#081221] border border-white/10 p-5 rounded-xl hover:border-gold/30 transition-all">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-white font-semibold text-sm">{r.from} → {r.to}</h3>
            <div className="flex gap-2">
              <button onClick={() => onEdit(r)} className="text-muted hover:text-gold p-1"><Edit2 size={13} /></button>
              <button onClick={() => onDelete(r.id)} className="text-muted hover:text-red-400 p-1"><Trash2 size={13} /></button>
            </div>
          </div>
          <p className="ui-label text-[8px] text-muted mt-1">{r.mode} • ₱{r.price} • Departs: {r.departureTime}</p>
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// OPERATORS VIEW — WITH PASSKEY VISIBLE TO ADMIN
// ============================================
const OperatorsView = ({ operators, onAdd, onEdit, onDelete }: any) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, passkey: string) => {
    navigator.clipboard.writeText(passkey || '');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-white font-display italic">Operator Directory</h2>
        <button onClick={onAdd} className="bg-gold text-ink px-5 py-2.5 ui-label text-[9px] font-bold tracking-[0.2em] flex items-center gap-2"><Plus size={14} /> ADD OPERATOR</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operators.map((op: any) => (
          <div key={op.id} className="bg-[#081221] border border-white/10 p-5 rounded-xl hover:border-white/20 transition-all">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-semibold text-sm">{op.name}</h3>
                <p className="ui-label text-[9px] text-muted mt-0.5">{op.phone}</p>
                <p className="ui-label text-[9px] text-muted">{op.location}</p>
              </div>
              <span className={`ui-label text-[8px] px-2 py-1 rounded-full shrink-0 ${
                op.type === 'BOAT' 
                  ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20' 
                  : op.type === 'BOTH'
                  ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20'
                  : 'bg-gold/10 text-gold border border-gold/20'
              }`}>
                {op.type === 'BOAT' ? 'ISLAND HOPPING' : op.type === 'BOTH' ? 'LAND & SEA' : 'LAND TRANSPORT'}
              </span>
            </div>

            {/* Passkey Box */}
            <div className="bg-[#050B14] border border-white/5 rounded-lg p-3 mb-3 flex items-center justify-between">
              <div>
                <p className="ui-label text-[7px] text-muted tracking-[0.2em] mb-1">PASSKEY</p>
                <p className="font-mono text-[11px] text-gold tracking-wider">
                  {op.passkey || <span className="text-muted italic text-[9px]">not set</span>}
                </p>
              </div>
              {op.passkey && (
                <button
                  onClick={() => handleCopy(op.id, op.passkey)}
                  className="flex items-center gap-1 ui-label text-[8px] text-muted hover:text-gold transition-colors px-2 py-1 rounded border border-white/5 hover:border-gold/20"
                >
                  <Copy size={11} />
                  {copiedId === op.id ? 'COPIED!' : 'COPY'}
                </button>
              )}
            </div>

            {/* Vehicle Photos */}
            {op.vehicle_photos?.length > 0 && (
              <div className="flex gap-1 mb-3 overflow-hidden rounded">
                {op.vehicle_photos.slice(0, 3).map((url: string, i: number) => (
                  <img key={i} src={url} alt="" className="w-1/3 aspect-video object-cover rounded" />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-white/5">
              <button onClick={() => onEdit(op)} className="ui-label text-[8px] text-gold hover:text-white transition-colors">EDIT</button>
              <span className="text-white/10">|</span>
              <button onClick={() => onDelete(op.id)} className="ui-label text-[8px] text-red-400 hover:text-white transition-colors">DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN ADMIN DASHBOARD COMPONENT
// ============================================
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  routes, operators, bookings, onUpdateBookingStatus,
  onAddRoute, onEditRoute, onDeleteRoute, onAddOperator, onEditOperator, onDeleteOperator,
  onBack, isOperatorPortal = false, operatorId
}) => {
  const [activeTab, setActiveTab] = React.useState<AdminTab>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [showRouteModal, setShowRouteModal] = React.useState(false);
  const [showOperatorModal, setShowOperatorModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  const filteredBookings = isOperatorPortal 
    ? bookings.filter(b => (b as any).operator_id === operatorId)
    : bookings;

  const filteredRoutes = isOperatorPortal
    ? routes.filter(r => {
        const isOwner = (r as any).operator_id === operatorId;
        if (!isOwner) return false;
        if (!currentOperator) return true;

        if (currentOperator.type === 'VAN') {
          return ['SHUTTLE_SHARED', 'SHUTTLE_PRIVATE', 'PRIVATE_4X4'].includes(r.mode);
        }
        if (currentOperator.type === 'BOAT') {
          return r.mode === 'ISLAND_HOPPING';
        }
        return true;
      })
    : routes;

  const currentOperator = operators.find(o => o.id === operatorId);

  const sidebarItems = isOperatorPortal ? [
    { id: 'DASHBOARD', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'BOOKINGS', label: 'My Bookings', icon: BookOpen },
    { id: 'ROUTES', label: 'My Routes', icon: Map },
    { id: 'SETTINGS', label: 'Profile Settings', icon: SettingsIcon },
  ] : [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'BOOKINGS', label: 'Bookings', icon: BookOpen },
    { id: 'ROUTES', label: 'Routes', icon: Map },
    { id: 'OPERATORS', label: 'Operators', icon: Users },
    { id: 'PAYMENTS', label: 'Payments', icon: CreditCard },
    { id: 'REPORTS', label: 'Reports', icon: BarChart3 },
    { id: 'PASSENGERS', label: 'Passengers', icon: UserCircle },
    { id: 'SETTINGS', label: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return isOperatorPortal ? (
          <OperatorDashboardView bookings={filteredBookings} routes={filteredRoutes} />
        ) : (
          <DashboardSummary bookings={filteredBookings} routes={filteredRoutes} />
        );
      case 'BOOKINGS':
        return isOperatorPortal ? (
          <OperatorBookingsView bookings={filteredBookings} routes={filteredRoutes} onUpdateStatus={onUpdateBookingStatus} />
        ) : (
          <AdminBookingsView bookings={filteredBookings} onUpdateStatus={onUpdateBookingStatus} />
        );
      case 'ROUTES':
        return <RoutesView routes={filteredRoutes} onAdd={() => { setEditingItem(null); setShowRouteModal(true); }} onEdit={(r: any) => { setEditingItem(r); setShowRouteModal(true); }} onDelete={onDeleteRoute} />;
      case 'OPERATORS':
        return <OperatorsView operators={operators} onAdd={() => { setEditingItem(null); setShowOperatorModal(true); }} onEdit={(op: any) => { setEditingItem(op); setShowOperatorModal(true); }} onDelete={onDeleteOperator} />;
      case 'PAYMENTS': return <div className="text-muted text-center py-20">Payments Module — Coming Soon</div>;
      case 'REPORTS': return <div className="text-muted text-center py-20">Reports Module — Coming Soon</div>;
      case 'PASSENGERS': return <div className="text-muted text-center py-20">Passengers Module — Coming Soon</div>;
      case 'SETTINGS':
        return isOperatorPortal ? (
          <OperatorProfileSettings operator={currentOperator} onUpdate={onEditOperator} />
        ) : (
          <div className="text-muted text-center py-20">Admin Settings — Coming Soon</div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050B14] z-[60] flex flex-col lg:flex-row overflow-hidden font-sans">
      <header className="lg:hidden h-16 border-b border-white/10 flex items-center justify-between px-4 bg-[#081221] z-50">
        <div className="flex items-baseline">
          <span className="font-display text-sm tracking-[0.2em] text-white uppercase">PALAWAN</span>
          <span className="font-ui text-[8px] text-gold tracking-[0.1em] ml-1">{isOperatorPortal ? '.OP' : '.ADMIN'}</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2"><Menu size={20} /></button>
      </header>

      <aside className={`fixed lg:relative inset-y-0 left-0 w-64 bg-[#081221] border-r border-white/10 z-40 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10 flex items-baseline mb-4">
          <span className="font-display text-base tracking-[0.2em] text-white uppercase">PALAWAN</span>
          <span className="font-ui text-[10px] text-gold tracking-[0.1em] ml-1">{isOperatorPortal ? '.OP' : '.ADMIN'}</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-5 right-4 text-muted"><X size={18} /></button>
        </div>
        <nav className="px-3 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as AdminTab); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 ui-label text-[10px] tracking-[0.15em] rounded-lg transition-all ${
                activeTab === item.id ? 'bg-gold/10 text-gold border border-gold/20' : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-0 w-full px-4">
          <button onClick={onBack} className="w-full border border-white/10 text-muted py-3 ui-label text-[9px] tracking-[0.2em] hover:text-white hover:border-white/20 transition-all">
            ← EXIT PORTAL
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-6">
        <div className="max-w-5xl mx-auto">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {renderContent()}
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showRouteModal && (
          <RouteModal route={editingItem} onClose={() => setShowRouteModal(false)} onSave={editingItem ? onEditRoute : onAddRoute} />
        )}
        {showOperatorModal && (
          <OperatorModal operator={editingItem} onClose={() => setShowOperatorModal(false)} onSave={editingItem ? onEditOperator : onAddOperator} />
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// MODAL COMPONENTS
// ============================================
const RouteModal = ({ route, onClose, onSave }: any) => {
  const [formData, setFormData] = React.useState(route || { from: '', to: '', mode: 'SHUTTLE_SHARED', price: '', departureTime: '', seatsLeft: 12 });
  const cities = ['Puerto Princesa', 'Port Barton', 'San Vicente', 'El Nido'];

  return (
    <<motionmotion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <<divdiv className="absolute inset-0 bg-[#050B14]/90 backdrop-blur-sm" onClick={onClose} />
      <<motionmotion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#081221] border border-white/10 p-6 max-w-lg w-full relative z-10 rounded-xl">
        <<hh2 className="text-xl text-white font-display italic mb-6">{route ? 'Edit Route' : 'New Route'}</h2>
        <<divdiv className="grid grid-cols-2 gap-3 mb-6">
          <<divdiv className="space-y-1">
            <<labellabel className="ui-label text-[8px] text-muted tracking-[0.2em]">FROM</label>
            <<selectselect
              value={(formData as any).from}
              onChange={e => setFormData({...formData, from: e.target.value})}
              className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded"
            >
              <<optionoption value="">Select Location</option>
              {cities.map(c => <<optionoption key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <<divdiv className="space-y-1">
            <<labellabel className=\"ui-label text-[8px] text-muted tracking-[0.2em]\">TO</label>
            <<selectselect
              value={(formData as any).to}
              onChange={e => setFormData({...formData, to: e.target.value})}
              className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded"
            >
              <<optionoption value="">Select Location</option>
              {cities.map(c => <<optionoption key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <<divdiv className="space-y-1">
            <<labellabel className="ui-label text-[8px] text-muted tracking-[0.2em]">DEPARTURE</label>
            <<inputinput 
              type="time"
              value={(formData as any).departureTime || ''} 
              onChange={e => setFormData({...formData, departureTime: e.target.value})} 
              className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" 
            />
          </div>
          <<divdiv className="space-y-1">
            <<labellabel className="ui-label text-[8px] text-muted tracking-[0.2em]">PRICE (₱)</label>
            <<inputinput 
              type="number" 
              placeholder="e.g. 600" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})} 
              className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" 
            />
          </div>
          <<selectselect value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})} className="col-span-2 w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded">
            <<optionoption value="SHUTTLE_SHARED">Shared Shuttle</option>
            <<optionoption value="SHUTTLE_PRIVATE">Private Shuttle</option>
            <<optionoption value="PRIVATE_4X4">Private 4x4</option>
            <<optionoption value="BANGKA">Bangka Boat</option>
            <<optionoption value="ISLAND_HOPPING">Island Hopping</option>
          </select>
        </div>
        <<divdiv className="flex gap-3">
          <<buttonbutton onClick={onClose} className="flex-1 py-3 border border-white/10 text-muted ui-label text-[10px] hover:text-white">CANCEL</button>
          <<buttonbutton onClick={() => onSave(formData)} className="flex-1 py-3 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em]">SAVE</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
};

const OperatorModal = ({ operator, onClose, onSave }: any) => {
  const [formData, setFormData] = React.useState(operator || { name: '', phone: '', whatsapp: '', email: '', type: 'VAN', location: '', description: '', passkey: '' });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#050B14]/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#081221] border border-white/10 p-6 max-w-lg w-full relative z-10 rounded-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl text-white font-display italic mb-6">{operator ? 'Edit Operator' : 'New Operator'}</h2>
        <div className="space-y-3 mb-6">
          {['name', 'phone', 'whatsapp', 'email', 'location'].map(f => (
            <input key={f} placeholder={f.toUpperCase()} value={(formData as any)[f] || ''} onChange={e => setFormData({...formData, [f]: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
          ))}
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded">
            <option value="VAN">Van / Shuttle (Land Transport)</option>
            <option value="BOAT">Bangka / Boat (Island Hopping)</option>
            <option value="PRIVATE">Private Transfer</option>
            <option value="BOTH">Both Land & Sea</option>
          </select>
          <textarea placeholder="DESCRIPTION" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded resize-none" />
          <input placeholder="PASSKEY (e.g. OP123)" value={formData.passkey || ''} onChange={e => setFormData({...formData, passkey: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-gold outline-none focus:border-gold rounded font-mono tracking-wider" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-muted ui-label text-[10px] hover:text-white">CANCEL</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-3 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em]">SAVE</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
