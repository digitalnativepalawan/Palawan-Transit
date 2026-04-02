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
import { supabase } from './lib/supabase';
import { Route, Operator, Booking, BookingStatus, TransportMode } from './types';

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
  
  // Real data from Supabase
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [operators, setOperators] = React.useState<Operator[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch data from Supabase on load
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch operators
      const { data: operatorsData, error: operatorsError } = await supabase
        .from('operators')
        .select('*');
      
      if (!operatorsError && operatorsData) {
        setOperators(operatorsData as Operator[]);
      }
      
      // Fetch routes with operator data
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select(`
          *,
          operator:operators!routes_operator_id_fkey(id, name, phone, whatsapp, rating)
        `);
      
      if (!routesError && routesData) {
        // Map database fields to what the frontend expects
        const mappedRoutes = routesData.map((route: any) => ({
          ...route,
          id: route.id,
          from: route.from_location,
          to: route.to_location,
          from_location: route.from_location,
          to_location: route.to_location,
          operator: route.operator?.name || 'Unknown Operator',
          operatorId: route.operator_id,
          seatsLeft: route.seats_left,
          departureTime: route.departure_time,
          pickupPoint: route.pickup_point,
          dropoffPoint: route.dropoff_point,
          bookingType: route.booking_type,
          mode: route.mode,
          price: route.price,
          duration: route.duration,
          amenities: route.amenities || [],
          description: route.description || `Travel from ${route.from_location} to ${route.to_location} with ${route.operator?.name || 'our trusted operator'}.`
        }));
        setRoutes(mappedRoutes);
      }
      
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!bookingsError && bookingsData) {
        setBookings(bookingsData as Booking[]);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

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
      setCurrentOperatorId(operators[0]?.id || null);
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
    // Get the current selected route and search params from state
    const currentRoute = selectedRoute;
    const currentParams = searchParams;
    
    if (!currentRoute) {
      console.error('No route selected');
      alert('Booking error: No route selected. Please go back and try again.');
      return;
    }
    
    if (!currentParams) {
      console.error('No search params');
      alert('Booking error: Missing search information. Please go back and try again.');
      return;
    }

    // Generate a simple name from phone number
    const customerName = `Guest ${phone.slice(-4)}`;

    const newBooking = {
      route_id: currentRoute.id,
      operator_id: currentRoute.operator_id,
      reference_code: ref,
      status: currentRoute.booking_type === 'INSTANT' ? 'CONFIRMED' : 'PENDING',
      date: currentParams.date,
      seats: currentParams.seats,
      total_price: currentRoute.price * currentParams.seats,
      customer_name: customerName,
      customer_email: `${customerName.replace(' ', '').toLowerCase()}@guest.com`,
      customer_phone: phone,
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([newBooking])
      .select()
      .single();

    if (error) {
      console.error('Booking error:', error);
      alert(`Booking failed: ${error.message}`);
      return;
    }

    if (data) {
      setBookings(prev => [data as Booking, ...prev]);
      setBookingRef(ref);
      setSelectedRoute(null);
      setPage('CONFIRMATION');
      window.scrollTo(0, 0);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
    
    if (!error) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      
      if (status === 'ACCEPTED') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          const message = `Hello ${booking.customer_name}, I am your operator for booking ${booking.reference_code}.`;
          window.open(`https://wa.me/${booking.customer_phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    }
  };

  const handleAddRoute = async (route: any) => {
    const { data, error } = await supabase
      .from('routes')
      .insert([{
        from_location: route.from,
        to_location: route.to,
        operator_id: route.operatorId,
        mode: route.mode,
        price: route.price,
        duration: route.duration,
        seats_left: route.seatsLeft,
        departure_time: route.departureTime,
        pickup_point: route.pickupPoint,
        dropoff_point: route.dropoffPoint,
        booking_type: route.bookingType,
        amenities: route.amenities
      }])
      .select()
      .single();
    
    if (!error && data) {
      const newRoute = {
        ...data,
        from: data.from_location,
        to: data.to_location,
        operator: route.operator,
        operatorId: data.operator_id,
        seatsLeft: data.seats_left,
        departureTime: data.departure_time,
        pickupPoint: data.pickup_point,
        dropoffPoint: data.dropoff_point,
        bookingType: data.booking_type,
        mode: data.mode,
        price: data.price,
        duration: data.duration,
        amenities: data.amenities
      };
      setRoutes(prev => [...prev, newRoute as Route]);
    }
  };

  const handleEditRoute = async (route: any) => {
    const { error } = await supabase
      .from('routes')
      .update({
        from_location: route.from,
        to_location: route.to,
        mode: route.mode,
        price: route.price,
        duration: route.duration,
        seats_left: route.seatsLeft,
        departure_time: route.departureTime,
        pickup_point: route.pickupPoint,
        dropoff_point: route.dropoffPoint,
        booking_type: route.bookingType,
        amenities: route.amenities
      })
      .eq('id', route.id);
    
    if (!error) {
      setRoutes(prev => prev.map(r => r.id === route.id ? route : r));
    }
  };

  const handleDeleteRoute = async (id: string) => {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setRoutes(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAddOperator = async (op: any) => {
    const { data, error } = await supabase
      .from('operators')
      .insert([{
        name: op.name,
        phone: op.phone,
        whatsapp: op.whatsapp,
        email: op.email,
        type: op.type,
        location: op.location,
        rating: op.rating,
        description: op.description,
        images: op.images || [],
        permits: op.permits || []
      }])
      .select()
      .single();
    
    if (!error && data) {
      setOperators(prev => [...prev, data as Operator]);
    }
  };

  const handleEditOperator = async (op: any) => {
    const { error } = await supabase
      .from('operators')
      .update({
        name: op.name,
        phone: op.phone,
        whatsapp: op.whatsapp,
        email: op.email,
        type: op.type,
        location: op.location,
        rating: op.rating,
        description: op.description,
        images: op.images,
        permits: op.permits
      })
      .eq('id', op.id);
    
    if (!error) {
      setOperators(prev => prev.map(o => o.id === op.id ? op : o));
    }
  };

  const handleDeleteOperator = async (id: string) => {
    const { error } = await supabase
      .from('operators')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setOperators(prev => prev.filter(o => o.id !== id));
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-gold text-xl">Loading Palawan Transit...</div>
      </div>
    );
  }

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

              <div className="py-12">
                <h2 className="text-4xl text-white text-center italic mb-16">The Transit Experience</h2>
                <div className="flex overflow-x-auto no-scrollbar gap-8 pb-8 snap-x snap-mandatory">
                  {[
                    { step: '01', title: 'DISCOVER', desc: 'Browse curated routes across the archipelago.' },
                    { step: '02', title: 'SECURE', desc: 'Instant confirmation with local operators.' },
                    { step: '03', title: 'EXPLORE', desc: 'Show your digital pass and start the journey.' }
                  ].map((item) => (
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
                <p className="ui-label text-muted mt-4 tracking-[0.2em]">{filteredRoutes.length} {searchParams?.to.includes('Tour') ? 'TOURS' : 'ROUTES'} FOUND · {searchParams?.date || 'TODAY'}</p>
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
                    if (!bookingRef) return;
                    const booking = bookings.find(b => b.reference_code === bookingRef);
                    if (booking) {
                      const op = operators.find(o => o.id === booking.operator_id);
                      if (op && op.whatsapp) {
                        const message = `Hello, I have a booking with reference ${booking.reference_code}.`;
                        window.open(`https://wa.me/${op.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                      }
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
