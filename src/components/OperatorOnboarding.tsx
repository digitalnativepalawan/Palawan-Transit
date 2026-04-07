import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, Copy, User, Phone, Mail, MapPin, FileText } from 'lucide-react';

export const OperatorOnboarding: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSaving, setIsSaving] = useState(false);
  const [operatorId, setOperatorId] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', whatsapp: '', email: '', description: '', location: ''
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('operators')
        .insert([formData])
        .select('id, name, phone, type, location, rating, whatsapp, email, description, images, vehicle_photos, permits')
        .single();
      if (error) throw error;
      setOperatorId(data.id);
      setStep('success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(operatorId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#081221] border border-gold/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-2xl text-white font-display italic mb-2">Welcome Aboard!</h2>
          <p className="text-sm text-muted mb-6">Your operator profile has been created. Save your passkey below — you'll need it to access your portal.</p>
          
          <div className="bg-[#050B14] border border-white/10 rounded-lg p-4 mb-6">
            <p className="ui-label text-[9px] text-muted tracking-[0.2em] mb-2">YOUR OPERATOR PASSKEY</p>
            <p className="font-mono text-xs text-gold break-all">{operatorId}</p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em] rounded-lg hover:bg-[#D4AF37] transition-all mb-3"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'COPIED!' : 'COPY PASSKEY'}
          </button>

          {onComplete && (
            <button
              onClick={onComplete}
              className="w-full py-3 border border-white/10 text-muted ui-label text-[10px] tracking-[0.2em] rounded-lg hover:text-white hover:border-white/20 transition-all"
            >
              GO TO MY PORTAL
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B14] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-white italic mb-2">Join PALAWAN.TRANSIT</h1>
          <p className="text-sm text-muted">Register your transport business</p>
        </div>

        <div className="bg-[#081221] border border-white/10 rounded-xl p-6 space-y-4">
          {[
            { field: 'name', label: 'COMPANY NAME', icon: User, required: true },
            { field: 'phone', label: 'PHONE NUMBER', icon: Phone, required: true },
            { field: 'whatsapp', label: 'WHATSAPP NUMBER', icon: Phone, required: false },
            { field: 'email', label: 'EMAIL ADDRESS', icon: Mail, required: false },
            { field: 'location', label: 'BASE LOCATION', icon: MapPin, required: false },
          ].map(({ field, label, icon: Icon, required }) => (
            <div key={field} className="space-y-1">
              <label className="ui-label text-[8px] text-muted tracking-[0.2em] flex items-center gap-1">
                <Icon className="w-3 h-3" /> {label} {required && <span className="text-gold">*</span>}
              </label>
              <input
                value={(formData as any)[field]}
                onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded-lg transition-colors"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          ))}

          <div className="space-y-1">
            <label className="ui-label text-[8px] text-muted tracking-[0.2em] flex items-center gap-1">
              <FileText className="w-3 h-3" /> DESCRIPTION
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#050B14] border border-white/10 p-3 ui-label text-[10px] text-white outline-none focus:border-gold rounded-lg resize-none h-20 transition-colors"
              placeholder="Tell passengers about your service..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving || !formData.name || !formData.phone}
            className="w-full py-4 bg-gold text-ink ui-label text-[10px] font-bold tracking-[0.2em] rounded-lg hover:bg-[#D4AF37] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSaving ? 'CREATING PROFILE...' : 'CREATE OPERATOR PROFILE'}
          </button>
        </div>
      </div>
    </div>
  );
};
