/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Star, Shield, Phone, Mail, FileText, ExternalLink, Anchor, Truck, Waves } from 'lucide-react';
import { Operator, Route } from '../types';
import { RouteCard, DiamondDivider } from './UI';

interface OperatorProfileProps {
  operator: Operator;
  routes: Route[];
  onBack: () => void;
  onViewRoute: (route: Route) => void;
}

export const OperatorProfileView = ({ operator, routes, onBack, onViewRoute }: OperatorProfileProps) => {
  const operatorRoutes = routes.filter(r => r.operatorId === operator.id || r.operator === operator.name);
  const ModeIcon = operator.type === 'VAN' ? Truck : operator.type === 'BOAT' ? Anchor : Waves;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen"
    >
      {/* Navigation */}
      <button 
        onClick={onBack} 
        className="ui-label text-muted hover:text-gold transition-colors flex items-center gap-2 mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        BACK
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-deep border border-border p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 -mr-16 -mt-16 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-surface border border-gold flex items-center justify-center">
                <ModeIcon size={32} className="text-gold" />
              </div>
              <div>
                <h1 className="text-3xl text-white italic leading-tight">{operator.name}</h1>
                <div className="flex items-center gap-2 text-gold mt-1">
                  <Star size={12} fill="currentColor" />
                  <span className="ui-label text-[10px]">{operator.rating}/5 RATING</span>
                </div>
              </div>
            </div>

            <p className="text-muted font-body italic text-sm mb-8 leading-relaxed">
              {operator.description || "A premier transportation provider in Palawan, committed to safety, reliability, and exceptional local service."}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <MapPin size={16} className="text-gold" />
                <span className="ui-label text-[10px] uppercase tracking-wider">{operator.location}</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Phone size={16} className="text-gold" />
                <span className="ui-label text-[10px] tracking-wider">{operator.phone}</span>
              </div>
              {operator.email && (
                <div className="flex items-center gap-3 text-white/80">
                  <Mail size={16} className="text-gold" />
                  <span className="ui-label text-[10px] tracking-wider lowercase">{operator.email}</span>
                </div>
              )}
              {operator.whatsapp && (
                <a 
                  href={`https://wa.me/${operator.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-gold hover:text-white transition-colors group"
                >
                  <Phone size={16} />
                  <span className="ui-label text-[10px] tracking-wider">WHATSAPP CONNECT</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}
            </div>

            <DiamondDivider />

            <div className="space-y-4">
              <h3 className="ui-label text-gold text-[10px] tracking-[0.2em] mb-4">VERIFIED PERMITS</h3>
              {operator.permits?.map((permit, i) => (
                <div key={i} className="flex items-center gap-3 text-muted">
                  <Shield size={14} className="text-success" />
                  <span className="ui-label text-[9px]">{permit.toUpperCase()}</span>
                </div>
              )) || (
                <div className="flex items-center gap-3 text-muted">
                  <Shield size={14} className="text-success" />
                  <span className="ui-label text-[9px]">LTFRB FRANCHISE VERIFIED</span>
                </div>
              )}
            </div>
          </div>

          {/* Transport Images */}
          <div className="space-y-4">
            <h3 className="ui-label text-gold text-[10px] tracking-[0.2em]">FLEET GALLERY</h3>
            <div className="grid grid-cols-2 gap-4">
              {(operator.images || [
                "https://picsum.photos/seed/van1/400/300",
                "https://picsum.photos/seed/van2/400/300",
                "https://picsum.photos/seed/van3/400/300",
                "https://picsum.photos/seed/van4/400/300"
              ]).map((img, i) => (
                <div key={i} className="aspect-square bg-surface border border-border overflow-hidden group">
                  <img 
                    src={img} 
                    alt={`Fleet ${i}`} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Other Routes */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="ui-label text-gold mb-2 block">AVAILABLE JOURNEYS</span>
              <h2 className="text-5xl text-white italic">Routes by {operator.name}</h2>
            </div>
            <div className="ui-label text-muted text-[10px]">
              {operatorRoutes.length} ACTIVE ROUTES
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {operatorRoutes.map((route, i) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <RouteCard route={route} onClick={() => onViewRoute(route)} />
              </motion.div>
            ))}
            {operatorRoutes.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-border">
                <p className="ui-label text-muted">NO OTHER ROUTES LISTED AT THIS TIME</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
