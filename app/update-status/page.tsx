'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, CheckCircle2, Lock, MessageSquare, Store, AlertCircle, Sparkles, Building2, Home } from 'lucide-react';
import Link from 'next/link';
import { TipeLokasi, KategoriLokasi } from '@/data/umkm';

interface LocationItem {
  id: string;
  nama: string;
  tipe_lokasi: TipeLokasi;
  kategori: KategoriLokasi;
  status_owner: string | null;
  pin_owner: string;
}

export default function UpdateStatusPage() {
  const [locationList, setLocationList] = useState<LocationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load daftar semua lokasi dari Supabase
  useEffect(() => {
    async function loadLocations() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('umkm')
        .select('id, nama, tipe_lokasi, kategori, status_owner, pin_owner')
        .order('nama', { ascending: true });

      if (error) {
        setMessage({ type: 'error', text: 'Gagal memuat data lokasi' });
      } else if (data && data.length > 0) {
        setLocationList(data);
        setSelectedId(data[0].id);
        setStatusInput(data[0].status_owner || '');
      }
      setIsLoading(false);
    }
    loadLocations();
  }, []);

  // Saat dropdown lokasi dipilih, sesuaikan isi input status
  const handleSelectChange = (id: string) => {
    setSelectedId(id);
    const item = locationList.find((u) => u.id === id);
    if (item) {
      setStatusInput(item.status_owner || '');
    }
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const targetLocation = locationList.find((u) => u.id === selectedId);
    if (!targetLocation) return;

    // Autentikasi PIN Pemilik Unik
    if (pinInput.trim() !== targetLocation.pin_owner) {
      setMessage({ type: 'error', text: 'PIN Keamanan Salah! Anda hanya bisa mengubah status lokasi milik Anda sendiri.' });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('umkm')
      .update({ status_owner: statusInput.trim() })
      .eq('id', selectedId);

    setIsSubmitting(false);

    if (error) {
      setMessage({ type: 'error', text: `Gagal memperbarui status: ${error.message}` });
    } else {
      setMessage({ 
        type: 'success', 
        text: 'Status Live berhasil diperbarui! Perubahan langsung tampil secara Realtime di Peta Navigasi.' 
      });
      
      // Update state lokal
      setLocationList((prev) =>
        prev.map((u) => (u.id === selectedId ? { ...u, status_owner: statusInput.trim() } : u))
      );
      setPinInput('');
    }
  };

  // Preset pesan cepat yang relevan untuk UMKM, Hasil Tani/Ikan & Pemdes
  const selectedItem = locationList.find((item) => item.id === selectedId);

  const getQuickPresets = () => {
    if (!selectedItem) return [];

    if (selectedItem.tipe_lokasi === 'non_umkm') {
      if (selectedItem.kategori === 'pemerintahan') {
        return [
          'Pelayanan kantor buka seperti biasa',
          'Kantor sepi, staf sedang rapat koordinasi',
          'Pelayanan tutup sementara, buka lagi jam 13:30',
          'Ada pembuatan KTP/KK gratis hari ini',
        ];
      }
      return [
        'Ada di rumah, siap melayani warga',
        'Sedang dinas luar / rapat di kantor desa',
        'Silakan hubungi WA untuk urusan RT/RW',
      ];
    }

    // Preset UMKM & Tani/Ikan
    return [
      'Buka seperti biasa, silakan mampir!',
      'Stok nanas & ikan segar melimpah!',
      'Sedang panen di kebun/kolam belakang',
      'Tutup sebentar, buka lagi jam 14:00',
    ];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        {/* Navigasi Kembali */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Peta Navigasi
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Update Status Live Pemilik</h1>
            <p className="text-xs text-slate-400">
              Ubah pesan melayang Bubble Chat di atas lokasi Anda secara Realtime.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Memuat daftar lokasi desa...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Pilih Lokasi Anda */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-400" /> Pilih Usaha / Lokasi Anda
              </label>
              <select
                value={selectedId}
                onChange={(e) => handleSelectChange(e.target.value)}
                className="w-full bg-slate-950 text-white text-sm rounded-2xl p-3.5 border border-slate-700 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
              >
                {locationList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} ({item.tipe_lokasi === 'non_umkm' ? 'Fasilitas / Perangkat' : 'UMKM'})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Isi Pesan / Status Live */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-400" /> Pesan / Status Saat Ini
              </label>
              <input
                type="text"
                placeholder="Contoh: Panen lele baru selesai, lele segar ready!"
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
                maxLength={60}
                className="w-full bg-slate-950 text-white text-sm rounded-2xl p-3.5 border border-slate-700 focus:outline-none focus:border-amber-500 font-medium placeholder:text-slate-600"
              />
              <div className="flex justify-between items-center mt-1.5 px-1">
                <span className="text-[11px] text-slate-500">Maksimal 60 karakter.</span>
                <span className="text-[11px] text-slate-500 font-mono">{statusInput.length}/60</span>
              </div>
            </div>

            {/* Preset Pesan Cepat Dinamis */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Preset Pesan Cepat:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {getQuickPresets().map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStatusInput(preset)}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                  >
                    {preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setStatusInput('')}
                  className="text-[11px] bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 px-3 py-1.5 rounded-xl border border-rose-800/50 transition"
                >
                  ❌ Hapus Bubble Chat
                </button>
              </div>
            </div>

            {/* 3. PIN Otentikasi Pemilik */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-400" /> Masukkan PIN Keamanan Lokasi Ini
              </label>
              <input
                type="password"
                placeholder="Masukkan PIN Anda"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                required
                className="w-full bg-slate-950 text-white text-sm rounded-2xl p-3.5 border border-slate-700 focus:outline-none focus:border-rose-500 font-mono tracking-widest placeholder:tracking-normal placeholder:text-slate-600"
              />
              <p className="text-[11px] text-slate-500 mt-1 px-1">
                *Hanya pemilik lokasi yang tahu PIN ini. (Gunakan PIN default <code className="text-amber-400 bg-slate-800 px-1 rounded">1234</code> atau <code className="text-amber-400 bg-slate-800 px-1 rounded">9999</code>).
              </p>
            </div>

            {/* Notifikasi Status */}
            {message && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                  message.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Tombol Simpan */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? 'Memperbarui...' : 'Simpan & Tampilkan di Peta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}