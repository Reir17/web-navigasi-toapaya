'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UMKM } from '@/data/umkm';
import { X, MessageSquare, Save, CheckCircle2, AlertCircle, Store } from 'lucide-react';

interface EditLapakModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOwner: UMKM;
  onSuccess: () => void;
}

export default function EditLapakModal({
  isOpen,
  onClose,
  currentOwner,
  onSuccess,
}: EditLapakModalProps) {
  const [statusOwner, setStatusOwner] = useState(currentOwner.status_owner || '');
  const [nama, setNama] = useState(currentOwner.nama || '');
  const [deskripsi, setDeskripsi] = useState(currentOwner.deskripsi || '');
  const [alamat, setAlamat] = useState(currentOwner.alamat_lengkap || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !currentOwner) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    const { error } = await supabase
      .from('umkm')
      .update({
        status_owner: statusOwner,
        nama,
        deskripsi,
        alamat_lengkap: alamat,
      })
      .eq('id', currentOwner.id);

    setIsSubmitting(false);

    if (error) {
      setMsg({ type: 'error', text: 'Gagal menyimpan: ' + error.message });
      return;
    }

    setMsg({ type: 'success', text: 'Data lapak & bubble chat berhasil diperbarui!' });
    onSuccess();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Kelola Lapak & Status Live</h2>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
            }`}
          >
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section Update Status Bubble */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30">
            <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Status Live / Bubble Chat Peta
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Pesan ringkas yang muncul di marker peta & pencarian.
            </p>
            <input
              type="text"
              maxLength={120}
              placeholder="Contoh: Hari ini panen cabai segar, Buka jam 8 pagi!"
              value={statusOwner}
              onChange={(e) => setStatusOwner(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-500 float-right mt-1">
              {statusOwner.length}/120 Karakter
            </span>
          </div>

          {/* Section Edit Profile Informasi */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Usaha / Lokasi</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi Singkat</label>
              <textarea
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}