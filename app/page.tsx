'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Globe3D from '@/components/Globe3D';
import {
  Globe as GlobeIcon,
  Menu,
  Shield,
  Sparkles,
  Store,
  Layers,
  Activity,
  Compass,
  X,
  MessageSquare,
  ArrowRight,
  MapPin,
  Search,
  Filter,
  User,
  LogOut,
  Edit3,
  CheckCircle2,
  Phone
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface UMKM {
  id: string;
  nama: string;
  kategori: 'Kuliner' | 'Pertanian' | 'Perikanan' | 'Perdagangan' | 'Jasa' | 'Fasilitas';
  dusun: 'Dusun I' | 'Dusun II';
  alamat_lengkap: string;
  deskripsi: string;
  produk: string[];
  kontak: string;
  lat: number;
  lng: number;
  foto?: string;
  status_owner?: string;
  owner_username?: string;
}

// ==========================================
// DUMMY DATA INITIALIZATIONS
// ==========================================
const INITIAL_UMKM_DATA: UMKM[] = [
  {
    id: '1',
    nama: 'Warung Makan Mak Ngah',
    kategori: 'Kuliner',
    dusun: 'Dusun I',
    alamat_lengkap: 'Jl. Lintas Barat KM 18, Desa Toapaya',
    deskripsi: 'Menyediakan masakan khas Melayu, Otak-otak Bintan, dan Asam Pedas Sembilang segar.',
    produk: ['Otak-otak', 'Asam Pedas', 'Nasi Dagang', 'Teh Tarik'],
    kontak: '6281234567890',
    lat: 0.9852,
    lng: 104.4721,
    foto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    status_owner: 'Hari ini ada Otak-Otak Ikan Parang Segar Baru Matang! Stok terbatas.',
    owner_username: 'makngah'
  },
  {
    id: '2',
    nama: 'Kebun Tani Makmur Toapaya',
    kategori: 'Pertanian',
    dusun: 'Dusun II',
    alamat_lengkap: 'Kawasan Agrowisata RT 03/RW 02, Desa Toapaya',
    deskripsi: 'Sentra budidaya buah naga, sayuran hidroponik, dan bibit tanaman unggulan lokal.',
    produk: ['Buah Naga Red', 'Sawi Hidroponik', 'Bibit Cabai', 'Pupuk Organik'],
    kontak: '6282288991122',
    lat: 0.9885,
    lng: 104.4785,
    foto: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    status_owner: 'Panen raya buah naga! Diskon khusus beli langsung di lokasi.',
    owner_username: 'tanimakmur'
  },
  {
    id: '3',
    nama: 'Kolam Budidaya Gurame & Lele',
    kategori: 'Perikanan',
    dusun: 'Dusun I',
    alamat_lengkap: 'Jl. Pemuda No. 12, Desa Toapaya',
    deskripsi: 'Pemasok ikan air tawar hidup untuk konsumsi restoran dan rumah tangga.',
    produk: ['Ikan Gurame Live', 'Lele Sangkuriang', 'Bibit Ikan'],
    kontak: '6285211223344',
    lat: 0.9821,
    lng: 104.4695,
    foto: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
    owner_username: 'budidayafish'
  },
  {
    id: '4',
    nama: 'Toko Kelontong Berkah Desa',
    kategori: 'Perdagangan',
    dusun: 'Dusun II',
    alamat_lengkap: 'Simpang Tiga Desa Toapaya',
    deskripsi: 'Menyediakan sembako lengkap, gas LPG, serta kebutuhan harian warga.',
    produk: ['Beras Premium', 'Minyak Goreng', 'Gas 3kg', 'Sembako'],
    kontak: '6281999887766',
    lat: 0.9868,
    lng: 104.4752,
    foto: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    nama: 'Kantor Desa Toapaya',
    kategori: 'Fasilitas',
    dusun: 'Dusun I',
    alamat_lengkap: 'Jl. Utama Desa Toapaya No. 1',
    deskripsi: 'Pusat pelayanan administrasi publik dan pemerintahan Desa Toapaya.',
    produk: ['Pelayanan Surat Keterangan', 'Administrasi Kependudukan'],
    kontak: '6287711223300',
    lat: 0.9841,
    lng: 104.4711,
    foto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  }
];

// ==========================================
// SUB-COMPONENTS
// ==========================================

// Leaflet Map Placeholder / Canvas Integrator
const MapLeaflet: React.FC<{
  data: UMKM[];
  selectedUMKM: UMKM | null;
  onSelectUMKM: (item: UMKM) => void;
  centerCoordinates: [number, number];
}> = ({ data, selectedUMKM, onSelectUMKM }) => {
  return (
    <div className="w-full h-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
      {/* Visual Canvas Grid Background (Simulation of Map Layers) */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#0ea5e9 1px, #0f172a 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      />
      
      {/* Map Control Info Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-950/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-slate-400 pointer-events-none">
        Map Leaflet Engine Active • Interactive Markers ({data.length})
      </div>
      {/* Simulated Interactive Markers */}
      <div className="relative w-full max-w-2xl h-full flex items-center justify-center">
        {data.map((item, idx) => {
          const isSelected = selectedUMKM?.id === item.id;
          // Offset calculation for demo visualization
          const topPos = 20 + ((idx * 17) % 60);
          const leftPos = 15 + ((idx * 23) % 70);
          return (
            <button
              key={item.id}
              onClick={() => onSelectUMKM(item)}
              style={{ top: `${topPos}%`, left: `${leftPos}%` }}
              className={`absolute group -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 hover:scale-125 focus:outline-none`}
            >
              <div className={`p-2 rounded-full border shadow-xl flex items-center justify-center backdrop-blur-md transition ${
                isSelected 
                  ? 'bg-emerald-500 border-white text-slate-950 scale-125 shadow-emerald-500/50 ring-4 ring-emerald-500/30' 
                  : 'bg-slate-900/90 border-emerald-500/60 text-emerald-400 hover:bg-emerald-600 hover:text-white'
              }`}>
                <MapPin className="w-5 h-5" />
              </div>
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-slate-950/90 border border-slate-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow-lg pointer-events-none">
                {item.nama}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Modal Login Pemilik Lapak
const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ownerData: UMKM) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    // Simple authentication demo logic
    const found = INITIAL_UMKM_DATA.find(
      (u) => u.owner_username?.toLowerCase() === username.trim().toLowerCase()
    );
    if (found) {
      onSuccess(found);
      onClose();
    } else {
      alert('Username tidak ditemukan. Gunakan demo username: "makngah" atau "tanimakmur"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-white">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition"
          aria-label="Tutup modal"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <Store className="w-5 h-5" />
          <h3 className="text-lg font-bold">Login Pemilik Lapak</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">Masukan username pemilik UMKM untuk memperbarui status dan info toko secara realtime.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username Lapak</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: makngah"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">Saran demo: ketik <code className="text-emerald-400">makngah</code> atau <code className="text-emerald-400">tanimakmur</code></p>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition active:scale-95"
          >
            Masuk ke Dasbor
          </button>
        </form>
      </div>
    </div>
  );
};

// Modal Edit Informasi Lapak
const EditLapakModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentData: UMKM;
  onUpdateSuccess: (updated: UMKM) => void;
}> = ({ isOpen, onClose, currentData, onUpdateSuccess }) => {
  const [statusText, setStatusText] = useState(currentData.status_owner || '');
  const [deskripsi, setDeskripsi] = useState(currentData.deskripsi || '');
  const [kontak, setKontak] = useState(currentData.kontak || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UMKM = {
      ...currentData,
      status_owner: statusText,
      deskripsi,
      kontak
    };
    onUpdateSuccess(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative text-white">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition"
          aria-label="Tutup modal"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <Edit3 className="w-5 h-5" />
          <h3 className="text-lg font-bold">Kelola Informasi Lapak</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">Perbarui status live, deskripsi, dan kontak untuk toko: <strong className="text-white">{currentData.nama}</strong></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pesan Live Pemilik (Realtime Update)</label>
            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="Contoh: Buka hari ini! Stok stok ikan baru tiba."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deskripsi Singkat Usaha</label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nomor WhatsApp / Kontak</label>
            <input
              type="text"
              value={kontak}
              onChange={(e) => setKontak(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function Page() {
  // State Utama
  const [umkmList, setUmkmList] = useState<UMKM[]>(INITIAL_UMKM_DATA);
  const [selectedUMKM, setSelectedUMKM] = useState<UMKM | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0.9850, 104.4750]);
  
  // State Tampilan & Overlay
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [showHeroGlobe, setShowHeroGlobe] = useState<boolean>(true);
  
  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [selectedDusun, setSelectedDusun] = useState<string>('Semua');

  // State Auth Pemilik
  const [currentOwner, setCurrentOwner] = useState<UMKM | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  // Helper Badge Kategori
  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case 'Kuliner': return '🍲 Kuliner';
      case 'Pertanian': return '🌱 Pertanian';
      case 'Perikanan': return '🐟 Perikanan';
      case 'Perdagangan': return '🏪 Perdagangan';
      case 'Jasa': return '🛠️ Jasa';
      case 'Fasilitas': return '🏛️ Fasilitas Publik';
      default: return kategori;
    }
  };

  // Filtered List Memoization
  const filteredList = useMemo(() => {
    return umkmList.filter((item) => {
      const matchQuery = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.produk.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchKategori = selectedKategori === 'Semua' || item.kategori === selectedKategori;
      const matchDusun = selectedDusun === 'Semua' || item.dusun === selectedDusun;

      return matchQuery && matchKategori && matchDusun;
    });
  }, [umkmList, searchQuery, selectedKategori, selectedDusun]);

  // Handle Login & Data Updates
  const handleLoginSuccess = (ownerData: UMKM) => {
    setCurrentOwner(ownerData);
    setIsEditOpen(true);
  };

  const handleUpdateData = (updatedData: UMKM) => {
    setUmkmList((prev) => prev.map((item) => item.id === updatedData.id ? updatedData : item));
    if (selectedUMKM?.id === updatedData.id) {
      setSelectedUMKM(updatedData);
    }
    setCurrentOwner(updatedData);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedUMKM(null);
        setIsAuthOpen(false);
        setIsEditOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* SIDEBAR DIRECTORY & FILTER (Hanya dirender jika tidak sedang menampilkan Hero/Beranda Globe 3D) */}
      {!showHeroGlobe && (
        <aside 
          className={`fixed lg:relative z-40 h-full w-80 sm:w-96 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-all duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Header Sidebar */}
          <div className="p-3.5 sm:p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center p-1">
                <img src="/logo-kkn.png" alt="Logo Desa" className="w-full h-full object-contain" onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }} />
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white leading-none">Desa Toapaya</h1>
                <span className="text-[10px] text-slate-400 font-medium">Sistem Pemetaan Geospasial</span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Tutup sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="p-3 sm:p-4 space-y-3 border-b border-slate-800/80 shrink-0">
            {/* Input Cari */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari UMKM, komoditas, atau layanan..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pill Filter Kategori */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {['Semua', 'Kuliner', 'Pertanian', 'Perikanan', 'Perdagangan', 'Jasa', 'Fasilitas'].map((kat) => (
                <button
                  key={kat}
                  onClick={() => setSelectedKategori(kat)}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all font-medium ${
                    selectedKategori === kat
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>

            {/* Filter Dusun */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3 text-emerald-400" />
                Wilayah:
              </span>
              <div className="flex gap-1">
                {['Semua', 'Dusun I', 'Dusun II'].map((dusun) => (
                  <button
                    key={dusun}
                    onClick={() => setSelectedDusun(dusun)}
                    className={`px-2 py-0.5 rounded-md border text-[10px] transition ${
                      selectedDusun === dusun
                        ? 'bg-emerald-600 border-emerald-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {dusun}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable List UMKM */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredList.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-bounce" />
                <p className="text-xs text-slate-400 font-medium">Tidak ada lokasi ditemukan</p>
                <p className="text-[10px] text-slate-600 mt-1">Coba sesuaikan kata kunci atau filter Anda</p>
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedUMKM(item);
                    setMapCenter([item.lat, item.lng]);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer group flex gap-3 items-start ${
                    selectedUMKM?.id === item.id
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700/60">
                    <img
                      src={item.foto || 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80'}
                      alt={item.nama}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                        {item.kategori}
                      </span>
                      <span className="text-[9px] text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                        {item.dusun}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-emerald-300 transition">
                      {item.nama}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.alamat_lengkap}
                    </p>
                    {item.status_owner && (
                      <div className="mt-1.5 text-[9px] text-amber-300 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded truncate">
                        💬 {item.status_owner}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* User Profile / Footer Sidebar */}
          {currentOwner && (
            <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  {currentOwner.nama.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentOwner.nama}</p>
                  <p className="text-[9px] text-emerald-400 font-semibold">Mode Pemilik Aktif</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
                  title="Edit Lapak"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentOwner(null)}
                  className="p-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 rounded-lg text-xs transition border border-red-800/40"
                  title="Keluar Log"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Footer Sidebar Button */}
          <div className="p-2.5 sm:p-3 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur shrink-0">
            <button
              onClick={() => setShowHeroGlobe(true)}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-lg"
            >
              <GlobeIcon className="w-4 h-4 text-emerald-400" />
              <span>Tampilkan Beranda Globe 3D</span>
            </button>
          </div>
        </aside>
      )}

      {/* CONTAINER PETA & OVERLAY CONTROLS */}
      <main className="flex-1 h-full relative z-10 overflow-hidden bg-slate-950">
        
        {/* FLOATING CONTROL BAR */}
        {!showHeroGlobe && (
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 pointer-events-none flex items-center justify-between gap-2">
            
            <div className="pointer-events-auto flex items-center gap-2">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-slate-900/90 text-white px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl hover:bg-slate-800 transition flex items-center gap-2 text-xs font-bold backdrop-blur-md active:scale-95"
                >
                  <Menu className="w-4 h-4 text-emerald-400" />
                  <span>Daftar Lokasi</span>
                </button>
              )}
              <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs text-white">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-[10px] sm:text-[11px] hidden xs:inline sm:inline">Peta Toapaya</span>
                <span className="text-[10px] text-slate-400">({filteredList.length} titik)</span>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setShowHeroGlobe(true)}
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl transition flex items-center gap-2 text-xs font-semibold backdrop-blur-md active:scale-95"
              >
                <GlobeIcon className="w-4 h-4 text-emerald-400" />
                <span className="hidden xs:inline sm:inline">Globe 3D</span>
              </button>
            </div>
          </div>
        )}

        {/* Leaflet Map Canvas */}
        <MapLeaflet
          data={filteredList}
          selectedUMKM={selectedUMKM}
          onSelectUMKM={(item) => setSelectedUMKM(item)}
          centerCoordinates={mapCenter}
        />

        {/* HERO OVERLAY MODERN DENGAN GLOBE 3D */}
        {showHeroGlobe && (
          <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 transition-all duration-500 overflow-y-auto">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] xs:w-[450px] sm:w-[700px] h-[320px] xs:h-[450px] sm:h-[700px] bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[300px] h-[220px] sm:h-[300px] bg-teal-500/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

            {/* HEADER HERO */}
            <div className="relative z-10 flex items-center justify-between w-full max-w-6xl mx-auto gap-2">
              <div
                onClick={() => setShowHeroGlobe(true)}
                className="flex items-center gap-2.5 sm:gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/50 p-1.5 sm:p-2 shrink-0">
                  <img src="/logo-kkn.png" alt="Logo Desa" className="w-full h-full object-contain" onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }} />
                  <Compass className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-emerald-400 uppercase block">Peta Geospasial Digital</span>
                  <h1 className="text-xs sm:text-base font-extrabold text-white">Desa Toapaya</h1>
                </div>
              </div>

              <button
                onClick={() => setShowHeroGlobe(false)}
                className="group bg-slate-900/80 hover:bg-emerald-600 text-slate-300 hover:text-white px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-800 hover:border-emerald-500 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold shadow-xl backdrop-blur active:scale-95 shrink-0"
              >
                <span>Buka Peta</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* CONTENT UTAMA HERO */}
            <div className="relative z-10 my-auto py-4 sm:py-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              
              {/* GLOBE SECTION */}
              <div className="lg:col-span-6 relative flex items-center justify-center order-1 lg:order-2">
                <div className="hidden sm:flex absolute -top-2 left-4 z-20 bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-2xl items-center gap-2.5 text-xs text-white animate-bounce" style={{ animationDuration: '5s' }}>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold text-[11px]">Fitur Bubble Chat Realtime</span>
                </div>

                <div className="hidden sm:flex absolute bottom-2 right-2 z-20 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-2xl items-center gap-2.5 text-xs text-white">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Cakupan Wilayah</p>
                    <p className="text-[11px] font-bold text-white">Dusun I & Dusun II</p>
                  </div>
                </div>

                <div className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[480px] h-[220px] xs:h-[260px] sm:h-[440px] flex items-center justify-center">
                  <div className="absolute inset-2 sm:inset-4 rounded-full border border-dashed border-emerald-500/20 animate-spin" style={{ animationDuration: '45s' }} />
                  <div className="absolute inset-8 sm:inset-12 rounded-full border border-emerald-500/10" />
                  <Globe3D />
                </div>
              </div>

              {/* TEXT HERO SECTION */}
              <div className="lg:col-span-6 space-y-3.5 sm:space-y-5 text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur shadow-inner">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-300 tracking-wide">Direktori Terintegrasi Wilayah</span>
                </div>

                <h2 className="text-2xl xs:text-3xl sm:text-5xl font-black text-white leading-[1.15] tracking-tight">
                  Jelajahi Potensi <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                    UMKM & Desa Toapaya
                  </span>
                </h2>

                <p className="text-[11px] sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Sistem informasi geografis interaktif berbasis visual 3D. Temukan komoditas unggulan lokal, fasilitas umum, sentra perikanan & pertanian, serta status live dari para pemilik lapak.
                </p>

                {/* Stat Grid */}
                <div className="pt-1 sm:pt-2 grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto lg:mx-0 text-left">
                  <div className="bg-slate-900/60 border border-slate-800 p-2.5 sm:p-3.5 rounded-2xl backdrop-blur shadow-lg">
                    <div className="flex items-center gap-1 text-emerald-400 text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1">
                      <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Lapak</span>
                    </div>
                    <p className="text-base sm:text-xl font-black text-white">{umkmList.length}+ <span className="text-[9px] sm:text-[10px] font-normal text-slate-400">Titik</span></p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 p-2.5 sm:p-3.5 rounded-2xl backdrop-blur shadow-lg">
                    <div className="flex items-center gap-1 text-teal-400 text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1">
                      <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Sektor</span>
                    </div>
                    <p className="text-base sm:text-xl font-black text-white">6 <span className="text-[9px] sm:text-[10px] font-normal text-slate-400">Kategori</span></p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 p-2.5 sm:p-3.5 rounded-2xl backdrop-blur shadow-lg">
                    <div className="flex items-center gap-1 text-cyan-400 text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1">
                      <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Sistem</span>
                    </div>
                    <p className="text-base sm:text-xl font-black text-emerald-400">Live <span className="text-[9px] sm:text-[10px] font-normal text-slate-400">GIS</span></p>
                  </div>
                </div>

                {/* Hero Action Buttons */}
                <div className="pt-2 sm:pt-3 flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
                  <button
                    onClick={() => setShowHeroGlobe(false)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm py-3 sm:py-3.5 px-6 sm:px-7 rounded-2xl shadow-xl shadow-emerald-950/60 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Mulai Eksplorasi Peta</span>
                  </button>

                  {!currentOwner && (
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm py-3 sm:py-3.5 px-5 sm:px-6 rounded-2xl border border-slate-700/80 transition flex items-center justify-center gap-2 backdrop-blur active:scale-95"
                    >
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>Login Pemilik Lapak</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER HERO */}
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 gap-1.5 text-center sm:text-left">
              <p>© 2026 KKN Desa Toapaya — Sistem Pemetaan Geospasial UMKM</p>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Presisi Koordinat & Data Terverifikasi</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DETAIL LOKASI */}
      {selectedUMKM && (
        <div 
          onClick={() => setSelectedUMKM(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[85vh] sm:max-h-[90vh] overflow-y-auto flex flex-col gap-4 text-white"
          >
            {/* Gambar Header & Tombol Tutup */}
            <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden shrink-0 bg-slate-800">
              <img 
                src={selectedUMKM.foto || 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80'} 
                alt={selectedUMKM.nama} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button 
                onClick={() => setSelectedUMKM(null)}
                className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-full border border-slate-700/80 transition active:scale-95"
                aria-label="Tutup detail"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-emerald-300 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                  {getKategoriBadge(selectedUMKM.kategori)}
                </span>
                <span className="text-[10px] text-slate-300 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-700">
                  {selectedUMKM.dusun}
                </span>
              </div>
            </div>

            {/* Konten Detail */}
            <div className="space-y-3">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">{selectedUMKM.nama}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{selectedUMKM.alamat_lengkap || 'Desa Toapaya'}</span>
                </p>
              </div>

              {selectedUMKM.status_owner && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
                  <span className="font-bold block mb-0.5">💬 Pesan Live Pemilik:</span>
                  "{selectedUMKM.status_owner}"
                </div>
              )}

              {selectedUMKM.deskripsi && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  {selectedUMKM.deskripsi}
                </p>
              )}

              {Array.isArray(selectedUMKM.produk) && selectedUMKM.produk.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1.5">Produk & Layanan Utama:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUMKM.produk.map((prod, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800/90 text-emerald-300 border border-slate-700 px-2.5 py-1 rounded-md">
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Aksi & Kontak */}
            <div className="pt-2 flex flex-col xs:flex-row gap-2 border-t border-slate-800/80">
              {selectedUMKM.kontak && (
                <a
                  href={`https://wa.me/${selectedUMKM.kontak.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Hubungi WhatsApp</span>
                </a>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedUMKM.lat},${selectedUMKM.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Buka Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AUTH & EDIT LAPAK */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {currentOwner && (
        <EditLapakModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          currentData={currentOwner}
          onUpdateSuccess={handleUpdateData}
        />
      )}
    </div>
  );
}