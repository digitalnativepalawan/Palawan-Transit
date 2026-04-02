/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  LayoutDashboard, BookOpen, Map, Users, CreditCard, BarChart3, 
  UserCircle, Settings as SettingsIcon, Check, X, Search, Filter, 
  Plus, MoreVertical, ArrowUpRight, ArrowDownRight, Download,
  Bell, Shield, Globe, MessageSquare, Power, Truck, Anchor, Waves,
  Clock, MapPin, Phone, Mail, FileText, Trash2, Menu, Edit2, Camera
} from 'lucide-react';
import { Route, Operator, Booking, BookingStatus, TransportMode } from '../types';
import { supabase } from '../lib/supabase';

type AdminTab = 
  | 'DASHBOARD' | 'BOOKINGS' | 'ROUTES' | 'OPERATORS' 
  | 'PAYMENTS' | 'REPORTS' | 'PASSENGERS' | 'SETTINGS';

interface AdminDashboardProps {
  routes: Route[];
  operators: Operator[];
  bookings: Booking[];
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
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

export const AdminDashboard = ({ 
  routes, 
  operators, 
  bookings,
  onUpdateBookingStatus,
  onAddRoute, 
  onEditRoute,
  onDeleteRoute, 
  onAddOperator, 
  onEditOperator,
  onDeleteOperator, 
  onBack,
  isOperatorPortal = false,
  operatorId = 'op-1'
}: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = React.useState<AdminTab>('DASHBOARD');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  
  // Modal States
  const [showRouteModal, setShowRouteModal] = React.useState(false);
  const [showOperatorModal, setShowOperatorModal] = React.useState(false);
  const [showBookingModal, setShowBookingModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  const sidebarItems = isOperatorPortal ? [
    { id: 'DASHBOARD', label: 'My Dashboard', icon: LayoutDashboard, group: 'OPERATIONS' },
    { id: 'BOOKINGS', label: 'My Bookings', icon: BookOpen, group: 'OPERATIONS' },
    { id: 'ROUTES', label: 'My Routes', icon: Map, group: 'OPERATIONS' },
    { id: 'SETTINGS', label: 'Profile Settings', icon: SettingsIcon, group: 'SYSTEM' },
  ] : [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, group: 'OPERATIONS' },
    { id: 'BOOKINGS', label: 'Bookings', icon: BookOpen, group: 'OPERATIONS' },
    { id: 'ROUTES', label: 'Routes', icon: Map, group: 'OPERATIONS' },
    { id: 'OPERATORS', label: 'Operators', icon: Users, group: 'OPERATIONS' },
    { id: 'PAYMENTS', label: 'Payments', icon: CreditCard, group: 'FINANCE' },
    { id: 'REPORTS', label: 'Reports', icon: BarChart3, group: 'FINANCE' },
    { id: 'PASSENGERS', label: 'Passengers', icon: UserCircle, group: 'SYSTEM' },
    { id: 'SETTINGS', label: 'Settings', icon: SettingsIcon, group: 'SYSTEM' },
  ];

  const handleEditRoute = (route: Route) => {
    setEditingItem(route);
    setShowRouteModal(true);
  };

  const handleEditOperator = (op: Operator) => {
    setEditingItem(op);
    setShowOperatorModal(true);
  };

  const renderContent = () => {
    const filteredBookings = isOperatorPortal 
      ? bookings.filter(b => b.operatorId === operatorId)
      : bookings;

    const filteredRoutes = isOperatorPortal
      ? routes.filter(r => r.operatorId === operatorId)
      : routes;

    const currentOperator = isOperatorPortal 
      ? operators.find(o => o.id === operatorId)
      : null;

    switch (activeTab) {
      case 'DASHBOARD': return (
        <DashboardView 
          bookings={filteredBookings} 
          routes={filteredRoutes} 
          onUpdateStatus={onUpdateBookingStatus}
          isOperatorPortal={isOperatorPortal}
        />
      );
      case 'BOOKINGS': return (
        <BookingsView 
          bookings={filteredBookings} 
          onManualBooking={() => setShowBookingModal(true)} 
          onUpdateStatus={onUpdateBookingStatus}
          isOperatorPortal={isOperatorPortal}
        />
      );
      case 'ROUTES': return (
        <RoutesView 
          routes={filteredRoutes} 
          onAdd={() => { setEditingItem(null); setShowRouteModal(true); }} 
          onEdit={handleEditRoute} 
          onDelete={onDeleteRoute} 
        />
      );
      case 'OPERATORS': return <OperatorsView operators={operators} onAdd={() => { setEditingItem(null); setShowOperatorModal(true); }} onEdit={handleEditOperator} onDelete={onDeleteOperator} />;
      case 'PAYMENTS': return <PaymentsView />;
      case 'REPORTS': return <ReportsView />;
      case 'PASSENGERS': return <PassengersView />;
      case 'SETTINGS': return isOperatorPortal ? (
        <OperatorProfileSettings 
          operator={currentOperator!} 
          onUpdate={onEditOperator} 
        />
      ) : (
        <SettingsView />
      );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050B14] z-[60] flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#081221] z-50">
        <div className="flex items-baseline">
          <span className="font-display text-sm tracking-[0.2em] text-white uppercase">PALAWAN</span>
          <span className="font-ui text-[8px] text-gold tracking-[0.1em] ml-1">
            {isOperatorPortal ? '.OPERATOR' : '.ADMIN'}
          </span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar / Mobile Drawer */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside 
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed lg:relative inset-y-0 left-0 w-64 border-r border-white/10 flex flex-col bg-[#081221] z-[70] lg:z-0 ${isSidebarOpen ? 'flex' : 'hidden lg:flex'}`}
          >
            <div className="p-8 border-b border-white/10 hidden lg:block">
              <div className="flex items-baseline">
                <span className="font-display text-lg tracking-[0.3em] text-white uppercase">PALAWAN</span>
              </div>
              <span className="font-ui text-[10px] text-gold tracking-[0.2em]">
                {isOperatorPortal ? '.OPERATOR PORTAL' : '.TRANSIT ADMIN'}
              </span>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-8 mt-4 lg:mt-0">
              {['OPERATIONS', 'FINANCE', 'SYSTEM'].map(group => (
                <div key={group}>
                  <h3 className="ui-label text-[10px] text-muted mb-4 px-4 tracking-[0.2em]">{group}</h3>
                  <div className="space-y-1">
                    {sidebarItems.filter(item => item.group === group).map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as AdminTab);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 ui-label text-[11px] transition-all duration-200 group ${
                          activeTab === item.id 
                            ? 'bg-gold/10 text-gold border-l-2 border-gold' 
                            : 'text-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                        }`}
                      >
                        <item.icon size={16} className={activeTab === item.id ? 'text-gold' : 'text-muted group-hover:text-white'} />
                        {item.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-6 border-t border-white/10 bg-[#050B14]/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-ui text-xs">AD</div>
                <div>
                  <p className="ui-label text-[10px] text-white">admin</p>
                  <p className="ui-label text-[8px] text-muted">PALAWAN.TRANSIT OPS</p>
                </div>
              </div>
              <button 
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 py-2 border border-white/10 ui-label text-[10px] text-muted hover:text-white hover:border-white/30 transition-all"
              >
                <Power size={12} /> LOGOUT
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-20 border-b border-white/10 hidden lg:flex items-center justify-between px-10 bg-[#050B14]">
          <h2 className="text-3xl text-white italic font-serif">{sidebarItems.find(i => i.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-6">
            <span className="ui-label text-[10px] text-muted">{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
            <button className="px-6 py-2 border border-white/20 ui-label text-[10px] text-white hover:bg-white hover:text-ink transition-all tracking-[0.2em]">EXPORT</button>
          </div>
        </header>

        {/* Mobile Page Title */}
        <div className="lg:hidden px-6 pt-6 flex justify-between items-center">
          <h2 className="text-2xl text-white italic font-serif">{sidebarItems.find(i => i.id === activeTab)?.label}</h2>
          <button className="p-2 border border-white/10 text-white hover:bg-white/5">
            <Download size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-full overflow-x-hidden"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showRouteModal && (
          <RouteModal 
            route={editingItem} 
            operators={operators}
            onClose={() => setShowRouteModal(false)} 
            onSave={(data) => {
              if (editingItem) onEditRoute(data);
              else onAddRoute(data);
              setShowRouteModal(false);
            }}
          />
        )}
        {showOperatorModal && (
          <OperatorModal 
            operator={editingItem} 
            onClose={() => setShowOperatorModal(false)} 
            onSave={(data) => {
              if (editingItem) onEditOperator(data);
              else onAddOperator(data);
              setShowOperatorModal(false);
            }}
          />
        )}
        {showBookingModal && (
          <ManualBookingModal 
            routes={routes}
            onClose={() => setShowBookingModal(false)} 
            onSave={(data) => {
              setShowBookingModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Modals ---

const RouteModal = ({ route, operators, onClose, onSave }: { route: Route | null, operators: Operator[], onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = React.useState(route || {
    from: '',
    to: '',
    mode: 'SHUTTLE',
    price: 0,
    departureTime: '',
    duration: '',
    seatsLeft: 12,
    operator: operators[0]?.name || '',
    bookingType: 'INSTANT'
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
    >
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-deep border border-border p-10 max-w-2xl w-full relative z-10"
      >
        <h2 className="text-4xl text-white italic mb-8">{route ? 'Edit Route' : 'Create New Route'}</h2>
        
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="space-y-1">
            <label className="ui-label text-muted">FROM</label>
            <input 
              value={formData.from} 
              onChange={e => setFormData({...formData, from: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">TO</label>
            <input 
              value={formData.to} 
              onChange={e => setFormData({...formData, to: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">TRANSPORT MODE</label>
            <select 
              value={formData.mode} 
              onChange={e => setFormData({...formData, mode: e.target.value as any})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none appearance-none"
            >
              <option value="SHUTTLE">SHUTTLE</option>
              <option value="BANGKA">BANGKA</option>
              <option value="PRIVATE">PRIVATE VEHICLE</option>
              <option value="ISLAND_HOPPING">ISLAND HOPPING</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">OPERATOR</label>
            <select 
              value={formData.operator} 
              onChange={e => setFormData({...formData, operator: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none appearance-none"
            >
              {operators.map(op => <option key={op.id} value={op.name}>{op.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">PRICE (₱)</label>
            <input 
              type="number"
              value={formData.price} 
              onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">DEPARTURE</label>
            <input 
              placeholder="e.g. 09:00 AM"
              value={formData.departureTime} 
              onChange={e => setFormData({...formData, departureTime: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 border border-border text-muted ui-label text-[10px] hover:text-white transition-colors">CANCEL</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-4 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em]">SAVE ROUTE</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const OperatorModal = ({ operator, onClose, onSave }: { operator: Operator | null, onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = React.useState(operator || {
    name: '',
    phone: '',
    type: 'VAN',
    location: ''
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
    >
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-deep border border-border p-10 max-w-md w-full relative z-10"
      >
        <h2 className="text-4xl text-white italic mb-8">{operator ? 'Edit Operator' : 'Onboard Operator'}</h2>
        
        <div className="space-y-6 mb-10">
          <div className="space-y-1">
            <label className="ui-label text-muted">OPERATOR NAME</label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">CONTACT PHONE</label>
            <input 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">PRIMARY TYPE</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value as any})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none appearance-none"
            >
              <option value="VAN">VAN / SHUTTLE</option>
              <option value="BOAT">BOAT / BANGKA</option>
              <option value="PRIVATE">PRIVATE VEHICLE</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">BASE LOCATION</label>
            <input 
              value={formData.location} 
              onChange={e => setFormData({...formData, location: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 border border-border text-muted ui-label text-[10px] hover:text-white transition-colors">CANCEL</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-4 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em]">SAVE OPERATOR</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ManualBookingModal = ({ routes, onClose, onSave }: { routes: Route[], onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = React.useState({
    customerName: '',
    customerPhone: '',
    routeId: routes[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    seats: 1,
    status: 'CONFIRMED'
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
    >
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-deep border border-border p-10 max-w-2xl w-full relative z-10"
      >
        <h2 className="text-4xl text-white italic mb-8">Manual Booking</h2>
        
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="space-y-1">
            <label className="ui-label text-muted">PASSENGER NAME</label>
            <input 
              value={formData.customerName} 
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">CONTACT PHONE</label>
            <input 
              value={formData.customerPhone} 
              onChange={e => setFormData({...formData, customerPhone: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="ui-label text-muted">SELECT ROUTE</label>
            <select 
              value={formData.routeId} 
              onChange={e => setFormData({...formData, routeId: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none appearance-none"
            >
              {routes.map(r => <option key={r.id} value={r.id}>{r.from} → {r.to} ({r.operator})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">DATE</label>
            <input 
              type="date"
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">SEATS</label>
            <input 
              type="number"
              value={formData.seats} 
              onChange={e => setFormData({...formData, seats: parseInt(e.target.value)})}
              className="w-full bg-surface border border-border p-4 text-white focus:border-gold outline-none" 
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 border border-border text-muted ui-label text-[10px] hover:text-white transition-colors">CANCEL</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-4 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em]">CREATE BOOKING</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DashboardView = ({ 
  bookings, 
  routes, 
  onUpdateStatus,
  isOperatorPortal 
}: { 
  bookings: Booking[], 
  routes: Route[], 
  onUpdateStatus: (id: string, status: BookingStatus) => void,
  isOperatorPortal?: boolean
}) => {
  const [verifyCode, setVerifyCode] = React.useState('');
  const [verifyError, setVerifyError] = React.useState('');
  const [verifying, setVerifying] = React.useState(false);

  const handleVerify = () => {
    setVerifying(true);
    setVerifyError('');
    
    setTimeout(() => {
      const booking = bookings.find(b => b.referenceCode.toUpperCase() === verifyCode.trim().toUpperCase());
      if (booking) {
        if (booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED') {
          setVerifyError('BOOKING ALREADY ACCEPTED');
        } else {
          onUpdateStatus(booking.id, 'ACCEPTED');
          setVerifyCode('');
        }
      } else {
        setVerifyError('INVALID REFERENCE CODE');
      }
      setVerifying(false);
    }, 800);
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'ACCEPTED');
  
  const totalRevenue = confirmedBookings.reduce((acc, curr) => {
    const route = routes.find(r => r.id === curr.routeId);
    return acc + (route ? route.price * curr.seats : 0);
  }, 0);

  const stats = [
    { label: 'TOTAL BOOKINGS', value: bookings.length.toString(), sub: `${confirmedBookings.length} confirmed`, color: 'text-gold' },
    { label: 'EST. REVENUE', value: `₱${totalRevenue.toLocaleString()}`, sub: 'based on confirmed', color: 'text-gold' },
    { label: 'ACTIVE ROUTES', value: routes.length.toString(), sub: 'currently listed', color: 'text-seafoam' },
    { label: 'PENDING REQUESTS', value: pendingBookings.length.toString(), sub: 'needs attention', color: 'text-danger' },
  ];

  const data = [
    { name: 'MON', rev: 28400 },
    { name: 'TUE', rev: 32100 },
    { name: 'WED', rev: 38450 },
    { name: 'THU', rev: 30200 },
    { name: 'FRI', rev: 42000 },
    { name: 'SAT', rev: 45600 },
    { name: 'SUN', rev: 41200 },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#081221] border border-white/10 p-6">
            <p className="ui-label text-[9px] text-muted mb-4 tracking-[0.2em]">{stat.label}</p>
            <p className={`text-3xl lg:text-4xl font-ui mb-2 ${stat.color}`}>{stat.value}</p>
            <p className="ui-label text-[8px] text-muted opacity-60">{stat.sub.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {isOperatorPortal && (
        <div className="bg-gold/5 border border-gold/20 p-8">
          <div className="max-w-xl">
            <h3 className="text-2xl text-white italic mb-2">Verify Reference Code</h3>
            <p className="ui-label text-muted text-[10px] mb-6 tracking-[0.2em]">ENTER THE CUSTOMER'S PIN TO CLAIM THE BOOKING</p>
            
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input 
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  placeholder="PT-2026-XXXXX"
                  className="w-full bg-surface border border-white/10 p-4 text-white font-ui tracking-widest focus:border-gold outline-none transition-all"
                />
                {verifyError && (
                  <p className="absolute -bottom-6 left-0 text-danger ui-label text-[8px] tracking-widest">{verifyError}</p>
                )}
              </div>
              <button 
                onClick={handleVerify}
                disabled={verifying || !verifyCode}
                className="px-8 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em] hover:bg-white transition-all disabled:opacity-50"
              >
                {verifying ? 'VERIFYING...' : 'ACCEPT PIN'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#081221] border border-white/10 p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="ui-label text-[10px] text-white tracking-[0.2em]">REVENUE - LAST 7 DAYS</h3>
            <button className="ui-label text-[8px] text-gold hover:underline">DETAILS →</button>
          </div>
          <div className="h-[250px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E9299', fontSize: 10, fontFamily: 'Inter' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#081221', border: '1px solid #ffffff10', borderRadius: '0px' }}
                  itemStyle={{ color: '#C9943A', fontSize: 12 }}
                />
                <Bar dataKey="rev" fill="#C9943A" radius={[2, 2, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-8 pt-8 border-t border-white/5">
            <div>
              <p className="ui-label text-[8px] text-muted mb-1">7-DAY TOTAL</p>
              <p className="text-xl lg:text-2xl text-gold font-ui">₱214,800</p>
            </div>
            <div className="text-right">
              <p className="ui-label text-[8px] text-muted mb-1">AVG / DAY</p>
              <p className="text-xl lg:text-2xl text-white font-ui">₱30,685</p>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-[#081221] border border-white/10 p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="ui-label text-[10px] text-white tracking-[0.2em]">PENDING REQUESTS</h3>
            <button className="ui-label text-[8px] text-gold hover:underline">VIEW ALL →</button>
          </div>
          <div className="space-y-4">
            {pendingBookings.slice(0, 4).map(req => {
              const route = routes.find(r => r.id === req.routeId);
              return (
                <div key={req.id} className="flex items-center justify-between p-4 border border-white/5 hover:border-white/20 transition-all group">
                  <div>
                    <p className="text-white text-sm italic mb-1">{req.customerName}</p>
                    <p className="ui-label text-[8px] text-muted">
                      {route ? `${route.from} → ${route.to}` : 'Unknown Route'} · {req.date} · {req.seats} seats
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 lg:w-10 lg:h-10 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-ink transition-all">
                      <Check size={14} />
                    </button>
                    <button className="w-8 h-8 lg:w-10 lg:h-10 border border-white/10 flex items-center justify-center text-white hover:bg-danger hover:border-danger transition-all">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {pendingBookings.length === 0 && (
              <div className="text-center py-12 border border-dashed border-white/5">
                <p className="ui-label text-[10px] text-muted italic">NO PENDING REQUESTS</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Routes */}
      <div className="bg-[#081221] border border-white/10 p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="ui-label text-[10px] text-white tracking-[0.2em]">TOP ROUTES - THIS WEEK</h3>
          <button className="ui-label text-[8px] text-gold hover:underline">MANAGE ROUTES →</button>
        </div>
        <div className="space-y-2">
          {[
            { route: 'Puerto Princesa → El Nido', op: 'LEXUS TRAVEL', mode: 'SHUTTLE', rev: '₱84,600', bookings: 141 },
            { route: 'El Nido → Coron Island Hop', op: 'TAO EXPEDITIONS', mode: 'BANGKA', rev: '₱57,350', bookings: 21 },
            { route: 'PP → Port Barton Express', op: 'NORTH PALAWAN EXPRESS', mode: 'SHUTTLE', rev: '₱38,250', bookings: 62 },
            { route: 'PP → El Nido VIP', op: 'ISLAND PREMIER TRANSIT', mode: 'SHUTTLE', rev: '₱34,200', bookings: 28 },
          ].map((r, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-6 border-b border-white/5 last:border-0 gap-4">
              <div>
                <p className="text-lg lg:text-xl text-white italic mb-1">{r.route}</p>
                <p className="ui-label text-[8px] text-muted tracking-widest">{r.op} · {r.mode} · 3.5 HRS</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xl lg:text-2xl text-gold font-ui mb-1">{r.rev}</p>
                <p className="ui-label text-[8px] text-muted">{r.bookings} Bookings</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookingsView = ({ 
  bookings, 
  onManualBooking,
  onUpdateStatus,
  isOperatorPortal
}: { 
  bookings: Booking[], 
  onManualBooking: () => void,
  onUpdateStatus: (id: string, status: BookingStatus) => void,
  isOperatorPortal?: boolean
}) => {
  const [filter, setFilter] = React.useState<BookingStatus | 'ALL'>('ALL');
  const [search, setSearch] = React.useState('');

  const filtered = bookings.filter(b => {
    const matchesFilter = filter === 'ALL' || b.status === filter;
    const matchesSearch = b.referenceCode.toLowerCase().includes(search.toLowerCase()) || 
                         b.customerName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              placeholder="Search bookings, names, refs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#081221] border border-white/10 pl-12 pr-6 py-3 ui-label text-[11px] text-white w-full focus:border-gold outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-[#081221] border border-white/10 text-white text-[11px] py-3 px-6 outline-none focus:border-gold ui-label"
          >
            <option value="ALL">STATUS: ALL</option>
            <option value="PENDING">STATUS: PENDING</option>
            <option value="CONFIRMED">STATUS: CONFIRMED</option>
            <option value="ACCEPTED">STATUS: ACCEPTED</option>
            <option value="CANCELLED">STATUS: CANCELLED</option>
            <option value="COMPLETED">STATUS: COMPLETED</option>
          </select>
        </div>
        {!isOperatorPortal && (
          <button 
            onClick={onManualBooking}
            className="w-full sm:w-auto bg-gold text-ink px-8 py-3 ui-label text-[11px] font-bold tracking-[0.2em] flex items-center justify-center gap-2"
          >
            <Plus size={16} /> MANUAL BOOKING
          </button>
        )}
      </div>

      {/* Mobile View: Cards */}
      <div className="lg:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-[#081221] border border-white/10 p-12 text-center text-muted ui-label italic">No bookings found</div>
        ) : (
          filtered.map(b => (
            <div key={b.id} className="bg-[#081221] border border-white/10 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-ui text-gold text-sm mb-1">{b.referenceCode}</p>
                  <p className="text-white text-lg italic">{b.customerName}</p>
                </div>
                <span className={`ui-label text-[8px] px-2 py-1 ${
                  b.status === 'CONFIRMED' || b.status === 'ACCEPTED' ? 'bg-success/20 text-success' : 
                  b.status === 'PENDING' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                }`}>
                  {b.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="ui-label text-[8px] text-muted mb-1">ROUTE</p>
                  <p className="text-white text-xs italic">{b.routeId}</p>
                </div>
                <div>
                  <p className="ui-label text-[8px] text-muted mb-1">DATE</p>
                  <p className="text-white text-xs">{b.date}</p>
                </div>
                <div>
                  <p className="ui-label text-[8px] text-muted mb-1">TOTAL</p>
                  <p className="text-white font-ui">₱{b.totalPrice}</p>
                </div>
                <div className="flex justify-end items-end gap-2">
                  {b.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => onUpdateStatus(b.id, 'ACCEPTED')}
                        className="p-2 text-success hover:bg-success/10 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(b.id, 'CANCELLED')}
                        className="p-2 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  <button className="p-2 text-muted hover:text-white"><MoreVertical size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden lg:block bg-[#081221] border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">REF</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">PASSENGER</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">ROUTE</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">DATE</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">STATUS</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">TOTAL</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em] text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-ui text-gold text-xs">{b.referenceCode}</td>
                <td className="px-6 py-4">
                  <p className="text-white text-sm italic">{b.customerName}</p>
                  <p className="ui-label text-[8px] text-muted">{b.customerPhone}</p>
                </td>
                <td className="px-6 py-4 text-white/60 text-xs italic">{b.routeId}</td>
                <td className="px-6 py-4 text-white/60 text-xs">{b.date}</td>
                <td className="px-6 py-4">
                  <span className={`ui-label text-[8px] px-2 py-1 ${
                    b.status === 'CONFIRMED' || b.status === 'ACCEPTED' ? 'bg-success/20 text-success' : 
                    b.status === 'PENDING' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-white font-ui">₱{b.totalPrice.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {b.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(b.id, 'ACCEPTED')}
                          className="p-2 text-success hover:bg-success/10 transition-colors"
                          title="Accept Request"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(b.id, 'CANCELLED')}
                          className="p-2 text-destructive hover:bg-destructive/10 transition-colors"
                          title="Reject Request"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    <button className="p-2 text-muted hover:text-white"><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RoutesView = ({ routes, onAdd, onEdit, onDelete }: { routes: Route[], onAdd: () => void, onEdit: (r: Route) => void, onDelete: (id: string) => void }) => {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="ui-label text-[10px] text-gold tracking-[0.2em]">{routes.length} ACTIVE ROUTES</h3>
        <button 
          onClick={onAdd}
          className="w-full sm:w-auto bg-gold text-ink px-8 py-3 ui-label text-[11px] font-bold tracking-[0.2em] flex items-center justify-center gap-2"
        >
          <Plus size={16} /> CREATE NEW ROUTE
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {routes.map(r => (
          <div key={r.id} className="bg-[#081221] border border-white/10 p-6 lg:p-8 flex justify-between items-start group hover:border-gold/50 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {r.mode.startsWith('SHUTTLE') ? <Truck size={16} className="text-gold" /> : 
                 r.mode === 'PRIVATE_4X4' ? <Truck size={16} className="text-danger" /> :
                 (r.mode === 'BANGKA' || r.mode === 'ISLAND_HOPPING') ? <Anchor size={16} className="text-seafoam" /> : 
                 <Waves size={16} className="text-gold" />}
                <span className="ui-label text-[9px] text-muted tracking-[0.2em]">{r.mode}</span>
                <span className="w-1 h-1 rounded-full bg-success" />
                <span className="ui-label text-[9px] text-success tracking-[0.2em]">LIVE</span>
              </div>
              <h4 className="text-2xl lg:text-3xl text-white italic mb-2">{r.from} → {r.to}</h4>
              <p className="ui-label text-[10px] text-muted tracking-widest mb-6">{r.operator} · {r.duration} · {r.departureTime}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => onEdit(r)}
                  className="ui-label text-[9px] text-gold hover:underline"
                >
                  EDIT DETAILS
                </button>
                <button 
                  onClick={() => onDelete(r.id)}
                  className="ui-label text-[9px] text-danger hover:underline"
                >
                  DELETE
                </button>
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-2xl lg:text-3xl text-white font-ui mb-1">₱{r.price}</p>
              <p className="ui-label text-[8px] text-muted">{r.bookingType} BOOKING</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OperatorsView = ({ operators, onAdd, onEdit, onDelete }: { operators: Operator[], onAdd: () => void, onEdit: (op: Operator) => void, onDelete: (id: string) => void }) => {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="ui-label text-[10px] text-gold tracking-[0.2em]">{operators.length} REGISTERED OPERATORS</h3>
        <button 
          onClick={onAdd}
          className="w-full sm:w-auto bg-gold text-ink px-8 py-3 ui-label text-[11px] font-bold tracking-[0.2em] flex items-center justify-center gap-2"
        >
          <Plus size={16} /> ONBOARD OPERATOR
        </button>
      </div>

      {/* Mobile View: Cards */}
      <div className="lg:hidden space-y-4">
        {operators.map(op => (
          <div key={op.id} className="bg-[#081221] border border-white/10 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white text-lg italic">{op.name}</p>
                <p className="ui-label text-[8px] text-muted">{op.phone}</p>
              </div>
              <span className="ui-label text-[8px] px-2 py-1 bg-success/20 text-success">APPROVED</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="ui-label text-[8px] text-muted mb-1">TYPE</p>
                <p className="text-white text-xs">{op.type}</p>
              </div>
              <div>
                <p className="ui-label text-[8px] text-muted mb-1">LOCATION</p>
                <p className="text-white text-xs">{op.location}</p>
              </div>
              <div>
                <p className="ui-label text-[8px] text-muted mb-1">RATING</p>
                <div className="flex items-center gap-1 text-gold">
                  <Check size={10} />
                  <span className="ui-label text-[10px]">4.9</span>
                </div>
              </div>
              <div className="flex justify-end items-end gap-2">
                <button onClick={() => onEdit(op)} className="p-2 text-muted hover:text-gold"><SettingsIcon size={16} /></button>
                <button onClick={() => onDelete(op.id)} className="p-2 text-muted hover:text-danger"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden lg:block bg-[#081221] border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">OPERATOR</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">TYPE</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">LOCATION</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">ROUTES</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">RATING</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">STATUS</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {operators.map(op => (
              <tr key={op.id} className="hover:bg-white/5 transition-all group">
                <td className="px-6 py-6">
                  <p className="text-lg text-white italic">{op.name}</p>
                  <p className="ui-label text-[8px] text-muted">{op.phone}</p>
                </td>
                <td className="px-6 py-6 ui-label text-[10px] text-white">{op.type}</td>
                <td className="px-6 py-6 ui-label text-[10px] text-muted">{op.location}</td>
                <td className="px-6 py-6 ui-label text-[10px] text-white">12</td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-1 text-gold">
                    <Check size={12} />
                    <span className="ui-label text-[10px]">4.9</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="ui-label text-[8px] px-2 py-1 bg-success/20 text-success">APPROVED</span>
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onEdit(op)} className="p-2 text-muted hover:text-gold transition-colors"><SettingsIcon size={16} /></button>
                    <button onClick={() => onDelete(op.id)} className="p-2 text-muted hover:text-danger transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaymentsView = () => {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="bg-[#081221] border border-white/10 p-6 lg:p-8">
          <h3 className="ui-label text-[10px] text-muted mb-6 tracking-[0.2em]">PAYMENT SPLIT</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'GCash', value: 65 },
                    { name: 'On-Arrival', value: 35 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#C9943A" />
                  <Cell fill="#ffffff10" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold" />
              <span className="ui-label text-[10px] text-white">GCASH (65%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/10" />
              <span className="ui-label text-[10px] text-white">ON-ARRIVAL (35%)</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#081221] border border-white/10 p-6 lg:p-8">
          <h3 className="ui-label text-[10px] text-muted mb-6 tracking-[0.2em]">TRANSACTION LOG</h3>
          <div className="space-y-4">
            {[
              { id: 'TX-9021', name: 'Maria Santos', method: 'GCASH', amount: '₱2,400', status: 'SUCCESS', date: '10:42 AM' },
              { id: 'TX-9020', name: 'James Kowalski', method: 'ON-ARRIVAL', amount: '₱4,800', status: 'PENDING', date: '10:15 AM' },
              { id: 'TX-9019', name: 'Sophie Laurent', method: 'GCASH', amount: '₱1,200', status: 'SUCCESS', date: '09:55 AM' },
              { id: 'TX-9018', name: 'Erik Magnusson', method: 'GCASH', amount: '₱2,400', status: 'REFUNDED', date: '08:30 AM' },
            ].map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center border border-white/10 ${tx.status === 'REFUNDED' ? 'text-danger' : 'text-gold'}`}>
                    <CreditCard size={14} />
                  </div>
                  <div>
                    <p className="text-white text-sm italic">{tx.name}</p>
                    <p className="ui-label text-[8px] text-muted">{tx.id} · {tx.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-ui">{tx.amount}</p>
                  <p className={`ui-label text-[8px] ${tx.status === 'SUCCESS' ? 'text-success' : tx.status === 'REFUNDED' ? 'text-danger' : 'text-gold'}`}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportsView = () => {
  const data = [
    { name: 'SHUTTLE', rev: 145000, color: '#C9943A' },
    { name: 'BANGKA', rev: 89000, color: '#45B7D1' },
    { name: 'PRIVATE', rev: 42000, color: '#ffffff20' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-[#081221] border border-white/10 p-6 lg:p-8">
          <h3 className="ui-label text-[10px] text-white tracking-[0.2em] mb-8">REVENUE BY ROUTE TYPE</h3>
          <div className="h-[250px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E9299', fontSize: 10 }}
                />
                <Tooltip cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="rev" radius={[0, 4, 4, 0]} barSize={30}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#081221] border border-white/10 p-6 lg:p-8">
          <h3 className="ui-label text-[10px] text-white tracking-[0.2em] mb-8">MONTHLY P&L TABLE</h3>
          <div className="space-y-4">
            {[
              { month: 'MARCH 2026', rev: '₱1,240,000', exp: '₱450,000', net: '₱790,000' },
              { month: 'FEBRUARY 2026', rev: '₱1,120,000', exp: '₱420,000', net: '₱700,000' },
              { month: 'JANUARY 2026', rev: '₱980,000', exp: '₱380,000', net: '₱600,000' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-white/5 ui-label text-[10px]">
                <span className="text-white col-span-2 sm:col-span-1">{row.month}</span>
                <span className="text-muted text-right">REV: {row.rev}</span>
                <span className="text-danger text-right">EXP: {row.exp}</span>
                <span className="text-success text-right font-bold">NET: {row.net}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PassengersView = () => {
  const passengers = [
    { name: 'Maria Santos', phone: '+63 912 345 6789', bookings: 4, spend: '₱9,600', last: 'Mar 28, 2026' },
    { name: 'James Kowalski', phone: '+48 600 123 456', bookings: 1, spend: '₱4,800', last: 'Apr 01, 2026' },
    { name: 'Sophie Laurent', phone: '+33 6 12 34 56 78', bookings: 2, spend: '₱2,400', last: 'Mar 15, 2026' },
    { name: 'Erik Magnusson', phone: '+46 70 123 45 67', bookings: 3, spend: '₱7,200', last: 'Mar 22, 2026' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input 
            placeholder="Search passenger database..." 
            className="bg-[#081221] border border-white/10 pl-12 pr-6 py-3 ui-label text-[11px] text-white w-full focus:border-gold outline-none"
          />
        </div>
        <button className="w-full sm:w-auto ui-label text-[10px] text-muted hover:text-white flex items-center justify-center gap-2 px-6 py-3 border border-white/10 sm:border-0">
          <Download size={14} /> EXPORT DATABASE
        </button>
      </div>

      {/* Mobile View: Cards */}
      <div className="lg:hidden space-y-4">
        {passengers.map((p, i) => (
          <div key={i} className="bg-[#081221] border border-white/10 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white text-lg italic">{p.name}</p>
                <p className="ui-label text-[8px] text-muted">{p.phone}</p>
              </div>
              <button className="p-2 text-muted hover:text-white"><MoreVertical size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="ui-label text-[8px] text-muted mb-1">BOOKINGS</p>
                <p className="text-white text-xs">{p.bookings}</p>
              </div>
              <div>
                <p className="ui-label text-[8px] text-muted mb-1">TOTAL SPEND</p>
                <p className="text-gold font-ui">{p.spend}</p>
              </div>
              <div>
                <p className="ui-label text-[8px] text-muted mb-1">LAST TRIP</p>
                <p className="text-white text-xs">{p.last}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden lg:block bg-[#081221] border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">PASSENGER</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">CONTACT</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">BOOKINGS</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">TOTAL SPEND</th>
              <th className="px-6 py-4 ui-label text-[9px] text-muted tracking-[0.2em]">LAST TRIP</th>
              <th className="px-6 py-4"></th>
             </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {passengers.map((p, i) => (
              <tr key={i} className="hover:bg-white/5 transition-all group">
                <td className="px-6 py-6 text-white text-sm italic">{p.name}</td>
                <td className="px-6 py-6 ui-label text-[10px] text-muted">{p.phone}</td>
                <td className="px-6 py-6 ui-label text-[10px] text-white">{p.bookings}</td>
                <td className="px-6 py-6 font-ui text-gold">{p.spend}</td>
                <td className="px-6 py-6 ui-label text-[10px] text-muted">{p.last}</td>
                <td className="px-6 py-6 text-right">
                  <button className="p-2 text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-all"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettingsView = () => {
  return (
    <div className="grid grid-cols-2 gap-12">
      <div className="space-y-12">
        <section>
          <h3 className="ui-label text-[10px] text-gold tracking-[0.2em] mb-6 flex items-center gap-2">
            <Globe size={14} /> BOOKING RULES
          </h3>
          <div className="space-y-6">
            {[
              { label: 'ALLOW INSTANT BOOKING', desc: 'Routes with available seats confirm immediately.' },
              { label: 'REQUIRE PHONE VERIFICATION', desc: 'Users must verify via SMS before booking.' },
              { label: 'AUTO-CANCEL UNPAID', desc: 'Cancel bookings if GCash payment is not received in 15m.' },
            ].map((rule, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-[#081221] border border-white/5">
                <div>
                  <p className="ui-label text-[10px] text-white mb-1">{rule.label}</p>
                  <p className="text-[9px] text-muted italic">"{rule.desc}"</p>
                </div>
                <div className="w-10 h-5 bg-gold rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-ink rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="ui-label text-[10px] text-gold tracking-[0.2em] mb-6 flex items-center gap-2">
            <Bell size={14} /> NOTIFICATIONS
          </h3>
          <div className="space-y-4">
            {['EMAIL CONFIRMATIONS', 'SMS ALERTS', 'WHATSAPP WEBHOOKS'].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="ui-label text-[10px] text-muted">{item}</span>
                <div className="w-8 h-4 bg-white/10 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-12">
        <section>
          <h3 className="ui-label text-[10px] text-gold tracking-[0.2em] mb-6 flex items-center gap-2">
            <Shield size={14} /> API KEYS & WEBHOOKS
          </h3>
          <div className="space-y-6">
            {[
              { label: 'GCASH MERCHANT ID', value: 'MID-9021-XXXX-4421' },
              { label: 'TWILIO SID', value: 'AC7721XXXXXXXXXXXXXXXXXXXX' },
              { label: 'STRIPE WEBHOOK SECRET', value: 'whsec_XXXXXXXXXXXXXXXXXXXX' },
            ].map((key, i) => (
              <div key={i} className="space-y-2">
                <label className="ui-label text-[9px] text-muted">{key.label}</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value={key.value} 
                    readOnly 
                    className="flex-1 bg-[#081221] border border-white/10 p-3 ui-label text-[10px] text-white outline-none"
                  />
                  <button className="px-4 border border-white/10 ui-label text-[8px] text-muted hover:text-white transition-all">REVEAL</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="p-8 bg-gold/5 border border-gold/20">
          <h3 className="ui-label text-[10px] text-gold tracking-[0.2em] mb-4 flex items-center gap-2">
            <MessageSquare size={14} /> SYSTEM LOGS
          </h3>
          <div className="space-y-2 font-mono text-[9px] text-muted">
            <p>[10:42:01] GCash Webhook: TX-9021 Success</p>
            <p>[10:40:15] SMS Dispatch: Booking Confirmed (Santos)</p>
            <p>[10:38:22] Auth: Admin login successful from 192.168.1.1</p>
            <p className="text-gold animate-pulse">[LIVE] Listening for events...</p>
          </div>
        </section>
      </div>
    </div>
  );
};

// ============================================
// OPERATOR PROFILE SETTINGS COMPONENT
// ============================================

const OperatorProfileSettings = ({ operator, onUpdate }: { operator: Operator, onUpdate: (op: Operator) => void }) => {
  const [formData, setFormData] = React.useState(operator);
  const [isSaving, setIsSaving] = React.useState(false);
  const [vehiclePhotos, setVehiclePhotos] = React.useState<string[]>(operator.vehicle_photos || []);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Upload image to Supabase Storage
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${operator.id}-${Date.now()}.${fileExt}`;
    const filePath = `vehicle-photos/${fileName}`;

    const { error, data } = await supabase.storage
      .from('vehicle-photos')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from('vehicle-photos')
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos = [...vehiclePhotos];

    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i]);
      if (url) {
        newPhotos.push(url);
      }
    }

    setVehiclePhotos(newPhotos);
    setFormData({ ...formData, vehicle_photos: newPhotos });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    const newPhotos = vehiclePhotos.filter((_, i) => i !== index);
    setVehiclePhotos(newPhotos);
    setFormData({ ...formData, vehicle_photos: newPhotos });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('operators')
        .update({
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email,
          description: formData.description,
          location: formData.location,
          vehicle_photos: vehiclePhotos,
        })
        .eq('id', operator.id);

      if (!error) {
        onUpdate({ ...formData, vehicle_photos: vehiclePhotos });
      }
    } catch (err) {
      console.error('Save error:', err);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="ui-label text-[10px] text-gold tracking-[0.2em] mb-2">OPERATOR PROFILE</h3>
          <p className="text-3xl text-white italic">Manage your business profile</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gold text-ink px-8 py-3 ui-label text-[11px] font-bold tracking-[0.2em] flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Clock size={16} className="animate-spin" /> : <Check size={16} />}
          {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="ui-label text-[9px] text-muted">BUSINESS NAME</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#081221] border border-white/10 p-4 ui-label text-[11px] text-white outline-none focus:border-gold transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="ui-label text-[9px] text-muted">PHONE NUMBER</label>
            <div className="relative">
              <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#081221] border border-white/10 pl-12 pr-4 py-4 ui-label text-[11px] text-white outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="ui-label text-[9px] text-muted">WHATSAPP NUMBER</label>
            <div className="relative">
              <MessageSquare size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-[#081221] border border-white/10 pl-12 pr-4 py-4 ui-label text-[11px] text-white outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="ui-label text-[9px] text-muted">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="email" 
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#081221] border border-white/10 pl-12 pr-4 py-4 ui-label text-[11px] text-white outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="ui-label text-[9px] text-muted">BUSINESS DESCRIPTION</label>
            <textarea 
              rows={6}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#081221] border border-white/10 p-4 ui-label text-[11px] text-white outline-none focus:border-gold transition-colors resize-none"
              placeholder="Tell travelers about your service..."
            />
          </div>
          <div className="space-y-2">
            <label className="ui-label text-[9px] text-muted">BASE LOCATION</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[#081221] border border-white/10 pl-12 pr-4 py-4 ui-label text-[11px] text-white outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Photos Section */}
      <div className="space-y-6">
        <div>
          <h3 className="ui-label text-[10px] text-gold tracking-[0.2em] mb-2">VEHICLE GALLERY</h3>
          <p className="text-sm text-muted mb-4">Upload photos of your vehicles, boats, or fleet</p>
        </div>

        {/* Photo Grid */}
        {vehiclePhotos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vehiclePhotos.map((photo, idx) => (
              <div key={idx} className="relative group">
                <img 
                  src={photo} 
                  alt={`Vehicle ${idx + 1}`} 
                  className="w-full h-32 object-cover rounded-lg border border-white/10"
                />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className={`cursor-pointer bg-white/5 border border-white/10 px-6 py-3 ui-label text-[11px] text-white hover:border-gold transition-all flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? <Clock size={16} className="animate-spin" /> : <Camera size={16} />}
            {uploading ? 'UPLOADING...' : 'UPLOAD PHOTOS'}
          </label>
          <p className="text-[10px] text-muted">Supports JPG, PNG. Max 5MB per image.</p>
        </div>
      </div>

      <div className="p-8 bg-gold/5 border border-gold/20 flex items-start gap-4">
        <Shield size={20} className="text-gold flex-shrink-0 mt-1" />
        <div>
          <p className="ui-label text-[10px] text-white mb-2">VERIFIED OPERATOR STATUS</p>
          <p className="text-[11px] text-muted leading-relaxed">
            Your profile information is visible to travelers when they view their routes. 
            Vehicle photos help build trust and increase bookings.
          </p>
        </div>
      </div>
    </div>
  );
};
