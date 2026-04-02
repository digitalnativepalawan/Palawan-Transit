/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, MapPin, ShieldCheck, Info, Users, Anchor, Truck, Waves, Star, User } from 'lucide-react';
import { Route, TransportMode } from '../types';
import { DiamondDivider } from './UI';

interface RouteDetailsProps {
  route: Route;
  onBack: () => void;
  onBook: (route: Route) => void;
  onViewOperator: (operatorId: string) => void;
}

export const RouteDetailsView = ({ route, onBack, onBook, onViewOperator }: RouteDetailsProps) => {
  const getModeConfig = (mode: TransportMode) => {
    switch (mode) {
      case 'SHUTTLE_SHARED': return { icon: Truck, color: 'text-gold', label: 'SHARED SHUTTLE' };
      case 'SHUTTLE_PRIVATE': return { icon: Truck, color: 'text-gold', label: 'PRIVATE SHUTTLE' };
      case 'PRIVATE_4X4': return { icon: Truck, color: 'text-danger', label: 'PRIVATE 4X4' };
      case 'BANGKA': return { icon: Anchor, color: 'text-seafoam', label: 'PRIVATE BANGKA' };
      case 'ISLAND_HOPPING': return { icon: Anchor, color: 'text-seafoam', label: 'ISLAND HOPPING' };
      default: return { icon: Waves, color: 'text-gold', label: 'TRANSPORT' };
    }
  };

  const { icon: ModeIcon, color: modeColor, label: modeLabel } = getModeConfig(route.mode);
  const isTour = route.mode === 'ISLAND_HOPPING';

  // Default values if not provided
  const description = route.description || (isTour 
    ? `Experience the breathtaking beauty of ${route.to} starting from ${route.from}. This curated tour with ${route.operator} takes you to the most iconic spots, including hidden lagoons, pristine beaches, and vibrant coral reefs. Perfect for those looking to immerse themselves in Palawan's natural wonders.`
    : `Experience a seamless journey from ${route.from} to ${route.to} with ${route.operator}. This route is carefully selected for its reliability and comfort, ensuring you reach your destination safely while enjoying the scenic views of Palawan.`);
  const amenities = route.amenities || (isTour 
    ? ['Lunch Included', 'Snorkel Gear', 'Life Vest', 'Tour Guide', 'Environmental Fees']
    : ['Air Conditioning', 'Professional Driver', 'Insurance Included', 'Luggage Space']);
  const pickupPoint = route.pickupPoint || (isTour ? `${route.from} Beach / Meeting Point` : `${route.from} Main Terminal / Hotel Pickup`);
  const dropoffPoint = route.dropoffPoint || (isTour ? `${route.from} Beach / Return Point` : `${route.to} Town Center / Hotel Dropoff`);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen"
    >
      {/* Navigation */}
      <button 
        onClick={onBack} 
        className="ui-label text-muted hover:text-gold transition-colors flex items-center gap-2 mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        BACK TO {isTour ? 'TOURS' : 'RESULTS'}
      </button>

      {/* Hero Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <ModeIcon size={24} className={modeColor} />
          <span className="ui-label text-gold tracking-[0.2em]">{modeLabel}</span>
        </div>
        <h1 className="text-5xl md:text-7xl text-white italic leading-none mb-6">
          {isTour ? route.to : <>{route.from} <span className="text-gold not-italic mx-2">→</span> {route.to}</>}
        </h1>
        {isTour && <p className="ui-label text-muted mb-6 tracking-[0.2em]">OPERATING FROM {route.from.toUpperCase()}</p>}
        <div className="flex flex-wrap gap-6 text-muted ui-label">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gold" />
            <span>{route.duration}</span>
          </div>
          <button 
            onClick={() => route.operatorId && onViewOperator(route.operatorId)}
            className="flex items-center gap-2 hover:text-gold transition-colors group"
          >
            <Star size={16} className="text-gold" />
            <span className="border-b border-transparent group-hover:border-gold">{route.operator}</span>
          </button>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gold" />
            <span className={route.seatsLeft < 5 ? 'text-danger' : ''}>{route.seatsLeft} SEATS REMAINING</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-12">
          {/* Description */}
          <section>
            <h2 className="ui-label text-gold mb-4 tracking-[0.2em]">OVERVIEW</h2>
            <p className="text-white/80 font-body text-lg leading-relaxed italic">
              "{description}"
            </p>
          </section>

          <DiamondDivider />

          {/* Logistics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h2 className="ui-label text-gold mb-4 tracking-[0.2em]">DEPARTURE</h2>
              <div className="bg-surface border border-border p-6">
                <p className="text-white text-2xl mb-2">{route.departureTime}</p>
                <div className="flex items-start gap-2 text-muted text-sm">
                  <MapPin size={14} className="mt-1 flex-shrink-0" />
                  <span>{pickupPoint}</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="ui-label text-gold mb-4 tracking-[0.2em]">ARRIVAL</h2>
              <div className="bg-surface border border-border p-6">
                <p className="text-white text-2xl mb-2">~ {route.duration} later</p>
                <div className="flex items-start gap-2 text-muted text-sm">
                  <MapPin size={14} className="mt-1 flex-shrink-0" />
                  <span>{dropoffPoint}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="ui-label text-gold mb-6 tracking-[0.2em]">AMENITIES & INCLUSIONS</h2>
            <div className="grid grid-cols-2 gap-4">
              {amenities.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-muted">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                  <span className="ui-label text-[10px]">{item.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar / Booking Card */}
        <div className="space-y-8">
          <div className="bg-deep border border-gold p-8 sticky top-32 hidden md:block">
            <div className="mb-8">
              <span className="ui-label text-muted block mb-2">TOTAL PER SEAT</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl text-white price-text">₱{route.price}</span>
                <span className="ui-label text-muted text-[10px]">ALL INCLUSIVE</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-success text-sm ui-label">
                <ShieldCheck size={16} />
                <span>SECURE BOOKING</span>
              </div>
              <div className="flex items-center gap-3 text-muted text-sm ui-label">
                <Info size={16} />
                <span>{route.bookingType === 'INSTANT' ? 'INSTANT CONFIRMATION' : 'CONFIRMATION WITHIN 2H'}</span>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: '#FFFFFF' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onBook(route)}
              className="w-full bg-gold text-ink py-5 ui-label tracking-[0.2em] font-bold transition-colors"
            >
              BOOK THIS JOURNEY
            </motion.button>
            
            <p className="text-[10px] text-muted text-center mt-4 ui-label">
              NO HIDDEN FEES · CANCEL UP TO 24H BEFORE
            </p>
          </div>

          {/* Operator Info Card - Updated with View Profile button */}
          <div className="bg-surface border border-border p-6">
            <h3 className="ui-label text-gold mb-4 text-[10px]">OPERATOR INFO</h3>
            <button 
              onClick={() => route.operatorId && onViewOperator(route.operatorId)}
              className="text-white text-sm mb-2 hover:text-gold transition-colors block text-left font-semibold"
            >
              {route.operator}
            </button>
            <div className="flex items-center gap-1 text-gold mb-4">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill="currentColor" />)}
              <span className="text-[10px] text-muted ml-2">4.9/5 RATING</span>
            </div>
            <p className="text-muted text-[10px] leading-relaxed italic mb-4">
              "A trusted local partner verified by Palawan Transit for safety and service excellence."
            </p>
            <button
              onClick={() => route.operatorId && onViewOperator(route.operatorId)}
              className="w-full flex items-center justify-center gap-2 border border-gold/50 text-gold py-2 text-xs hover:bg-gold hover:text-ink transition-colors"
            >
              <User size={12} />
              VIEW OPERATOR PROFILE
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-ink/80 backdrop-blur-xl border-t border-border p-4 z-40">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <span className="ui-label text-muted text-[8px] block">TOTAL PER SEAT</span>
            <span className="text-xl text-white price-text">₱{route.price}</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => onBook(route)}
            className="flex-grow bg-gold text-ink py-4 px-6 ui-label tracking-[0.1em] font-bold text-xs"
          >
            BOOK JOURNEY
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
