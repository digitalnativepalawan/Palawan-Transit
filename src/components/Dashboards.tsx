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

    const { error: uploadError, data } = await supabase.storage
      .from('vehicle-photos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
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
            Your profile information is visible to travelers when they view your routes. 
            Vehicle photos help build trust and increase bookings.
          </p>
        </div>
      </div>
    </div>
  );
};
