'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UMKM, KategoriLokasi, TipeLokasi } from '@/data/umkm';
import { X, Store, Building2, Lock, Phone, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (umkm: UMKM) => void; // Disesuaikan dengan onSuccess di page.tsx
  umkmList?: UMKM[];
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State Login
  const [loginWa, setLoginWa] = useState('');
  const [loginPin, setLoginPin] = useState('');

  // Form State Register
  const [tipeLokasi, setTipeLokasi] = useState<TipeLokasi>('umkm');
  const [kategori, setKategori] = useState<KategoriLokasi>('kuliner');
  const [nama, setNama] = useState('');
  const [dusun, setDusun] = useState<'Dusun I' | 'Dusun II'>('Dusun I');
  const [rtRw, setRtRw] = useState('RT 01 / RW 01');
  const [alamat, setAlamat] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [statusOwner, setStatusOwner] = useState('');
  const [produkInput, setProdukInput] = useState('');
  const [hargaMulai, setHargaMulai] = useState('');
  const [jamBuka, setJamBuka] = useState('08:00 - 20:00 WIB');
  const [whatsapp, setWhatsapp] = useState('');
  const [foto, setFoto] = useState('');
  const [lat, setLat] = useState<number>(1.0285);
  const [lng, setLng] = useState<number>(104.5486);
  const [pin, setPin] = useState('');

  if (!isOpen) return null;

  const handleTipeChange = (tipe: TipeLokasi) => {
    setTipeLokasi(tipe);
    setKategori(tipe === 'umkm' ? 'kuliner' : 'pemerintahan');
  };

  // Process Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const cleanWa = loginWa.trim().replace(/^0/, '62');

      const { data, error } = await supabase
        .from('umkm')
        .select('*')
        .eq('whatsapp', cleanWa)
        .eq('pin_owner', loginPin.trim())
        .single();

      if (error || !data) {
        setErrorMsg('Nomor WhatsApp atau PIN salah / tidak terdaftar.');
        setIsSubmitting(false);
        return;
      }

      if (data.status_persetujuan === 'pending') {
        setErrorMsg('Pendaftaran Anda masih menunggu verifikasi Admin.');
        setIsSubmitting(false);
        return;
      }

      onSuccess(data as UMKM);
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal login.';
      setErrorMsg(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const cleanWa = whatsapp.trim().replace(/^0/, '62');
    const produkArray = produkInput
      ? produkInput.split(',').map((p) => p.trim()).filter(Boolean)
      : [];

    const payload = {
      nama,
      tipe_lokasi: tipeLokasi,
      kategori,
      dusun,
      rt_rw: rtRw,
      alamat_lengkap: alamat,
      deskripsi: deskripsi || 'Lokasi terdaftar warga.',
      status_owner: statusOwner || '',
      produk: produkArray,
      harga_mulai: tipeLokasi === 'umkm' ? hargaMulai : undefined,
      jam_buka: jamBuka,
      whatsapp: cleanWa,
      foto: foto || 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80',
      lat: isNaN(lat) ? 1.0285 : lat,
      lng: isNaN(lng) ? 104.5486 : lng,
      pin_owner: pin,
      status_persetujuan: 'pending',
    };

    const { error } = await supabase.from('umkm').insert([payload]);

    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg('Pendaftaran berhasil dikirim! Menunggu verifikasi Admin Desa.');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-5">
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition ${
              tab === 'login' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Masuk Pemilik
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition ${
              tab === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Daftar Lokasi Baru
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">No. WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="08123456789"
                  value={loginWa}
                  onChange={(e) => setLoginWa(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PIN Pemilik (4 Digit)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="****"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500 tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition"
            >
              {isSubmitting ? 'Memeriksa...' : 'Masuk Kelola Lapak'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipe Lokasi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTipeChange('umkm')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                    tipeLokasi === 'umkm'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Store className="w-4 h-4" /> UMKM / Usaha
                </button>
                <button
                  type="button"
                  onClick={() => handleTipeChange('non_umkm')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                    tipeLokasi === 'non_umkm'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Fasilitas Desa
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {tipeLokasi === 'umkm' ? 'Nama Usaha / Petani' : 'Nama Fasilitas / Pos'}
              </label>
              <input
                type="text"
                required
                placeholder={tipeLokasi === 'umkm' ? 'Kebun Cabai Pak Ahmad' : 'Posyandu / Kantor Desa'}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pesan Live / Bubble Chat (Opsional)</label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={120}
                  placeholder="Contoh: Stok nanas segar baru panen hari ini!"
                  value={statusOwner}
                  onChange={(e) => setStatusOwner(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as KategoriLokasi)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none"
                >
                  {tipeLokasi === 'umkm' ? (
                    <>
                      <option value="tani_ikan">🌾 Tani & Ikan</option>
                      <option value="kuliner">☕ Kuliner</option>
                      <option value="kerajinan">🎨 Kerajinan</option>
                      <option value="jasa">🔧 Jasa</option>
                    </>
                  ) : (
                    <>
                      <option value="pemerintahan">🏛️ Pemdes & Fasilitas</option>
                      <option value="perangkat">🏠 Rumah Perangkat</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dusun</label>
                <select
                  value={dusun}
                  onChange={(e) => setDusun(e.target.value as 'Dusun I' | 'Dusun II')}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none"
                >
                  <option value="Dusun I">Dusun I</option>
                  <option value="Dusun II">Dusun II</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="08123456789"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Buat PIN (4 Digit)</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="1234"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                required
                placeholder="Jl. Raya Toapaya RT 01..."
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition mt-2"
            >
              {isSubmitting ? 'Mengirim Data...' : 'Daftarkan Lokasi'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}