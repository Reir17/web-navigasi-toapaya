'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { UMKM, KategoriLokasi, TipeLokasi } from '@/data/umkm';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  MapPin,
  Navigation,
  Store,
  CheckCircle2,
  AlertCircle,
  Building2,
  Edit3,
  X,
  Search,
  Check,
  XCircle,
  RefreshCw,
  Filter,
  Eye,
  Clock,
  Phone,
  Tag,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

const AdminMapPicker = dynamic(() => import('@/components/AdminMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-900 rounded-2xl animate-pulse flex items-center justify-center text-slate-500 text-xs font-semibold">
      Memuat Peta Penentu Lokasi...
    </div>
  ),
});

export default function AdminPage() {
  const [listLocations, setListLocations] = useState<UMKM[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<UMKM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'umkm' | 'non_umkm'>('all');

  // Modal Edit Status & Full Edit State
  const [editingStatusItem, setEditingStatusItem] = useState<UMKM | null>(null);
  const [adminStatusInput, setAdminStatusInput] = useState('');

  const [fullEditItem, setFullEditItem] = useState<UMKM | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UMKM>>({});

  // Form Tambah Baru
  const [formData, setFormData] = useState({
    nama: '',
    tipe_lokasi: 'umkm' as TipeLokasi,
    kategori: 'tani_ikan' as KategoriLokasi,
    dusun: 'Dusun I' as 'Dusun I' | 'Dusun II',
    rt_rw: 'RT 01 / RW 01',
    lat: 1.0285,
    lng: 104.5486,
    deskripsi: '',
    produk: '',
    jam_buka: '08:00 - 16:00 WIB',
    whatsapp: '6281234567890',
    status_panen: '',
    status_owner: '',
    pin_owner: '1234',
    harga_mulai: '',
    foto: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80',
    alamat_lengkap: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('umkm')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal memuat data:', error.message);
    } else {
      setListLocations(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...listLocations];

    if (filterTab === 'pending') {
      result = result.filter((item) => item.status_persetujuan === 'pending');
    } else if (filterTab === 'umkm') {
      result = result.filter((item) => item.tipe_lokasi === 'umkm');
    } else if (filterTab === 'non_umkm') {
      result = result.filter((item) => item.tipe_lokasi === 'non_umkm');
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.nama.toLowerCase().includes(q) ||
          item.dusun.toLowerCase().includes(q) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(q)) ||
          item.kategori.toLowerCase().includes(q)
      );
    }

    setFilteredLocations(result);
  }, [listLocations, searchQuery, filterTab]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Fitur Geolocation tidak didukung oleh browser Anda.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setMessage({
          type: 'success',
          text: 'Lokasi GPS Admin berhasil dikunci secara presisi!',
        });
      },
      (error) => {
        alert(`Gagal mengambil lokasi GPS: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const produkArray = formData.produk
      ? formData.produk
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p !== '')
      : [];

    const newLocation = {
      nama: formData.nama,
      tipe_lokasi: formData.tipe_lokasi,
      kategori: formData.kategori,
      dusun: formData.dusun,
      rt_rw: formData.rt_rw,
      lat: formData.lat,
      lng: formData.lng,
      deskripsi: formData.deskripsi,
      produk: produkArray.length > 0 ? produkArray : null,
      jam_buka: formData.jam_buka,
      whatsapp: formData.whatsapp,
      status_panen: formData.status_panen || null,
      status_owner: formData.status_owner ? formData.status_owner.trim() : null,
      pin_owner: formData.pin_owner || '1234',
      harga_mulai: formData.harga_mulai ? formData.harga_mulai.trim() : null,
      foto: formData.foto,
      alamat_lengkap: formData.alamat_lengkap,
      status_persetujuan: 'approved',
    };

    const { error } = await supabase.from('umkm').insert([newLocation]);

    setIsSubmitting(false);

    if (error) {
      setMessage({ type: 'error', text: `Gagal menambah lokasi: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: 'Lokasi baru berhasil ditambahkan ke Peta Desa!' });
      setFormData({
        nama: '',
        tipe_lokasi: 'umkm',
        kategori: 'tani_ikan',
        dusun: 'Dusun I',
        rt_rw: 'RT 01 / RW 01',
        lat: 1.0285,
        lng: 104.5486,
        deskripsi: '',
        produk: '',
        jam_buka: '08:00 - 16:00 WIB',
        whatsapp: '6281234567890',
        status_panen: '',
        status_owner: '',
        pin_owner: '1234',
        harga_mulai: '',
        foto: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80',
        alamat_lengkap: '',
      });
      loadData();
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus lokasi "${nama}"?`)) return;

    const { error } = await supabase.from('umkm').delete().eq('id', id);

    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
    } else {
      loadData();
    }
  };

  // Fitur Approval Status (Setujui / Tolak Pendaftaran Warga)
  const handleUpdateApproval = async (id: string, newStatus: 'approved' | 'rejected') => {
    const actionText = newStatus === 'approved' ? 'menyetujui' : 'menolak';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} pendaftaran lokasi ini?`)) return;

    const { error } = await supabase
      .from('umkm')
      .update({ status_persetujuan: newStatus })
      .eq('id', id);

    if (error) {
      alert(`Gagal memperbarui status persetujuan: ${error.message}`);
    } else {
      loadData();
    }
  };

  // Status Quick Edit Modal
  const handleOpenEditStatus = (item: UMKM) => {
    setEditingStatusItem(item);
    setAdminStatusInput(item.status_owner || '');
  };

  const handleSaveAdminStatus = async () => {
    if (!editingStatusItem) return;

    const { error } = await supabase
      .from('umkm')
      .update({ status_owner: adminStatusInput.trim() !== '' ? adminStatusInput.trim() : null })
      .eq('id', editingStatusItem.id);

    if (error) {
      alert(`Gagal memperbarui status: ${error.message}`);
    } else {
      setEditingStatusItem(null);
      loadData();
    }
  };

 // Full Edit Modal Setup
  const handleOpenFullEdit = (item: UMKM) => {
    setFullEditItem(item);
    
    // Konversi array produk menjadi string berpisah koma untuk input form
    const produkString = Array.isArray(item.produk) 
      ? item.produk.join(', ') 
      : (item.produk as unknown as string) || '';

    setEditFormData({
      ...item,
      produk: produkString as any, // Cast sebagai any agar tidak bentrok dengan tipe UMKM['produk']
    });
  };

  const handleSaveFullEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullEditItem) return;

    // Ambil data produk dan tangani tipenya
    const rawProduk = (editFormData as any).produk;

    let produkArray: string[] | null = null;

    if (typeof rawProduk === 'string' && rawProduk.trim() !== '') {
      produkArray = rawProduk
        .split(',')
        .map((p: string) => p.trim())
        .filter((p: string) => p !== '');
    } else if (Array.isArray(rawProduk)) {
      produkArray = rawProduk;
    }

    const updatedData = {
      ...editFormData,
      produk: produkArray && produkArray.length > 0 ? produkArray : null,
    };

    const { error } = await supabase
      .from('umkm')
      .update(updatedData)
      .eq('id', fullEditItem.id);

    if (error) {
      alert(`Gagal memperbarui data: ${error.message}`);
    } else {
      setFullEditItem(null);
      loadData();
    }
  };

  const pendingCount = listLocations.filter((i) => i.status_persetujuan === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Peta Utama
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Store className="w-7 h-7 text-emerald-500" /> Panel Super Admin Desa Toapaya
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Kelola lokasi UMKM, Pertanian, Perikanan, Kantor Desa, dan Rumah Perangkat secara terpusat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-xl transition flex items-center gap-1.5 font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              Refresh Data
            </button>
            <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{listLocations.length} Total Lokasi</span>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM TAMBAH LOKASI BARU (LEFT COLUMN) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 h-fit sticky top-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" /> Tambah Lokasi Baru
            </h2>

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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Tipe Lokasi *
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        tipe_lokasi: 'umkm',
                        kategori: 'tani_ikan',
                      }))
                    }
                    className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      formData.tipe_lokasi === 'umkm'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Store className="w-4 h-4" /> UMKM & Hasil Tani
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        tipe_lokasi: 'non_umkm',
                        kategori: 'pemerintahan',
                      }))
                    }
                    className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      formData.tipe_lokasi === 'non_umkm'
                        ? 'bg-sky-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> Non-UMKM / Pemdes
                  </button>
                </div>
              </div>

              {/* MAP & GPS PICKER */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" /> Klik Peta Titik Lokasi Presisi
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="text-[11px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold px-2.5 py-1 rounded-xl border border-emerald-500/30 transition flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" /> GPS Admin
                  </button>
                </div>

                <AdminMapPicker
                  lat={formData.lat}
                  lng={formData.lng}
                  onLocationSelect={(lat, lng) =>
                    setFormData((prev) => ({ ...prev, lat, lng }))
                  }
                />

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-500 block text-[10px]">Lat:</span>
                    <span className="font-mono text-emerald-400 font-bold">{formData.lat.toFixed(6)}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-500 block text-[10px]">Lng:</span>
                    <span className="font-mono text-emerald-400 font-bold">{formData.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>

              {/* NAMA & KATEGORI */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    {formData.tipe_lokasi === 'umkm' ? 'Nama Usaha / Petani / Peternak *' : 'Nama Kantor / Perangkat Desa *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      formData.tipe_lokasi === 'umkm'
                        ? 'Contoh: Budidaya Lele Pak Joko'
                        : 'Contoh: Rumah Pak RT 02 (Bpk. Herman)'
                    }
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Kategori Lokasi *</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as KategoriLokasi })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    {formData.tipe_lokasi === 'umkm' ? (
                      <>
                        <option value="tani_ikan">🌾🐟 Pertanian & Perikanan</option>
                        <option value="kuliner">☕ Kuliner & Makanan</option>
                        <option value="kerajinan">🎨 Kerajinan Tangan</option>
                        <option value="jasa">🔧 Jasa & Bengkel</option>
                      </>
                    ) : (
                      <>
                        <option value="pemerintahan">🏛️ Pemerintahan & Fasilitas Desa</option>
                        <option value="perangkat">🏠 Rumah Perangkat Desa (RT/RW/Kadus)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* DUSUN & RT/RW */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Dusun *</label>
                  <select
                    value={formData.dusun}
                    onChange={(e) => setFormData({ ...formData, dusun: e.target.value as 'Dusun I' | 'Dusun II' })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Dusun I">Dusun I</option>
                    <option value="Dusun II">Dusun II</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">RT / RW</label>
                  <input
                    type="text"
                    placeholder="Contoh: RT 02 / RW 01"
                    value={formData.rt_rw}
                    onChange={(e) => setFormData({ ...formData, rt_rw: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* ALAMAT LENGKAP */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Alamat Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Raya Toapaya No. 12, Samping Pos Ronda"
                  value={formData.alamat_lengkap}
                  onChange={(e) => setFormData({ ...formData, alamat_lengkap: e.target.value })}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* DESKRIPSI & PRODUK */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Informasi singkat mengenai usaha atau fasilitas desa..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {formData.tipe_lokasi === 'umkm' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Daftar Produk / Hasil Tani (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    placeholder="Lele Segar, Gurame, Benih Ikan"
                    value={formData.produk}
                    onChange={(e) => setFormData({ ...formData, produk: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* STATUS PANEN, JAM BUKA & WHATSAPP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Jam Operasional / Buka</label>
                  <input
                    type="text"
                    placeholder="08:00 - 16:00 WIB"
                    value={formData.jam_buka}
                    onChange={(e) => setFormData({ ...formData, jam_buka: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="6281234567890"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {formData.tipe_lokasi === 'umkm' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Status Panen / Stok</label>
                    <input
                      type="text"
                      placeholder="Ready Panen Lele 100kg"
                      value={formData.status_panen}
                      onChange={(e) => setFormData({ ...formData, status_panen: e.target.value })}
                      className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Harga Mulai</label>
                    <input
                      type="text"
                      placeholder="Rp 25.000 / kg"
                      value={formData.harga_mulai}
                      onChange={(e) => setFormData({ ...formData, harga_mulai: e.target.value })}
                      className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* FOTO URL */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">URL Foto Utama</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.foto}
                  onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan Lokasi...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" /> Publikasikan Lokasi ke Peta
                  </>
                )}
              </button>
            </form>
          </div>

          {/* DAFTAR LOKASI TERDAFTAR & PERSETUJUAN (RIGHT COLUMN) */}
          <div className="lg:col-span-7 space-y-6">
            {/* FILTER & SEARCH TABS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari nama, dusun, produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* TABS */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      filterTab === 'all'
                        ? 'bg-slate-800 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua ({listLocations.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                      filterTab === 'pending'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <span>Perlu Persetujuan</span>
                    {pendingCount > 0 && (
                      <span className="bg-amber-950 text-amber-300 border border-amber-500/50 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setFilterTab('umkm')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      filterTab === 'umkm'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    UMKM
                  </button>
                  <button
                    onClick={() => setFilterTab('non_umkm')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      filterTab === 'non_umkm'
                        ? 'bg-sky-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pemdes
                  </button>
                </div>
              </div>
            </div>

            {/* LOCATION LIST ITEMS */}
            {isLoading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                Memuat data lokasi terdaftar...
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
                Tidak ada data lokasi yang sesuai filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLocations.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-slate-900 border rounded-3xl p-5 shadow-xl transition relative overflow-hidden ${
                      item.status_persetujuan === 'pending'
                        ? 'border-amber-500/50 bg-amber-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* THUMBNAIL */}
                      <div className="w-full sm:w-28 h-24 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800 relative">
                        {item.foto ? (
                          <img
                            src={item.foto}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <span
                          className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                            item.tipe_lokasi === 'umkm'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-sky-600 text-white'
                          }`}
                        >
                          {item.tipe_lokasi === 'umkm' ? 'UMKM' : 'Pemdes'}
                        </span>
                      </div>

                      {/* CONTENT INFO */}
                      <div className="flex-grow space-y-1.5 w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                              {item.nama}
                            </h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{item.dusun} ({item.rt_rw || 'RT/RW -'})</span>
                            </p>
                          </div>

                          {/* PERSETUJUAN BADGE */}
                          <div>
                            {item.status_persetujuan === 'pending' && (
                              <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold rounded-xl flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Perlu Persetujuan
                              </span>
                            )}
                            {item.status_persetujuan === 'approved' && (
                              <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold rounded-xl flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Disetujui
                              </span>
                            )}
                            {item.status_persetujuan === 'rejected' && (
                              <span className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-extrabold rounded-xl flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Ditolak
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2">
                          {item.deskripsi || 'Tidak ada deskripsi.'}
                        </p>

                        {/* DETAIL TAGS */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {item.status_panen && (
                            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-semibold">
                              🌾 {item.status_panen}
                            </span>
                          )}
                          {item.status_owner && (
                            <span className="text-[10px] bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg font-semibold">
                              📢 {item.status_owner}
                            </span>
                          )}
                          {item.harga_mulai && (
                            <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg font-semibold">
                              💰 {item.harga_mulai}
                            </span>
                          )}
                          {item.whatsapp && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400" /> {item.whatsapp}
                            </span>
                          )}
                        </div>

                        {/* ACTION BUTTONS BAR */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 mt-3">
                          {/* APPROVAL ACTION */}
                          {item.status_persetujuan === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateApproval(item.id, 'approved')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Setujui Pendaftaran
                              </button>
                              <button
                                onClick={() => handleUpdateApproval(item.id, 'rejected')}
                                className="px-3 py-1.5 bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900 text-xs font-bold rounded-xl transition flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Tolak
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditStatus(item)}
                                className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold px-2.5 py-1.5 rounded-xl border border-slate-800 transition flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3 text-emerald-400" /> Update Status Pengumuman
                              </button>
                            </div>
                          )}

                          {/* EDIT & DELETE ACTION */}
                          <div className="flex items-center gap-2 ml-auto">
                            <button
                              onClick={() => handleOpenFullEdit(item)}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                              title="Edit Data Lengkap"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.nama)}
                              className="p-2 bg-rose-950/50 hover:bg-rose-900 text-rose-400 rounded-xl border border-rose-500/30 transition"
                              title="Hapus Lokasi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL EDIT STATUS PENGUMUMAN */}
      {editingStatusItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Update Status / Pengumuman</h3>
              <button
                onClick={() => setEditingStatusItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Ubah status pengumuman langsung pemilik untuk lokasi:{' '}
              <span className="text-emerald-400 font-bold">{editingStatusItem.nama}</span>
            </p>
            <textarea
              rows={3}
              placeholder="Contoh: Stok cabai melimpah minggu ini, diskon 10%!"
              value={adminStatusInput}
              onChange={(e) => setAdminStatusInput(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingStatusItem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAdminStatus}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500"
              >
                Simpan Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FULL EDIT DATA */}
      {fullEditItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full my-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" /> Edit Data Lokasi
              </h3>
              <button
                onClick={() => setFullEditItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nama Lokasi</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nama || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Dusun</label>
                  <select
                    value={editFormData.dusun || 'Dusun I'}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, dusun: e.target.value as 'Dusun I' | 'Dusun II' })
                    }
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Dusun I">Dusun I</option>
                    <option value="Dusun II">Dusun II</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  value={editFormData.alamat_lengkap || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, alamat_lengkap: e.target.value })}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={editFormData.deskripsi || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, deskripsi: e.target.value })}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Jam Operasional</label>
                  <input
                    type="text"
                    value={editFormData.jam_buka || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, jam_buka: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={editFormData.whatsapp || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Status Panen</label>
                  <input
                    type="text"
                    value={editFormData.status_panen || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, status_panen: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Harga Mulai</label>
                  <input
                    type="text"
                    value={editFormData.harga_mulai || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, harga_mulai: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">URL Foto</label>
                <input
                  type="text"
                  value={editFormData.foto || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, foto: e.target.value })}
                  className="w-full bg-slate-950 text-white text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFullEditItem(null)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 shadow-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
