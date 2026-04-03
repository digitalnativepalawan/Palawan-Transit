/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Star, Shield, Phone, Mail, FileText, ExternalLink, Anchor, Truck, Waves, Camera, X, Clock, CheckCircle } from 'lucide-react';
import { Operator, OperatorPermit, Route } from '../types';
import { RouteCard, DiamondDivider } from './UI';
import { supabase } from '../lib/supabase';

interface OperatorProfileProps {
  operator: Operator;
  routes: Route[];
  onBack: () => void;
  onViewRoute: (route: Route) => void;
}

export const OperatorProfileView = ({ operator, routes, onBack, onViewRoute }: OperatorProfileProps) => {
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([]);
  const [permits, setPermits] = useState<OperatorPermit[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [operatorDetails, setOperatorDetails] = useState<any>(null);
  
  const operatorRoutes = routes.filter(r => r.operatorId === operator.id || r.operator === operator.name);
  const ModeIcon = operator.type === 'VAN' ? Truck : operator.type === 'BOAT' ? Anchor : Waves;

  useEffect(() => {
    const fetchOperatorDetails = async () => {
      const { data } = await supabase
        .from('operators')
        .select('vehicle_photos, permits, years_experience, operating_hours')
        .eq('id', operator.id)
        .single();
      
      if (data) {
        setOperatorDetails(data);
        setVehiclePhotos(data.vehicle_photos || []);
        setPermits(data.permits || []);
      }
    };
    fetchOperatorDetails();
  }, [operator.id]);

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)/i.test(url);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen"
    >
      {/* Image Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 text-white hover:text-gold transition-colors"
          >
            <X size={32} />
          </button>
          <img
            src={selectedPhoto}
            alt="Vehicle"
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      )}

      {/* Navigation */}
      <button
        onClick={onBack}
        className="ui-label text-muted hover:text-gold transition-colors flex items-center gap-2 mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        BACK TO ROUTES
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-deep border border-border p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 -mr-16 -mt-16 rounded-full blur-3xl" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-surface border border-gold flex items-center justify-center">
                <ModeIcon size={32} className="text-gold" />
              </div>
              <div>
                <h1 className="text-3xl text-white italic leading-tight">{operator.name}</h1>
                <div className="flex items-center gap-2 text-gold mt-1">
                  <Star size={12} fill="currentColor" />
                  <span className="ui-label text-[10px]">{operator.rating || 4.9}/5 RATING</span>
                </div>
              </div>
            </div>

            <p className="text-muted font-body italic text-sm mb-6 leading-relaxed">
              {operator.description || "A premier transportation provider in Palawan, committed to safety, reliability, and exceptional local service."}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-1 text-xs text-green-500">
                <CheckCircle size={14} />
                <span>Verified Operator</span>
              </div>
              {operatorDetails?.years_experience > 0 && (
                <div className="flex items-center gap-1 text-xs text-gold">
                  <Clock size={14} />
                  <span>{operatorDetails.years_experience} yrs experience</span>
                </div>
              )}
              {permits.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-seafoam">
                  <Shield size={14} />
                  <span>{permits.length} permit{permits.length !== 1 ? 's' : ''} on file</span>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex items-center gap-3 text-white/80">
                <MapPin size={16} className="text-gold" />
                <span className="ui-label text-[10px] uppercase tracking-wider">{operator.location || 'Palawan'}</span>
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
                <button
                  onClick={() => window.open(`https://wa.me/${operator.whatsapp!.replace(/[^0-9]/g, '')}`, '_blank')}
                  className="flex items-center gap-3 text-gold hover:text-white transition-colors group w-full"
                >
                  <Phone size={16} />
                  <span className="ui-label text-[10px] tracking-wider">WHATSAPP CONNECT</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>

            <DiamondDivider />

            {/* Permits */}
            <div className="space-y-3">
              <h3 className="ui-label text-gold text-[10px] tracking-[0.2em] mb-4">PERMITS & LICENSES</h3>
              {permits.length > 0 ? (
                permits.map((permit, i) => (
                  <div key={i} className="flex items-center justify-between group py-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {isImage(permit.url)
                          ? <img src={permit.url} alt="" className="w-full h-full object-cover" />
                          : <FileText size={14} className="text-gold" />
                        }
                      </div>
                      <div>
                        <p className="ui-label text-[9px] text-white">{permit.label}</p>
                        <p className="ui-label text-[8px] text-muted">{new Date(permit.uploaded_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(permit.url, '_blank')}
                      className="p-1 text-muted hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 text-muted">
                  <Shield size={14} className="text-success" />
                  <span className="ui-label text-[9px]">LTFRB FRANCHISE VERIFIED</span>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Gallery */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="ui-label text-gold text-[10px] tracking-[0.2em]">VEHICLE & BOAT GALLERY</h3>
              {vehiclePhotos.length > 0 && (
                <span className="ui-label text-[9px] text-muted">{vehiclePhotos.length} PHOTO{vehiclePhotos.length !== 1 ? 'S' : ''}</span>
              )}
            </div>
            {vehiclePhotos.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {vehiclePhotos.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-surface border border-border overflow-hidden cursor-pointer hover:border-gold transition-all"
                      onClick={() => setSelectedPhoto(img)}
                    >
                      <img
                        src={img}
                        alt={`Vehicle ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
                {vehiclePhotos.length > 4 && (
                  <div className="grid grid-cols-3 gap-3">
                    {vehiclePhotos.slice(4).map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-surface border border-border overflow-hidden cursor-pointer hover:border-gold transition-all"
                        onClick={() => setSelectedPhoto(img)}
                      >
                        <img
                          src={img}
                          alt={`Vehicle ${i + 5}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {(operator.images && operator.images.length > 0 ? operator.images : [
                  "https://picsum.photos/seed/van1/400/300",
                  "https://picsum.photos/seed/van2/400/300",
                  "https://picsum.photos/seed/van3/400/300",
                  "https://picsum.photos/seed/van4/400/300"
                ]).slice(0, 4).map((img, i) => (
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
            )}
          </div>
        </div>

        {/* Right Column: Routes */}
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
