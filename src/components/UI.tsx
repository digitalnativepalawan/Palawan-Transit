/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Anchor, Truck, Waves, Shield, X, Phone, BookOpen } from 'lucide-react';
import { Route, BookingStatus } from '../types';
import { supabase } from '../lib/supabase';

export const DiamondDivider = () => (
  <div className="flex items-center justify-center w-full my-8">
    <div className="flex-grow h-[1px] bg-border" />
    <div className="mx-4 text-gold text-[8px]">◆</div>
    <div className="flex-grow h-[1px] bg-border" />
  </div>
);

export const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-gold text-ink',
    CONFIRMED: 'bg-success text-ink',
    CANCELLED: 'bg-danger text-ink',
    ACCEPTED: 'bg-success text-ink',
    COMPLETED: 'bg-surface text-white',
  };
  return (
    <span className={`ui-label px-2 py-1 ${styles[status] || 'bg-surface text-white'}`}>
      {status}
    </span>
  );
};

const MyBookingsModal = ({ onClose }: { onClose: () => void }) => {
  const [phone, setPhone] = React.useState('');
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSearch = async () => {
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    setLoading(true);
    setError('');
    setSearched(false);
    const normalized = phone.trim().replace(/^\+63/, '0').replace(/^63/, '0');
    const withCountry = '+63' + normalized.replace(/^0/, '');
    const { data, error: err } = await supabase
      .from('bookings')
      .select('*')
      .or(`customer_phone.eq.${normalized},customer_phone.eq.${withCountry},customer_phone.eq.${phone.trim()}`)
      .order('created_at', { ascending: false });
    if (err) {
      setError('Something went wrong. Please try again.');
    } else {
      setBookings(data || []);
      setSearched(true);
    }
    setLoading(false);
  };

  const statusColor = (status: string) => {
    if (status === 'CONFIRMED' || status === 'ACCEPTED') return 'text-success bg-success/10';
    if (status === 'PENDING') return 'text-gold bg-gold/10';
    if (status === 'CANCELLED') return 'text-danger bg-danger/10';
    return 'text-muted bg-white/5';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-deep border border-border w-full max-w-lg relative z-10 overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-border">
          <div>
            <h2 className="text-3xl text-white italic">My Bookings</h2>
            <p className="ui-label text-[10px] text-muted mt-1 tracking-[0.2em]">ENTER YOUR PHONE NUMBER TO VIEW YOUR TRIPS</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 border-b border-border">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="tel"
                placeholder="+63 912 345 6789"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full bg-surface border border-border pl-10 pr-4 py-3 text-white ui-label text-[11px] focus:border-gold outline-none"
              />
            </div>
            <button onClick={handleSearch} disabled={loading} className="px-6 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em] hover:bg-white transition-all disabled:opacity-50">
              {loading ? '...' : 'SEARCH'}
            </button>
          </div>
          {error && <p className="text-danger ui-label text-[9px] mt-2">{error}</p>}
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {searched && bookings.length === 0 && (
            <div className="p-12 text-center">
              <BookOpen size={32} className="text-muted mx-auto mb-4" />
              <p className="ui-label text-[10px] text-muted tracking-[0.2em]">NO BOOKINGS FOUND FOR THIS NUMBER</p>
              <p className="text-muted text-sm mt-2 italic">Check your number and try again</p>
            </div>
          )}
          {bookings.map((b, i) => (
            <div key={b.id} className={`p-6 ${i < bookings.length - 1 ? 'border-b border-border/50' : ''} hover:bg-white/5 transition-colors`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-ui text-gold text-sm tracking-wider">{b.reference_code}</p>
                  <p className="text-white italic text-lg mt-0.5">{b.customer_name}</p>
                </div>
                <span className={`ui-label text-[8px] px-2 py-1 ${statusColor(b.status)}`}>{b.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div><p className="ui-label text-[8px] text-muted mb-1">DATE</p><p className="text-white text-xs">{b.date}</p></div>
                <div><p className="ui-label text-[8px] text-muted mb-1">SEATS</p><p className="text-white text-xs">{b.seats}</p></div>
                <div><p className="ui-label text-[8px] text-muted mb-1">TOTAL</p><p className="text-white font-ui">₱{b.total_price?.toLocaleString()}</p></div>
                <div><p className="ui-label text-[8px] text-muted mb-1">PIN CODE</p><p className="text-gold font-ui tracking-widest">{b.pin_code || '—'}</p></div>
              </div>
              {b.status === 'PENDING' && (
                <div className="mt-4 p-3 bg-gold/5 border border-gold/20">
                  <p className="ui-label text-[9px] text-gold">AWAITING OPERATOR CONFIRMATION</p>
                </div>
              )}
              {(b.status === 'CONFIRMED' || b.status === 'ACCEPTED') && (
                <div className="mt-4 p-3 bg-success/5 border border-success/20">
                  <p className="ui-label text-[9px] text-success">BOOKING CONFIRMED — SHOW REFERENCE TO OPERATOR</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-border bg-surface/30">
          <p className="ui-label text-[9px] text-muted text-center tracking-[0.1em]">Need help? Contact us at info@palawancollective.com</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Navbar = ({ onAdminClick }: { onAdminClick: (title?: string) => void }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showBookings, setShowBookings] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-ink/90 backdrop-blur-xl border-b border-border' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="font-display text-lg tracking-[0.3em] text-white uppercase">PALAWAN</span>
            <span className="font-ui text-[10px] text-gold ml-2 hidden sm:inline">.TRANSIT</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setShowBookings(true)} className="hidden sm:flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-gold/50 text-white/60 hover:text-white transition-all ui-label text-[10px] tracking-[0.2em]">
              <BookOpen size={12} />
              MY BOOKINGS
            </button>
            <button onClick={() => onAdminClick('Admin Access')} className="group relative flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-6 py-1.5 sm:py-2.5 bg-white/5 border border-white/10 hover:border-gold/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/5 to-gold/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Shield size={10} className="text-gold/60 group-hover:text-gold transition-colors sm:w-[14px] sm:h-[14px]" />
              <span className="ui-label text-white/60 group-hover:text-white text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.3em] font-medium transition-colors">ADMIN</span>
              <div className="w-1 h-1 rounded-full bg-gold/20 group-hover:bg-gold transition-all duration-300 group-hover:scale-125 hidden sm:block" />
            </button>
            <button onClick={() => setIsMenuOpen(true)} className="p-2 text-white hover:text-gold transition-colors">
              <Menu size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showBookings && <MyBookingsModal onClose={() => setShowBookings(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-ink/95 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xs bg-deep border-l border-border h-full relative z-10 flex flex-col p-10"
            >
              <button onClick={() => setIsMenuOpen(false)} className="self-end p-2 text-muted hover:text-white transition-colors mb-12">
                <X size={24} />
              </button>
              <div className="space-y-8">
                <button onClick={() => setIsMenuOpen(false)} className="block text-4xl text-white italic hover:text-gold transition-colors text-left w-full">TRANSPORT</button>
                <button onClick={() => setIsMenuOpen(false)} className="block text-4xl text-white italic hover:text-gold transition-colors text-left w-full">ISLAND HOPPING</button>
                <button onClick={() => { setIsMenuOpen(false); setShowBookings(true); }} className="block text-4xl text-white italic hover:text-gold transition-colors text-left w-full">MY BOOKINGS</button>
                <button onClick={() => { setIsMenuOpen(false); onAdminClick('Operator Login'); }} className="block text-4xl text-white italic hover:text-gold transition-colors text-left w-full">OPERATOR PORTAL</button>
              </div>
              <div className="mt-auto">
                <p className="ui-label text-muted text-[8px] mb-4 tracking-[0.3em]">PALAWAN COLLECTIVE</p>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-gold transition-colors"><Anchor size={14} /></div>
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-gold transition-colors"><Truck size={14} /></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const RouteCard = ({ route, onClick }: { route: Route; onClick: () => void }) => {
  const isShuttle = route.mode.startsWith('SHUTTLE');
  const is4x4 = route.mode === 'PRIVATE_4X4';
  const isBoat = route.mode === 'BANGKA' || route.mode === 'ISLAND_HOPPING';
  const ModeIcon = isShuttle || is4x4 ? Truck : isBoat ? Anchor : Waves;
  const modeColor = isShuttle ? 'border-gold' : is4x4 ? 'border-danger' : isBoat ? 'border-seafoam' : 'border-gold';
  const iconColor = isShuttle ? 'text-gold' : is4x4 ? 'text-danger' : isBoat ? 'text-seafoam' : 'text-gold';
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onClick} className={`bg-deep border-l-[3px] ${modeColor} p-5 cursor-pointer transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}>
      <div className="flex justify-between items-start mb-4">
        <ModeIcon size={20} className={iconColor} />
        <span className={`ui-label px-2 py-1 border ${route.bookingType === 'INSTANT' ? 'bg-success text-ink border-success' : 'border-gold text-gold'}`}>{route.bookingType}</span>
      </div>
      <h3 className="text-2xl text-white mb-2">{route.from} → {route.to}</h3>
      <div className="ui-label text-muted flex gap-3 items-center">
        <span>{route.duration}</span>
        <span>·</span>
        <span className="text-white price-text">₱{route.price?.toLocaleString()}</span>
        <span>·</span>
        <span className={route.seatsLeft < 5 ? 'text-danger' : ''}>{route.seatsLeft} SEATS LEFT</span>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="ui-label text-[10px] text-muted">{route.operator}</span>
        <span className="ui-label text-gold text-[10px]">{route.departureTime}</span>
      </div>
    </motion.div>
  );
};

export const Footer = () => (
  <footer className="bg-deep border-t border-border pt-16 pb-8 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        <div>
          <div className="flex items-baseline mb-4">
            <span className="font-display text-lg tracking-[0.3em] text-white">PALAWAN</span>
            <span className="font-ui text-[10px] text-gold ml-2">.TRANSIT</span>
          </div>
          <p className="text-muted text-sm leading-relaxed font-body italic">"Your island journey starts here."</p>
        </div>
        <div className="flex flex-col items-center md:items-start">
          <span className="ui-label text-muted mb-4">Part of the Palawan Collective</span>
          <div className="flex gap-6 ui-label text-white">
            <a href="#" className="hover:text-gold transition-colors">Routes</a>
            <a href="#" className="hover:text-gold transition-colors">About</a>
            <a href="#" className="hover:text-gold transition-colors">Contact</a>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end">
          <span className="ui-label text-muted mb-4">Support</span>
          <p className="text-white ui-label">info@palawancollective.com</p>
        </div>
      </div>
      <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="ui-label text-muted text-[10px]">© 2026 Palawan Collective · Built for Palawan</span>
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="ui-label text-success text-[10px]">All systems operational</span>
        </div>
      </div>
    </div>
  </footer>
);
