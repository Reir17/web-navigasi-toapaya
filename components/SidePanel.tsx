'use client';

import { UMKM } from '@/data/umkm';
import { X, MapPin, Clock, MessageCircle, Navigation, Tag, Store } from 'lucide-react';

interface SidePanelProps {
  umkm: UMKM | null;
  onClose: () => void;
}

export default function SidePanel({ umkm, onClose }: SidePanelProps) {
  if (!umkm) return null;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo *${umkm.nama}*, saya menemukan tempat usaha Anda melalui *Web Navigasi Toapaya*. Apakah produk ini tersedia?`
    );
    window.open(`https://wa.me/${umkm.whatsapp}?text=${text}`, '_blank');
  };

  const handleDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${umkm.lat},${umkm.lng}`,
      '_blank'
    );
  };

  return (
    <>
      {/* Backdrop Overlay untuk Mobile */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
      />

      {/* Main Drawer / Side Panel */}
      <aside className="fixed bottom-0 left-0 right-0 md:top-0 md:left-auto md:w-[420px] bg-slate-900/95 text-slate-100 z-50 rounded-t-3xl md:rounded-none shadow-2xl max-h-[88vh] md:max-h-screen overflow-y-auto flex flex-col border-t md:border-t-0 md:border-l border-slate-800 backdrop-blur-2xl transition-all duration-300 custom-scrollbar">
        
        {/* Mobile Grab Indicator */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 mb-1 md:hidden shrink-0" />

        {/* HEADER TERTUTUP (Memastikan Tombol Exit Terpisah dari Gambar) */}
        <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-white truncate">Detail Informasi</span>
          </div>

          <button
            onClick={onClose}
            title="Tutup Panel"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-all border border-slate-700/80 shadow-md active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GAMBAR BANNER LOKASI */}
        <div className="relative h-48 md:h-56 w-full bg-slate-950 shrink-0 overflow-hidden">
          <img
            src={umkm.foto || 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80'}
            alt={umkm.nama}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

          {/* Badge Status Panen / Informasi Khusus */}
          {umkm.status_panen && (
            <span className="absolute bottom-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow-lg border border-emerald-400/30 backdrop-blur-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              {umkm.status_panen}
            </span>
          )}
        </div>

        {/* KONTEN DETAIL */}
        <div className="p-4 sm:p-5 flex-1 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800/60">
                {umkm.kategori}
              </span>
              {umkm.harga_mulai && (
                <span className="text-xs font-bold text-emerald-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                  Mulai {umkm.harga_mulai}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              {umkm.nama}
            </h2>

            <p className="text-xs text-slate-400 flex items-start gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                {umkm.alamat_lengkap} {umkm.dusun && `(${umkm.dusun}${umkm.rt_rw ? `, ${umkm.rt_rw}` : ''})`}
              </span>
            </p>
          </div>

          {/* STATUS LIVE PEMILIK LAPAK */}
          {umkm.status_owner && (
            <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-2xl flex items-start gap-2.5 shadow-inner">
              <span className="text-base shrink-0">💬</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Status Pemilik:</p>
                <p className="text-xs font-semibold text-amber-200 mt-0.5 italic">"{umkm.status_owner}"</p>
              </div>
            </div>
          )}

          {/* DESKRIPSI LOKASI */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <p className="text-xs text-slate-300 leading-relaxed">
              {umkm.deskripsi || 'Tidak ada deskripsi tambahan.'}
            </p>
          </div>

          {/* DAFTAR PRODUK UNGGULAN */}
          {umkm.produk && umkm.produk.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" /> Produk & Olahan Utama
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {umkm.produk.map((p, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-emerald-950/60 text-emerald-300 font-medium px-2.5 py-1 rounded-xl border border-emerald-800/50"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* JAM OPERASIONAL */}
          {umkm.jam_buka && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-amber-400" /> Jam Buka:
              </span>
              <span className="font-semibold text-slate-200">{umkm.jam_buka}</span>
            </div>
          )}
        </div>

        {/* FOOTER ACTION BUTTONS (FIXED AT BOTTOM) */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 sticky bottom-0 space-y-2 backdrop-blur-md shrink-0">
          {umkm.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-xs transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4" /> Chat Penjual via WhatsApp
            </button>
          )}

          <button
            onClick={handleDirections}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold py-3 px-4 rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-xs transition active:scale-95"
          >
            <Navigation className="w-4 h-4 text-emerald-400" /> Petunjuk Arah (Google Maps)
          </button>
        </div>

      </aside>
    </>
  );
}