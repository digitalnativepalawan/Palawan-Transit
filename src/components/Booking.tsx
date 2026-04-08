/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, Calendar, MapPin, Users, Check, Clock, Share2, Copy, CalendarPlus, X, ArrowRight, CreditCard, Wallet, Users as UsersIcon, Ship } from 'lucide-react';
import { Route, CITIES, ISLAND_LOCATIONS, SearchType } from '../types';
import { supabase } from '../lib/supabase';

// --- Search Widget ---
export const SearchWidget = ({ onSearch }: { onSearch: (from: string, to: string, date: string, seats: number, searchType?: SearchType, groupType?: string) => void }) => {
  const [searchType, setSearchType] = React.useState<SearchType>('TRANSPORT');
  const [from, setFrom] = React.useState(CITIES[0]);
  const [to, setTo] = React.useState(CITIES[1]);

  // Sync "TO" if "FROM" changes to avoid same-city selection
  React.useEffect(() => {
    if (from === to) {
      const nextCity = CITIES.find(c => c !== from);
      if (nextCity) setTo(nextCity);
    }
  }, [from]);

  const [tourLocation, setTourLocation] = React.useState('Port Barton');
  const [selectedTour, setSelectedTour] = React.useState<any>(null);
  const [tours, setTours] = React.useState<any[]>([]);
  const [groupType, setGroupType] = React.useState<'SHARED' | 'PRIVATE'>('SHARED');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [seats, setSeats] = React.useState(1);

  // Fetch island hopping tours from database
  React.useEffect(() => {
    const fetchTours = async () => {
      const { data } = await supabase
        .from('island_hopping_tours')
        .select('*')
        .eq('is_active', true);
      if (data) setTours(data);
    };
    fetchTours();
  }, []);

  // Update selected tour when location changes
  React.useEffect(() => {
    const tour = tours.find(t => t.location === tourLocation);
    setSelectedTour(tour);
  }, [tourLocation, tours]);

  const handleSearch = () => {
    if (searchType === 'ISLAND_HOPPING') {
      // Pass tour info as "to" parameter with special format
      const tourParam = `ISLAND:${tourLocation}:${selectedTour?.tour_name || 'Tour A'}:${groupType}`;
      onSearch(tourLocation, tourParam, date, seats, 'ISLAND_HOPPING', groupType);
    } else {
      onSearch(from, to, date, seats, 'TRANSPORT');
    }
  };

  const getPriceDisplay = () => {
    if (!selectedTour) return '';
    if (groupType === 'SHARED') {
      return `₱${selectedTour.shared_price_per_person}/person`;
    } else {
      return `₱${selectedTour.private_boat_flat_rate} flat (up to ${selectedTour.max_passengers} pax)`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-deep border border-border p-6 w-full max-w-md mx-auto shadow-2xl relative z-10"
    >
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setSearchType('TRANSPORT')}
          className={`flex-1 py-3 ui-label text-[10px] tracking-[0.2em] transition-colors ${searchType === 'TRANSPORT' ? 'text-gold border-b-2 border-gold' : 'text-muted hover:text-white'}`}
        >
          TRANSPORTATION
        </button>
        <button
          onClick={() => setSearchType('ISLAND_HOPPING')}
          className={`flex-1 py-3 ui-label text-[10px] tracking-[0.2em] transition-colors ${searchType === 'ISLAND_HOPPING' ? 'text-gold border-b-2 border-gold' : 'text-muted hover:text-white'}`}
        >
          ISLAND HOPPING
        </button>
      </div>

      <div className="space-y-4">
        {searchType === 'TRANSPORT' ? (
          <>
            <div className="space-y-1">
              <label className="ui-label text-muted">FROM</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-surface border border-border px-12 py-4 text-white focus:border-seafoam focus:outline-none transition-colors appearance-none"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="ui-label text-muted">TO</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-seafoam" />
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-surface border border-border px-12 py-4 text-white focus:border-seafoam focus:outline-none transition-colors appearance-none"
                >
                  {CITIES.filter(c => c !== from).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <label className="ui-label text-muted">LOCATION</label>
              <div className="relative">
                <Ship size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
                <select
                  value={tourLocation}
                  onChange={(e) => setTourLocation(e.target.value)}
                  className="w-full bg-surface border border-border px-12 py-4 text-white focus:border-seafoam focus:outline-none transition-colors appearance-none"
                >
                  <option value="Port Barton">Port Barton</option>
                  <option value="San Vicente">San Vicente</option>
                  <option value="El Nido">El Nido</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="ui-label text-muted">SELECT TOUR</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-seafoam" />
                <select
                  value={selectedTour?.tour_name || 'Tour A - The Essential Experience'}
                  onChange={(e) => {
                    const tour = tours.find(t => t.tour_name === e.target.value);
                    setSelectedTour(tour);
                  }}
                  className="w-full bg-surface border border-border px-12 py-4 text-white focus:border-seafoam focus:outline-none transition-colors appearance-none"
                >
                  {tours.filter(t => t.location === tourLocation).map(t => (
                    <option key={t.id} value={t.tour_name}>{t.tour_name}</option>
                  ))}
                  {tours.filter(t => t.location === tourLocation).length === 0 && (
                    <option>Tour A - The Essential Experience</option>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="ui-label text-muted">BOOKING TYPE</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGroupType('SHARED')}
                  className={`py-3 border transition-all flex items-center justify-center gap-2 ${groupType === 'SHARED' ? 'bg-gold text-ink border-gold' : 'bg-surface border-border text-white hover:border-gold'}`}
                >
                  <UsersIcon size={16} />
                  <span className="ui-label text-[10px]">JOIN GROUP (SHARED)</span>
                </button>
                <button
                  onClick={() => setGroupType('PRIVATE')}
                  className={`py-3 border transition-all flex items-center justify-center gap-2 ${groupType === 'PRIVATE' ? 'bg-gold text-ink border-gold' : 'bg-surface border-border text-white hover:border-gold'}`}
                >
                  <Ship size={16} />
                  <span className="ui-label text-[10px]">PRIVATE BOAT</span>
                </button>
              </div>
            </div>

            {selectedTour && (
              <div className="bg-surface/30 p-3 rounded text-center">
                <p className="text-gold font-ui text-sm">{getPriceDisplay()}</p>
                {groupType === 'PRIVATE' && (
                  <p className="text-muted text-[8px] mt-1">Up to {selectedTour.max_passengers} passengers</p>
                )}
              </div>
            )}

            {selectedTour?.highlights && (
              <div className="text-center">
                <p className="text-muted text-[8px] tracking-wider">✨ {selectedTour.highlights.slice(0, 2).join(' · ')} ✨</p>
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="ui-label text-muted">DATE</label>
            <div className="relative group">
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-focus-within:text-seafoam transition-colors z-20 sm:w-4 sm:h-4 sm:left-4" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface border border-border pl-9 pr-1 py-4 text-white focus:border-seafoam focus:outline-none transition-colors appearance-none relative z-10 text-[10px] sm:text-sm sm:pl-12 sm:pr-4"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="ui-label text-muted">SEATS</label>
            <div className="flex items-center bg-surface border border-border h-[58px]">
              <button
                onClick={() => setSeats(Math.max(1, seats - 1))}
                className="flex-grow flex items-center justify-center text-muted hover:text-white transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-ui text-white">{seats}</span>
              <button
                onClick={() => setSeats(Math.min(selectedTour?.max_passengers || 10, seats + 1))}
                className="flex-grow flex items-center justify-center text-muted hover:text-white transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full bg-gold hover:bg-gold-light text-ink font-ui py-5 tracking-[0.2em] transition-all active:scale-[0.98]"
        >
          FIND {searchType === 'TRANSPORT' ? 'ROUTES' : 'TOURS'}
        </button>
      </div>
    </motion.div>
  );
};

// --- Booking Modal ---
export const BookingModal = ({ route, onClose, onComplete }: { route: Route; onClose: () => void; onComplete: (ref: string, phone: string, date: string) => void }) => {
  const [step, setStep] = React.useState(1);
  const [paymentMethod, setPaymentMethod] = React.useState<'ONLINE' | 'ARRIVAL'>('ONLINE');
  const [loading, setLoading] = React.useState(false);
  const [phone, setPhone] = React.useState('63');
  const [isIslandHopping, setIsIslandHopping] = React.useState(false);
  const [tourDetails, setTourDetails] = React.useState<any>(null);
  const [groupType, setGroupType] = React.useState<'SHARED' | 'PRIVATE'>('SHARED');
  const [totalPrice, setTotalPrice] = React.useState(route.price);
  const [seats, setSeats] = React.useState(1);
  const today = new Date().toISOString().split('T')[0];
  const [travelDate, setTravelDate] = React.useState(today);

  // Parse island hopping info from route.to if it's an island tour
  React.useEffect(() => {
    if (route.to && route.to.startsWith('ISLAND:')) {
      setIsIslandHopping(true);
      const parts = route.to.split(':');
      const location = parts[1];
      const tourName = parts[2];
      const group = parts[3] as 'SHARED' | 'PRIVATE';
      setGroupType(group);
      
      // Fetch tour details
      const fetchTour = async () => {
        const { data } = await supabase
          .from('island_hopping_tours')
          .select('*')
          .eq('location', location)
          .eq('tour_name', tourName)
          .single();
        if (data) {
          setTourDetails(data);
          if (group === 'SHARED') {
            setTotalPrice(data.shared_price_per_person);
          } else {
            setTotalPrice(data.private_boat_flat_rate);
          }
        }
      };
      fetchTour();
    }
  }, [route]);

  const handleComplete = () => {
    setLoading(true);
    setTimeout(() => {
      onComplete(`PT-2026-${Math.floor(10000 + Math.random() * 90000)}`, phone, travelDate);
    }, 2000);
  };

  const isPrivate = route.mode === 'SHUTTLE_PRIVATE' || route.mode === 'PRIVATE_4X4';

  const getDisplayPrice = () => {
    if (isIslandHopping && tourDetails) {
      if (groupType === 'SHARED') {
        return `₱${tourDetails.shared_price_per_person} x ${seats} seats`;
      } else {
        return `₱${tourDetails.private_boat_flat_rate} (flat rate)`;
      }
    }
    if (isPrivate) return `₱${route.price} (fixed rate)`;
    return `₱${route.price} x ${seats} seats`;
  };

  const getFinalTotal = () => {
    if (isIslandHopping && tourDetails) {
      if (groupType === 'SHARED') {
        return totalPrice * seats + 50;
      } else {
        return totalPrice + 50;
      }
    }
    if (isPrivate) return route.price + 50;
    return route.price * seats + 50;
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 350 }}
      className="fixed inset-0 z-[100] bg-ink flex flex-col pt-20"
    >
      <div className="absolute top-6 right-6">
        <button onClick={onClose} className="p-2 text-muted hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="px-6 max-w-2xl mx-auto w-full flex-grow overflow-y-auto pb-32">
        <div className="flex justify-center gap-4 mb-12">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${step >= s ? 'bg-gold' : 'bg-border'}`} />
              <span className={`ui-label text-[8px] ${step === s ? 'text-gold' : 'text-muted'}`}>
                {s === 1 ? 'DETAILS' : s === 2 ? 'PAYMENT' : 'CONFIRM'}
              </span>
            </div>
          ))}
        </div>

        <header className="mb-12 text-center">
          <h2 className="text-4xl text-white italic mb-2">
            {isIslandHopping ? tourDetails?.tour_name || 'Island Hopping' : `${route.from} → ${route.to}`}
          </h2>
          <p className="ui-label text-muted">
            {isIslandHopping ? `${tourDetails?.location || 'Port Barton'} · ${tourDetails?.duration || '09:00 AM - 04:00 PM'}` : `DEPARTING ${route.departureTime}`}
          </p>
          {isIslandHopping && tourDetails?.highlights && (
            <p className="text-gold text-[10px] mt-2">{tourDetails.highlights.slice(0, 3).join(' · ')}</p>
          )}
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <label className="ui-label text-muted">FULL NAME</label>
                <input type="text" placeholder="Juan Dela Cruz" className="w-full bg-surface border-b border-border px-4 py-4 text-white focus:border-gold focus:outline-none transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="ui-label text-muted">EMAIL ADDRESS</label>
                <input type="email" placeholder="juan@example.com" className="w-full bg-surface border-b border-border px-4 py-4 text-white focus:border-gold focus:outline-none transition-colors" />
              </div>
            <div className="space-y-1">
              <label className="ui-label text-muted">PHONE NUMBER (WHATSAPP)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="639123456789" 
                className="w-full bg-surface border-b border-border px-4 py-4 text-white focus:border-gold focus:outline-none transition-colors" 
              />
            </div>
            <div className="space-y-1">
              <label className="ui-label text-muted">TRAVEL DATE</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
                <input 
                  type="date" 
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={today}
                  className="w-full bg-surface border-b border-border pl-12 pr-4 py-4 text-white focus:border-gold focus:outline-none transition-colors" 
                />
              </div>
            </div>
              <div className="space-y-1">
                <label className="ui-label text-muted">NUMBER OF PASSENGERS</label>
                <div className="flex items-center bg-surface border border-border h-[58px]">
                  <button
                    onClick={() => setSeats(Math.max(1, seats - 1))}
                    className="flex-grow flex items-center justify-center text-muted hover:text-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-ui text-white">{seats}</span>
                  <button
                    onClick={() => setSeats(Math.min(tourDetails?.max_passengers || 10, seats + 1))}
                    className="flex-grow flex items-center justify-center text-muted hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="ui-label text-muted">SPECIAL REQUESTS</label>
                <textarea placeholder="Dietary needs, extra luggage..." className="w-full bg-surface border-b border-border px-4 py-4 text-white focus:border-gold focus:outline-none transition-colors h-24 resize-none" />
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-gold text-ink py-5 ui-label tracking-[0.2em] mt-8"
              >
                CONTINUE TO PAYMENT
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex gap-4">
                <button
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex-1 p-6 border transition-all flex flex-col items-center gap-4 ${paymentMethod === 'ONLINE' ? 'bg-surface border-gold' : 'bg-ink border-border text-muted'}`}
                >
                  <CreditCard size={32} className={paymentMethod === 'ONLINE' ? 'text-gold' : 'text-muted'} />
                  <span className="ui-label">PAY ONLINE</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('ARRIVAL')}
                  className={`flex-1 p-6 border transition-all flex flex-col items-center gap-4 ${paymentMethod === 'ARRIVAL' ? 'bg-surface border-gold' : 'bg-ink border-border text-muted'}`}
                >
                  <Wallet size={32} className={paymentMethod === 'ARRIVAL' ? 'text-gold' : 'text-muted'} />
                  <span className="ui-label">PAY ON ARRIVAL</span>
                </button>
              </div>

              <div className="bg-deep border border-border p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="ui-label text-muted">BASE FARE</span>
                  <span className="font-ui text-white">{getDisplayPrice()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="ui-label text-muted">SERVICE FEE</span>
                  <span className="font-ui text-white">₱50</span>
                </div>
                <div className="h-[1px] bg-border my-4" />
                <div className="flex justify-between items-end">
                  <span className="ui-label text-gold">TOTAL AMOUNT</span>
                  <span className="font-display text-4xl text-gold">₱{getFinalTotal().toLocaleString()}</span>
                </div>
              </div>

              {isIslandHopping && tourDetails?.inclusions && (
                <div className="text-center">
                  <p className="text-muted text-[8px] tracking-wider">✨ Includes: {tourDetails.inclusions.join(' · ')} ✨</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-border text-white py-5 ui-label tracking-[0.2em]"
                >
                  BACK
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-[2] bg-gold text-ink py-5 ui-label tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>COMPLETE BOOKING <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-deep border-t border-border p-6 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="ui-label text-muted">TOTAL</span>
          <span className="font-ui text-gold text-xl">₱{getFinalTotal().toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-muted" />
          <span className="ui-label text-muted">EXPIRES IN 14:59</span>
        </div>
      </div>
    </motion.div>
  );
};
