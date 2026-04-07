import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BookOpen, Map, Settings as SettingsIcon, Users, 
  CreditCard, BarChart3, UserCircle, Plus, ExternalLink, Trash2, 
  FileText, Shield, Clock, Check, X, Menu
} from 'lucide-react';
import { Route, BookingStatus, Operator } from '../types';
import { supabase } from '../lib/supabase';
import { OperatorBookingsList } from './OperatorBookingsList';

// ============================================
// SUB-COMPONENTS (Preserved from your codebase)
// ============================================

const DashboardView = ({ bookings, routes, onUpdateStatus, isOperatorPortal }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-[#081221] border border-white/10 p-6">
        <p className="ui-label text-[9px] text-muted tracking-[0.2em]">TOTAL BOOKINGS</p>
        <p className="text-2xl text-white font-display mt-1">{bookings?.length || 0}</p>
      </div>
      <div className="bg-[#081221] border border-white/10 p-6">
        <p className="ui-label text-[9px] text-muted tracking-[0.2em]">ACTIVE ROUTES</p>
        <p className="text-2xl text-gold font-display mt-1">{routes?.length || 0}</p>
      </div>
      <div className="bg-[#081221] border border-white/10 p-6">
        <p className="ui-label text-[9px] text-muted tracking-[0.2em]">PENDING ACTIONS</p>
        <p className="text-2xl text-white font-display mt-1">{bookings?.filter((b: any) => b.status === 'PENDING').length || 0}</p>
      </div>
    </div>
  </div>
);

const BookingsView = ({ bookings, onManualBooking, onUpdateStatus }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl text-white font-display italic">Booking Management</h2>
      <button onClick={onManualBooking} className="bg-gold text-ink px-6 py-3 ui-label text-[10px] font-bold tracking-[0.2em] flex items-center gap-2 hover:bg-[#D4AF37] transition-colors">
        <Plus size={14} /> MANUAL BOOKING
      </button>
    </div>
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
            {bookings?.map((b: any) => (
              <tr key={b.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 ui-label text-[10px] text-white">{b.customerName || 'Guest'}</td>
                <td className="p-4 ui-label text-[10px] text-muted">{b.routeId}</td>
                <td className="p-4 ui-label text-[10px] text-muted">{new Date(b.date).toLocaleDateString()}</td>
                <td className="p-4"><span className={`ui-label text-[9px] px-2 py-1 rounded-full ${b.status === 'PENDING' ? 'bg-gold/10 text-gold' : 'bg-emerald-400/10 text-emerald-400'}`}>{b.status}</span></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {b.status === 'PENDING' && <>
                      <button onClick={() => onUpdateStatus(b.id, 'ACCEPTED')} className="text-gold hover:text-white ui-label text-[9px]">ACCEPT</button>
                      <button onClick={() => onUpdateStatus(b.id, 'CANCELLED')} className="text-red-400 hover:text-white ui-label text-[9px]">REJECT</button>
                    </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const RoutesView = ({ routes, onAdd, onEdit, onDelete }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl text-white font-display italic">Route Management</h2>
      <button onClick={onAdd} className="bg-gold text-ink px-6 py-3 ui-label text-[10px] font-bold tracking-[0.2em] flex items-center gap-2"><Plus size={14} /> CREATE ROUTE</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {routes?.map((r: Route) => (
        <div key={r.id} className="bg-[#081221] border border-white/10 p-6 rounded-xl hover:border-gold/30 transition-all">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-white font-semibold text-sm">{r.from} → {r.to}</h3>
              <p className="ui-label text-[8px] text-muted mt-1">{r.mode} • ₱{r.price}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(r)} className="text-muted hover:text-gold ui-label text-[8px]">EDIT</button>
              <button onClick={() => onDelete(r.id)} className="text-muted hover:text-red-400 ui-label text-[8px]">DEL</button>
            </div>
          </div>
          <p className="ui-label text-[9px] text-gold/80">Departs: {r.departureTime} • Seats: {r.seatsLeft}</p>
        </div>
      ))}
    </div>
  </div>
);

const OperatorsView = ({ operators, onAdd, onEdit, onDelete }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl text-white font-display italic">Operator Directory</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {operators?.map((op: any) => (
        <div key={op.id} className="bg-[#081221] border border-white/10 p-6 rounded-xl">
          <h3 className="text-white font-semibold text-sm">{op.name}</h3>
          <p className="ui-label text-[9px] text-muted mt-1">{op.phone} • {op.location || 'Palawan'}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => onEdit(op)} className="ui-label text-[8px] text-gold hover:text-white">EDIT</button>
            <button onClick={() => onDelete(op.id)} className="ui-label text-[8px] text-red-400 hover:text-white">DELETE</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const OperatorProfileSettings = ({ operator, onUpdate }: any) => {
  const [formData, setFormData] = React.useState({
    name: operator?.name || '', phone: operator?.phone || '', whatsapp: operator?.whatsapp || '',
    email: operator?.email || '', description: operator?.description || '', location: operator?.location || ''
  });
  const [vehiclePhotos, setVehiclePhotos] = React.useState<string[]>(operator?.vehicle_photos || []);
  const [permits, setPermits] = React.useState<any[]>(operator?.permits || []);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await supabase.from('operators').update(formData).eq('id', operator.id);
      onUpdate({ ...operator, ...formData });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="bg-[#081221] border border-white/10 p-6 lg:p-8 rounded-xl space-y-6">
        <h3 className="ui-label text-[10px] text-gold tracking-[0.2em]">OPERATOR PROFILE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['name', 'phone', 'whatsapp', 'email'].map(field => (
            <div key={field} className="space-y-1">
              <label className="ui-label text-[8px] text-muted uppercase">{field}</label>
              <input 
                value={(formData as any)[field]} 
                onChange={e => setFormData({ ...formData, [field]: e.target.value })} 
                className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold"
              />
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <label className="ui-label text-[8px] text-muted uppercase">DESCRIPTION</label>
          <textarea 
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
            className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold resize-none h-24"
          />
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full bg-gold text-ink py-3 ui-label text-[10px] font-bold tracking-[0.2em] hover:bg-[#D4AF37] disabled:opacity-50"
        >
          {isSaving ? 'SAVING...' : 'SAVE PROFILE'}
        </button>
      </div>
    </div>
  );
};

const SettingsView = () => <div className="text-muted text-center py-20">System Settings Placeholder</div>;
const PaymentsView = () => <div className="text-muted text-center py-20">Payments Dashboard Placeholder</div>;
const ReportsView = () => <div className="text-muted text-center py-20">Reports & Analytics Placeholder</div>;
const PassengersView = () => <div className="text-muted text-center py-20">Passenger Directory Placeholder</div>;

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

interface DashboardsProps {
  bookings: any[];
  routes: Route[];
  operators: any[];
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

export const Dashboards: React.FC<DashboardsProps> = ({
  bookings, routes, operators, onUpdateBookingStatus,
  onAddRoute, onEditRoute, onDeleteRoute, onAddOperator, onEditOperator, onDeleteOperator,
  onBack, isOperatorPortal = false, operatorId
}) => {
  const [activeTab, setActiveTab] = React.useState('DASHBOARD');
  const [showRouteModal, setShowRouteModal] = React.useState(false);
  const [showOperatorModal, setShowOperatorModal] = React.useState(false);
  const [showBookingModal, setShowBookingModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

  const filteredBookings = isOperatorPortal 
    ? bookings.filter(b => b.operatorId === operatorId)
    : bookings;

  const filteredRoutes = isOperatorPortal
    ? routes.filter(r => r.operatorId === operatorId)
    : routes;

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return <DashboardView bookings={filteredBookings} routes={filteredRoutes} onUpdateStatus={onUpdateBookingStatus} isOperatorPortal={isOperatorPortal} />;
      
      case 'BOOKINGS':
        return isOperatorPortal ? (
          <OperatorBookingsList 
            bookings={filteredBookings} 
            routes={filteredRoutes} 
            onUpdateStatus={onUpdateBookingStatus}
          />
        ) : (
          <BookingsView 
            bookings={filteredBookings} 
            onManualBooking={() => setShowBookingModal(true)} 
            onUpdateStatus={onUpdateBookingStatus} 
          />
        );
      
      case 'ROUTES':
        return <RoutesView routes={filteredRoutes} onAdd={() => { setEditingItem(null); setShowRouteModal(true); }} onEdit={(r: any) => { setEditingItem(r); setShowRouteModal(true); }} onDelete={onDeleteRoute} />;
      
      case 'OPERATORS':
        return <OperatorsView operators={operators} onAdd={() => { setEditingItem(null); setShowOperatorModal(true); }} onEdit={(op: any) => { setEditingItem(op); setShowOperatorModal(true); }} onDelete={onDeleteOperator} />;
      
      case 'PAYMENTS': return <PaymentsView />;
      case 'REPORTS': return <ReportsView />;
      case 'PASSENGERS': return <PassengersView />;
      case 'SETTINGS': return isOperatorPortal ? <OperatorProfileSettings operator={operators.find(o => o.id === operatorId)} onUpdate={onEditOperator} /> : <SettingsView />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050B14] z-[60] flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-white/10 flex items-center justify-between px-4 bg-[#081221] z-50">
        <div className="flex items-baseline">
          <span className="font-display text-sm tracking-[0.2em] text-white uppercase">PALAWAN</span>
          <span className="font-ui text-[8px] text-gold tracking-[0.1em] ml-1">{isOperatorPortal ? '.OPERATOR' : '.ADMIN'}</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
          <Menu size={20} />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 w-64 bg-[#081221] border-r border-white/10 z-40 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10 flex items-baseline mb-4">
          <span className="font-display text-base tracking-[0.2em] text-white uppercase">PALAWAN</span>
          <span className="font-ui text-[10px] text-gold tracking-[0.1em] ml-1">{isOperatorPortal ? '.OPERATOR' : '.ADMIN'}</span>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden absolute top-5 right-4 text-muted"><X size={18} /></button>
        </div>
        <nav className="px-3 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
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
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showBookingModal && (
          <ManualBookingModal 
            routes={routes} 
            onClose={() => setShowBookingModal(false)} 
            onSave={(data) => { onAddRoute(data); setShowBookingModal(false); }} 
          />
        )}
        {showRouteModal && (
          <RouteModal 
            route={editingItem} 
            operators={operators} 
            onClose={() => setShowRouteModal(false)} 
            onSave={editingItem ? onEditRoute : onAddRoute} 
          />
        )}
        {showOperatorModal && (
          <OperatorModal 
            operator={editingItem} 
            onClose={() => setShowOperatorModal(false)} 
            onSave={editingItem ? onEditOperator : onAddOperator} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// MODAL COMPONENTS
// ============================================

const ManualBookingModal = ({ routes, onClose, onSave }: any) => {
  const [formData, setFormData] = React.useState({ 
    customerName: '', customerPhone: '', routeId: routes[0]?.id || '', 
    date: new Date().toISOString().split('T')[0], seats: 1, status: 'CONFIRMED' 
  });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#081221] border border-white/10 p-6 md:p-8 max-w-lg w-full relative z-10 rounded-xl">
        <h2 className="text-xl text-white font-display italic mb-6">Manual Booking</h2>
        <div className="space-y-4 mb-6">
          <input placeholder="Passenger Name" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
          <input placeholder="Contact Phone" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
          <select value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded">
            {routes?.map((r: any) => <option key={r.id} value={r.id}>{r.from} → {r.to}</option>)}
          </select>
          <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-muted ui-label text-[10px] hover:text-white">CANCEL</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-3 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em]">CREATE</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const RouteModal = ({ route, operators, onClose, onSave }: any) => {
  const [formData, setFormData] = React.useState(route || { from: '', to: '', mode: 'SHUTTLE_SHARED', price: 0, departureTime: '', seatsLeft: 12 });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#081221] border border-white/10 p-6 md:p-8 max-w-lg w-full relative z-10 rounded-xl">
        <h2 className="text-xl text-white font-display italic mb-6">{route ? 'Edit Route' : 'New Route'}</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {['from', 'to', 'departureTime'].map(f => (
            <input key={f} placeholder={f.toUpperCase()} value={(formData as any)[f]} onChange={e => setFormData({...formData, [f]: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
          ))}
          <input type="number" placeholder="PRICE" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
          <select value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded">
            <option value="SHUTTLE_SHARED">Shared Shuttle</option>
            <option value="SHUTTLE_PRIVATE">Private Shuttle</option>
            <option value="ISLAND_HOPPING">Island Hopping</option>
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

const OperatorModal = ({ operator, onClose, onSave }: any) => {
  const [formData, setFormData] = React.useState(operator || { name: '', phone: '', location: '' });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#081221] border border-white/10 p-6 md:p-8 max-w-lg w-full relative z-10 rounded-xl">
        <h2 className="text-xl text-white font-display italic mb-6">{operator ? 'Edit Operator' : 'New Operator'}</h2>
        <div className="space-y-3 mb-6">
          {['name', 'phone', 'location', 'email'].map(f => (
            <input key={f} placeholder={f.toUpperCase()} value={(formData as any)[f] || ''} onChange={e => setFormData({...formData, [f]: e.target.value})} className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded" />
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-muted ui-label text-[10px] hover:text-white">CANCEL</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-3 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em]">SAVE</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
