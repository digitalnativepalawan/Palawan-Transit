/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Copy, CalendarPlus, ArrowLeft, Search, Filter, Anchor, Truck, Waves, Check, Settings, UserCheck, MapPin, Plus, Trash2, ExternalLink, Shield, MessageSquare } from 'lucide-react';
import { Navbar, Footer, RouteCard, DiamondDivider, StatusBadge } from './components/UI';
import { SearchWidget, BookingModal } from './components/Booking';
import { AdminDashboard } from './components/Dashboards';
import { RouteDetailsView } from './components/RouteDetails';
import { OperatorProfileView } from './components/OperatorProfile';
import { ROUTES as INITIAL_ROUTES, Route, Operator, Booking, BookingStatus, TransportMode } from './types';

type Page = 'LANDING' | 'RESULTS' | 'CONFIRMATION' | 'ADMIN' | 'DETAILS' | 'OPERATOR_PROFILE' | 'OPERATOR_PORTAL';

export default function App() {
  const [page, setPage] = React.useState<Page>('LANDING');
  const [selectedRoute, setSelectedRoute] = React.useState<Route | null>(null);
  const [viewingRoute, setViewingRoute] = React.useState<Route | null>(null);
  const [selectedOperator, setSelectedOperator] = React.useState<Operator | null>(null);
  const [bookingRef, setBookingRef] = React.useState<string | null>(null);
  const [searchParams, setSearchParams] = React.useState<{ from: string; to: string; date: string; seats: number } | null>(null);
  const [userRole, setUserRole] = React.useState<'USER' | 'ADMIN' | 'OPERATOR'>('USER');
  const [activeFilter, setActiveFilter] = React.useState<'ALL' | 'SHARED' | 'PRIVATE' | '4X4' | 'BOAT'>('ALL');
  const [routesPage, setRoutesPage] = React.useState(1);
  const ROUTES_PER_PAGE = 6;
  
  // Local data (simulating database)
  const [routes, setRoutes] = React.useState<Route[]>(INITIAL_ROUTES);
  const [operators, setOperators] = React.useState<Operator[]>([
    { 
      id: 'op-1', 
      name: 'Fortwally Transport', 
      phone: '639123456789', 
      type: 'VAN', 
      location: 'Puerto Princesa',
      rating: 4.8,
      email: 'bookings@fortwally.com',
      whatsapp: '639123456789',
      permits: ['LTFRB-2024-001', 'DOT-ACCREDITED-2024'],
      description: 'The most reliable shuttle service between Puerto Princesa and El Nido. Our fleet of modern, air-conditioned vans ensures a comfortable journey.',
      images: [
        'https://picsum.photos/seed/fortwally1/800/600',
        'https://picsum.photos/seed/fortwally2/800/600',
        'https://picsum.photos/seed/fortwally3/800/600'
      ]
    },
    { 
      id: 'op-2', 
      name: 'El Nido Boatmen', 
      phone: '639987654321', 
      type: 'BOAT', 
      location: 'El Nido',
      rating: 4.9,
      email: 'tours@elnidoboatmen.ph',
      whatsapp: '639987654321',
      permits: ['PCG-SAFETY-CERT-2024', 'EL-NIDO-TOURISM-042'],
      description: 'Expert local boatmen providing the best island hopping experiences in El Nido. Safety is our priority, and our boats are well-maintained and fully equipped.',
      images: [
        'https://picsum.photos/seed/boat1/800/600',
        'https://picsum.photos/seed/boat2/800/600',
        'https://picsum.photos/seed/boat3/800/600'
      ]
    },
    {
      id: 'op-3',
      name: 'Montenegro Lines',
      phone: '639111222333',
      type: 'BOAT',
      location: 'Coron',
      rating: 4.5,
      whatsapp: '639111222333',
      description: 'Fast ferry services connecting El Nido and Coron.'
    },
    {
      id: 'op-4',
      name: 'Recaro Transport',
      phone: '639444555666',
      type: 'VAN',
      location: 'Puerto Princesa',
      rating: 4.7,
      whatsapp: '639444555666',
      description: 'Reliable shuttle services to Port Barton.'
    },
    {
      id: 'op-6',
      name: 'Palawan 4x4 Expeditions',
      phone: '639777888999',
      type: 'PRIVATE',
      location: 'Puerto Princesa',
      rating: 4.9,
      whatsapp: '639777888999',
      description: 'Off-road luxury expeditions across Palawan.'
    }
  ]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);

  const [showPasskeyModal, setShowPasskeyModal] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState('Secure Access');
  const [passkey, setPasskey] = React.useState('');
  const [passkeyError, setPasskeyError] = React.useState(false);

  const [currentOperatorId, setCurrentOperatorId] = React.useState<string | null>(null);

  const handleAdminAccess = (title: string = 'Secure Access') => {
    setModalTitle(title);
    setShowPasskeyModal(true);
  };

  const verifyPasskey = () => {
    const normalizedPasskey = passkey.trim().toUpperCase();
    if (normalizedPasskey === "5309") {
      setUserRole('ADMIN');
      setPage('ADMIN');
      setShowPasskeyModal(false);
      setPasskey('');
      setPasskeyError(false);
    } else if (normalizedPasskey === "OP123") {
      setUserRole('OPERATOR');
      setCurrentOperatorId('op-1'); // Hardcoded for demo
      setPage('OPERATOR_PORTAL');
      setShowPasskeyModal(false);
      setPasskey('');
      setPasskeyError(false);
    } else {
      setPasskeyError(true);
      setTimeout(() => setPasskeyError(false), 500);
    }
  };

  const handleSearch = (from: string, to: string, date: string, seats: number) => {
    setSearchParams({ from, to, date, seats });
    setPage('RESULTS');
    setActiveFilter('ALL');
    window.scrollTo(0, 0);
  };

  const handleViewDetails = (route: Route) => {
    setViewingRoute(route);
    setPage('DETAILS');
    window.scrollTo(0, 0);
  };

  const handleViewOperator = (operatorId: string) => {
    const op = operators.find(o => o.id === operatorId);
    if (op) {
      setSelectedOperator(op);
      setPage('OPERATOR_PROFILE');
      window.scrollTo(0, 0);
    }
  };

  const handleBook = (route: Route) => {
    setSelectedRoute(route);
  };

  const handleBookingComplete = async (ref: string, phone: string) => {
    if (!selectedRoute) return;

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      routeId: selectedRoute.id,
      date: searchParams?.date || new Date().toISOString().split('T')[0],
      seats: searchParams?.seats || 1,
      status: selectedRoute.bookingType === 'INSTANT' ? 'CONFIRMED' : 'PENDING',
      customerName: 'Guest User',
      customerEmail: 'guest@example.com',
      customerPhone: phone,
      totalPrice: selectedRoute.price * (searchParams?.seats || 1),
      referenceCode: ref,
      operatorId: selectedRoute.operatorId,
      createdAt: new Date().toISOString(),
    };

    setBookings(prev => [newBooking, ...prev]);
    setBookingRef(ref);
    setSelectedRoute(null);
    setPage('CONFIRMATION');
    window.scrollTo(0, 0);
  };

  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking && status === 'ACCEPTED') {
      const message = `Hello ${booking.customerName}, I am your operator for Palawan Transit booking ${booking.referenceCode}.`;
      window.open(`https://wa.me/${booking.customerPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const handleAcceptPin = async (booking: Booking) => {
    setBookings(prev => prev.map(b => 
      b.id === booking.id ? { ...b, status: 'ACCEPTED', operatorId: 'local-op' } : b
    ));
    
    // Open WhatsApp
    const message = `Hello ${booking.customerName}, I am your operator for Palawan Transit booking ${booking.referenceCode}.`;
    window.open(`https://wa.me/${booking.customerPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddRoute = (route: any) => {
    const newRoute = { ...route, id: Math.random().toString(36).substr(2, 9) };
    setRoutes(prev => [...prev, newRoute]);
  };

  const handleEditRoute = (route: any) => {
    setRoutes(prev => prev.map(r => r.id === route.id ? route : r));
  };

  const handleDeleteRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  const handleAddOperator = (op: any) => {
    const newOp = { ...op, id: Math.random().toString(36).substr(2, 9) };
    setOperators(prev => [...prev, newOp]);
  };

  const handleEditOperator = (op: any) => {
    setOperators(prev => prev.map(o => o.id === op.id ? op : o));
  };

  const handleDeleteOperator = (id: string) => {
    setOperators(prev => prev.filter(o => o.id !== id));
  };

  const filteredRoutes = routes.filter(r => {
    if (!searchParams) return true;
    const matchesSearch = r.from === searchParams.from && r.to === searchParams.to;
    if (!matchesSearch) return false;

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'SHARED') return r.mode === 'SHUTTLE_SHARED';
    if (activeFilter === 'PRIVATE') return r.mode === 'SHUTTLE_PRIVATE';
    if (activeFilter === '4X4') return r.mode === 'PRIVATE_4X4';
    if (activeFilter === 'BOAT') return r.mode === 'BANGKA' || r.mode === 'ISLAND_HOPPING';
    return true;
  });

  const paginatedRoutes = filteredRoutes.slice(0, routesPage * ROUTES_PER_PAGE);
  const hasMoreRoutes = paginatedRoutes.length < filteredRoutes.length;

  return (
    <div className="min-h-screen bg-ink selection:bg-gold selection:text-ink overflow-x-hidden">
      <div className="noise-overlay" />
      <Navbar onAdminClick={handleAdminAccess} />
      
      <AnimatePresence>
        {showPasskeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-ink/95 backdrop-blur-md" onClick={() => setShowPasskeyModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-deep border border-border p-10 max-w-sm w-full relative z-10 text-center"
            >
              <Shield size={40} className="text-gold mx-auto mb-6" />
              <h2 className="text-3xl text-white italic mb-2">{modalTitle}</h2>
              <p className="ui-label text-muted mb-8 tracking-[0.2em]">ENTER PASSKEY TO CONTINUE</p>
              
              <div className="space-y-6">
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && verifyPasskey()}
                  autoFocus
                  className={`w-full bg-surface border ${passkeyError ? 'border-danger' : 'border-border'} px-4 py-4 text-center text-2xl tracking-[0.5em] text-white focus:border-gold focus:outline-none transition-all`}
                  placeholder="••••"
                />
                {passkeyError && <p className="text-danger ui-label text-[10px]">INVALID PASSKEY</p>}
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => setShowPasskeyModal(false)}
                    className="py-4 border border-border text-muted ui-label text-[10px] hover:text-white transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={verifyPasskey}
                    className="py-4 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em]"
                  >
                    VERIFY
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {page === 'LANDING' && (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* Hero Section */}
            <section className="relative min-h-[100svh] pt-32 pb-20 flex flex-col justify-center px-6 topo-bg overflow-hidden">
              <div className="vignette absolute inset-0 pointer-events-none" />
              <div className="max-w-7xl mx-auto w-full relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-12"
                >
                  <h1 className="text-6xl md:text-9xl text-white leading-[0.9] mb-6">
                    Move Through<br />
                    <span className="italic text-gold">Palawan.</span>
                  </h1>
                  <p className="ui-label text-muted tracking-[0.2em]">
                    Shuttles. Bangkas. All in one booking.
                  </p>
                </motion.div>

                <SearchWidget onSearch={handleSearch} />
              </div>
            </section>

            {/* Featured Routes */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <span className="ui-label text-gold mb-2 block">RECOMMENDED</span>
                  <h2 className="text-5xl text-white italic">Featured Routes</h2>
                </div>
                <button onClick={() => setPage('RESULTS')} className="ui-label text-muted hover:text-gold transition-colors flex items-center gap-2">
                  VIEW ALL <ArrowLeft size={14} className="rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredRoutes.slice(0, 3).map((route, i) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <RouteCard route={route} onClick={() => handleViewDetails(route)} />
                  </motion.div>
                ))}
              </div>
              
              <DiamondDivider />

              {/* How It Works */}
              <div className="py-12">
                <h2 className="text-4xl text-white text-center italic mb-16">The Transit Experience</h2>
                <div className="flex overflow-x-auto no-scrollbar gap-8 pb-8 snap-x snap-mandatory">
                  {[
                    { step: '01', title: 'DISCOVER', desc: 'Browse curated routes across the archipelago.' },
                    { step: '02', title: 'SECURE', desc: 'Instant confirmation with local operators.' },
                    { step: '03', title: 'EXPLORE', desc: 'Show your digital pass and start the journey.' }
                  ].map((item, i) => (
                    <div key={item.step} className="min-w-[280px] flex-1 bg-deep border border-border p-8 snap-center">
                      <span className="font-ui text-4xl text-gold/20 block mb-4">{item.step}</span>
                      <h3 className="ui-label text-gold mb-2">{item.title}</h3>
                      <p className="text-muted font-body italic text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </motion.main>
        )}

        {page === 'OPERATOR_PORTAL' && (
          <AdminDashboard
            bookings={bookings}
            routes={routes}
            operators={operators}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onAddRoute={handleAddRoute}
            onEditRoute={handleEditRoute}
            onDeleteRoute={handleDeleteRoute}
            onAddOperator={handleAddOperator}
            onEditOperator={handleEditOperator}
            onDeleteOperator={handleDeleteOperator}
            onBack={() => setPage('LANDING')}
            isOperatorPortal={true}
            operatorId={currentOperatorId || undefined}
          />
        )}

        {page === 'ADMIN' && (
          <AdminDashboard 
            routes={routes} 
            operators={operators} 
            bookings={bookings}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onAddRoute={handleAddRoute}
            onEditRoute={handleEditRoute}
            onDeleteRoute={handleDeleteRoute}
            onAddOperator={handleAddOperator}
            onEditOperator={handleEditOperator}
            onDeleteOperator={handleDeleteOperator}
            onBack={() => setPage('LANDING')} 
          />
        )}

        {page === 'DETAILS' && viewingRoute && (
          <RouteDetailsView
            route={viewingRoute}
            onBack={() => setPage(searchParams ? 'RESULTS' : 'LANDING')}
            onBook={handleBook}
            onViewOperator={handleViewOperator}
          />
        )}

        {page === 'OPERATOR_PROFILE' && selectedOperator && (
          <OperatorProfileView
            operator={selectedOperator}
            routes={routes}
            onBack={() => setPage('DETAILS')}
            onViewRoute={handleViewDetails}
          />
        )}

        {page === 'RESULTS' && (
          <motion.main
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
              <div>
                <button onClick={() => setPage('LANDING')} className="ui-label text-muted hover:text-gold transition-colors flex items-center gap-2 mb-4">
                  <ArrowLeft size={14} /> BACK TO SEARCH
                </button>
                <h1 className="text-6xl text-white italic leading-none">
                  {searchParams?.to.includes('Tour') ? searchParams.to : (
                    <>{searchParams?.from || 'Puerto Princesa'} <span className="text-gold text-4xl not-italic mx-2">→</span> {searchParams?.to || 'El Nido'}</>
                  )}
                </h1>
                {searchParams?.to.includes('Tour') && (
                  <p className="ui-label text-muted mt-4 tracking-[0.2em]">OPERATING FROM {searchParams.from.toUpperCase()}</p>
                )}
                <p className="ui-label text-muted mt-4 tracking-[0.2em]">{filteredRoutes.length} {searchParams?.to.includes('Tour') ? 'TOURS' : 'ROUTES'} FOUND · 01 APR 2026</p>
              </div>
              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setActiveFilter('ALL')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 border px-6 py-3 ui-label transition-colors ${activeFilter === 'ALL' ? 'bg-gold text-ink border-gold' : 'bg-surface border-border text-white hover:border-gold'}`}
                >
                  ALL
                </button>
                <button 
                  onClick={() => setActiveFilter('SHARED')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 border px-6 py-3 ui-label transition-colors ${activeFilter === 'SHARED' ? 'bg-gold text-ink border-gold' : 'bg-surface border-border text-white hover:border-gold'}`}
                >
                  <Truck size={16} /> SHARED
                </button>
                <button 
                  onClick={() => setActiveFilter('PRIVATE')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 border px-6 py-3 ui-label transition-colors ${activeFilter === 'PRIVATE' ? 'bg-gold text-ink border-gold' : 'bg-surface border-border text-white hover:border-gold'}`}
                >
                  <Truck size={16} /> PRIVATE
                </button>
                <button 
                  onClick={() => setActiveFilter('4X4')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 border px-6 py-3 ui-label transition-colors ${activeFilter === '4X4' ? 'bg-gold text-ink border-gold' : 'bg-surface border-border text-white hover:border-gold'}`}
                >
                  <Truck size={16} /> 4X4
                </button>
                <button 
                  onClick={() => setActiveFilter('BOAT')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 border px-6 py-3 ui-label transition-colors ${activeFilter === 'BOAT' ? 'bg-gold text-ink border-gold' : 'bg-surface border-border text-white hover:border-gold'}`}
                >
                  <Anchor size={16} /> BANGKAS
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedRoutes.map((route, i) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <RouteCard route={route} onClick={() => handleViewDetails(route)} />
                </motion.div>
              ))}
              {filteredRoutes.length === 0 && (
                <div className="col-span-full py-24 text-center border border-dashed border-border">
                  <p className="ui-label text-muted tracking-[0.3em]">NO ROUTES FOUND FOR THIS SELECTION</p>
                  <button onClick={() => setPage('LANDING')} className="mt-6 text-gold ui-label text-xs hover:underline">TRY ANOTHER SEARCH</button>
                </div>
              )}
            </div>

            {hasMoreRoutes && (
              <div className="mt-16 text-center">
                <button 
                  onClick={() => setRoutesPage(prev => prev + 1)}
                  className="px-12 py-4 border border-gold/30 text-gold ui-label text-[10px] hover:bg-gold hover:text-ink transition-all tracking-[0.3em]"
                >
                  LOAD MORE ROUTES
                </button>
              </div>
            )}
          </motion.main>
        )}

        {page === 'CONFIRMATION' && (
          <motion.main
            key="confirmation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="max-w-md w-full"
            >
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-success/30">
                <Check size={40} className="text-success" />
              </div>
              <h1 className="text-5xl text-white italic mb-4">Your booking is confirmed.</h1>
              <p className="ui-label text-muted mb-12 tracking-[0.2em]">PACK YOUR BAGS, PALAWAN AWAITS.</p>

              <motion.div
                initial={{ boxShadow: '0 0 0px rgba(201, 148, 58, 0)' }}
                animate={{ boxShadow: '0 0 40px rgba(201, 148, 58, 0.2)' }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
                className="bg-deep border border-gold p-8 mb-12 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
                <span className="ui-label text-muted block mb-4">REFERENCE CODE</span>
                <h2 className="font-ui text-4xl text-gold tracking-[0.1em] mb-4">{bookingRef}</h2>
                <p className="ui-label text-[8px] text-muted tracking-[0.2em]">PRESENT THIS CODE TO YOUR OPERATOR</p>
              </motion.div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <button 
                  onClick={() => bookingRef && navigator.clipboard.writeText(bookingRef)}
                  className="flex flex-col items-center gap-2 p-4 bg-surface border border-border hover:border-gold transition-colors group"
                >
                  <Copy size={20} className="text-muted group-hover:text-gold" />
                  <span className="ui-label text-[8px]">COPY CODE</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-surface border border-border hover:border-gold transition-colors group">
                  <CalendarPlus size={20} className="text-muted group-hover:text-gold" />
                  <span className="ui-label text-[8px]">CALENDAR</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-surface border border-border hover:border-gold transition-colors group">
                  <Share2 size={20} className="text-muted group-hover:text-gold" />
                  <span className="ui-label text-[8px]">SHARE</span>
                </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => {
                    if (!bookingRef) {
                      console.error('No booking reference found');
                      return;
                    }
                    const booking = bookings.find(b => b.referenceCode === bookingRef);
                    if (booking) {
                      const op = operators.find(o => o.id === booking.operatorId);
                      if (op && op.whatsapp) {
                        const message = `Hello, I have a booking with reference ${booking.referenceCode}.`;
                        window.open(`https://wa.me/${op.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                      } else {
                        console.error('Operator or WhatsApp number not found', { booking, op });
                        // Fallback to a general support number if needed
                        window.open(`https://wa.me/639123456789?text=${encodeURIComponent('Support: Booking ' + booking.referenceCode)}`, '_blank');
                      }
                    } else {
                      console.error('Booking not found in state', { bookingRef, bookings });
                    }
                  }}
                  className="w-full py-4 bg-success text-white ui-label text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:text-ink transition-all"
                >
                  <MessageSquare size={16} />
                  CONTACT OPERATOR ON WHATSAPP
                </button>
                <button 
                  onClick={() => setPage('LANDING')}
                  className="w-full border border-border text-white py-5 ui-label tracking-[0.2em] hover:bg-surface transition-colors"
                >
                  RETURN TO HOME
                </button>
              </div>
            </motion.div>
          </motion.main>
        )}
      </AnimatePresence>

      <Footer />

      <AnimatePresence>
        {selectedRoute && (
          <BookingModal
            route={selectedRoute}
            onClose={() => setSelectedRoute(null)}
            onComplete={handleBookingComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
