/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BookOpen, Map, Users, CreditCard, BarChart3, 
  UserCircle, Settings as SettingsIcon, Check, X, Plus, 
  MapPin, Calendar, Users as UsersIcon, CreditCard as CreditCardIcon, 
  Loader2, Menu, Trash2, Edit2, ArrowUpRight, ArrowDownRight
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
// OPERATOR BOOKINGS LIST (UX Improved)
// ============================================
const OperatorBookingsView = ({ bookings, routes, onUpdateStatus }: { bookings: Booking[]; routes: Route[]; onUpdateStatus: (id: string, status: BookingStatus) => void | Promise<void> }) => {
  const [updatingIds, setUpdatingIds] = React.useState<Set<string>>(new Set());

  const pendingBookings = bookings.filter(b => b.status === 'PENDING').sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleUpdate = async (id: string, status: BookingStatus) => {
    setUpdatingIds(prev => new Set(prev).add(id));
    try { await onUpdateStatus(id, status); }
    finally { setUpdatingIds(prev => { const next = new Set(prev); next.delete(id); return next; }); }
  };

  if (pendingBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-[#081221] border border-white/10 rounded-full flex items-center justify-center mb-4">
          <Check size={24} className="text-muted" />
        </div>
        <p className="ui-label text-[10px] tracking-[0.2em] text-muted mb-2">ALL CAUGHT UP</p>
        <p className="text-xs text-muted/60 max-w-xs">No pending bookings require your attention.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {pendingBookings.map(booking => {
        const isUpdating = updatingIds.has(booking.id);
        const route = routes.find(r => r.id === booking.routeId);
        return (
          <div key={booking.id} className="bg-[#081221] border border-gold/20 rounded-xl p-4 shadow-[0_0_15px_-5px_rgba(212,175,55,0.15)]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-semibold text-sm">{booking.customerName || 'Guest'}</h3>
                <p className="ui-label text-[9px] text-muted font-mono mt-0.5">REF: {booking.referenceCode || booking.id.slice(0, 8)}</p>
              </div>
              <span className="ui-label text-[8px] px-2 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 tracking-wider">PENDING</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-3 text-xs text-muted">
              <div className="flex items-center gap-2"><MapPin size={13} className="text-gold/60 shrink-0" /><span className="truncate">{route ? `${route.from} → ${route.to}` : 'Unknown Route'}</span></div>
              <div className="flex items-center gap-2"><Calendar size={13} className="text-gold/60 shrink-0" /><span>{new Date(booking.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} • {route?.departureTime || '--'}</span></div>
              <div className="flex items-center gap-2"><UsersIcon size={13} className="text-gold/60 shrink-0" /><span>{booking.seats} Seat{booking.seats > 1 ? 's' : ''}</span></div>
              <div className="flex items-center gap-2"><CreditCardIcon size={13} className="text-gold/60 shrink-0" /><span>₱{booking.totalPrice} • <span className="text-emerald-400">Paid</span></span></div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
              <button onClick={() => handleUpdate(booking.id, 'CANCELLED')} disabled={isUpdating} className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-400/20 text-red-400 ui-label text-[9px] hover:bg-red-400/10 active:scale-[0.98] transition-all disabled:opacity-50">
                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />} REJECT
              </button>
              <button onClick={() => handleUpdate(booking.id, 'ACCEPTED')} disabled={isUpdating} className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold text-ink ui-label text-[9px] font-bold hover:bg-[#D4AF37] active:scale-[0.98] transition-all disabled:opacity-50">
                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} CONFIRM
              </button>
            </div>
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
            {['PASSENGER', 'ROUTE ID', 'DATE', 'STATUS', 'ACTIONS'].map(h => (
              <th key={h} className="ui-label text-[9px] text-muted tracking-[0.2em] p-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {bookings.map(b => (
            <tr key={b.id} className="hover:bg-white/5 transition-colors">
              <td className="p-4 ui-label text-[10px] text-white">{b.customerName || 'Guest'}</td>
              <td className="p-4 ui-label text-[10px] text-muted font-mono">{b.routeId}</td>
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
// MAIN COMPONENT
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

  const filteredBookings = isOperatorPortal ? bookings.filter(b => b.operatorId === operatorId) : bookings;
  const filteredRoutes = isOperatorPortal ? routes.filter(r => r.operatorId === operatorId) : routes;

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
    { id: 'SETTINGS', label: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return <DashboardSummary bookings={filteredBookings} routes={filteredRoutes} />;
      case 'BOOKINGS':
        return isOperatorPortal ? (
          <OperatorBookingsView bookings={filteredBookings} routes={filteredRoutes} onUpdateStatus={onUpdateBookingStatus} />
        ) : (
          <AdminBookingsView bookings={filteredBookings} onUpdateStatus={onUpdateBookingStatus} />
        );
      case 'ROUTES':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-white font-display italic">Route Management</h2>
              <button onClick={() => { setEditingItem(null); setShowRouteModal(true); }} className="bg-gold text-ink px-5 py-2.5 ui-label text-[9px] font-bold tracking-[0.2em] flex items-center gap-2 hover:bg-[#D4AF37] transition-colors">
                <Plus size={14} /> ADD ROUTE
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoutes.map(r => (
                <div key={r.id} className="bg-[#081221] border border-white/10 p-5 rounded-xl hover:border-gold/30 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold text-sm">{r.from} → {r.to}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingItem(r); setShowRouteModal(true); }} className="text-muted hover:text-gold p-1"><Edit2 size={13} /></button>
                      <button onClick={() => onDeleteRoute(r.id)} className="text-muted hover:text-red-400 p-1"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="ui-label text-[8px] text-muted mt-1">{r.mode} • ₱{r.price} • Seats: {r.seatsLeft}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'OPERATORS':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-white font-display italic">Operator Directory</h2>
              <button onClick={() => { setEditingItem(null); setShowOperatorModal(true); }} className="bg-gold text-ink px-5 py-2.5 ui-label text-[9px] font-bold tracking-[0.2em] flex items-center gap-2"><Plus size={14} /> ADD OPERATOR</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operators.map(op => (
                <div key={op.id} className="bg-[#081221] border border-white/10 p-5 rounded-xl">
                  <h3 className="text-white font-semibold text-sm">{op.name}</h3>
                  <p className="ui-label text-[9px] text-muted mt-1">{op.phone} • {op.type}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setEditingItem(op); setShowOperatorModal(true); }} className="ui-label text-[8px] text-gold hover:text-white">EDIT</button>
                    <button onClick={() => onDeleteOperator(op.id)} className="ui-label text-[8px] text-red-400 hover:text-white">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'SETTINGS':
        return (
          <div className="bg-[#081221] border border-white/10 p-8 max-w-2xl rounded-xl text-center">
            <SettingsIcon size={40} className="mx-auto text-muted mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">System Settings</h3>
            <p className="text-muted text-sm">Manage your portal preferences, notification rules, and integrations. Coming soon in the next deploy.</p>
          </div>
        );
      default:
        return <div className="text-muted text-center py-20">Module under construction.</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050B14] z-[60] flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-white/10 flex items-center justify-between px-4 bg-[#081221] z-50">
        <div className="flex items-baseline">
          <span className="font-display text-sm tracking-[0.2em] text-white uppercase">PALAWAN</span>
          <span className="font-ui text-[8px] text-gold tracking-[0.1em] ml-1">{isOperatorPortal ? '.OP' : '.ADMIN'}</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2"><Menu size={20} /></button>
      </header>

      {/* Sidebar */}
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-6">
        <div className="max-w-5xl mx-auto">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {renderContent()}
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showRouteModal && (
          <RouteModal route={editingItem} operators={operators} onClose={() => setShowRouteModal(false)} onSave={editingItem ? onEditRoute : onAddRoute} />
        )}
        {showOperatorModal && (
          <OperatorModal operator={editingItem} onClose={() => setShowOperatorModal(false)} onSave={editingItem ? onEditOperator : onAddOperator} />
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS (Modals)
// ============================================

const RouteModal = ({ route, operators, onClose, onSave }: any) => {
  const [formData, setFormData] = React.useState(route || { from: '', to: '', mode: 'SHUTTLE_SHARED', price: 0, departureTime: '', seatsLeft: 12 });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#050B14]/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#081221] border border-white/10 p-6 max-w-lg w-full relative z-10 rounded-xl">
        <h2 className="text-xl text-white font-display italic mb-6">{route ? 'Edit Route' : 'New Route'}</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {['from', 'to', 'departureTime'].map(f => (
            <input key={f} placeholder={f.toUpperCase()} value={(formData as any)[f]} onChange={e => setFormData({...formData, [f]: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
          ))}
          <input type="number" placeholder="PRICE" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
          <input type="number" placeholder="SEATS" value={formData.seatsLeft} onChange={e => setFormData({...formData, seatsLeft: Number(e.target.value)})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-muted ui-label text-[10px] hover:text-white">CANCEL</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-3 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em]">SAVE</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const OperatorModal = ({ operator, onClose, onSave }: any) => {
  const [formData, setFormData] = React.useState(operator || { name: '', phone: '', type: 'VAN', location: '' });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#050B14]/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#081221] border border-white/10 p-6 max-w-lg w-full relative z-10 rounded-xl">
        <h2 className="text-xl text-white font-display italic mb-6">{operator ? 'Edit Operator' : 'New Operator'}</h2>
        <div className="space-y-3 mb-6">
          {['name', 'phone', 'location'].map(f => (
            <input key={f} placeholder={f.toUpperCase()} value={(formData as any)[f] || ''} onChange={e => setFormData({...formData, [f]: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
          ))}
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded">
            <option value="VAN">Van / Shuttle</option>
            <option value="BOAT">Bangka / Boat</option>
            <option value="PRIVATE">Private Transfer</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-muted ui-label text-[10px] hover:text-white">CANCEL</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-3 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em]">SAVE</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
