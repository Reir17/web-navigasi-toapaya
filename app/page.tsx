'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { UMKM, KategoriLokasi, TipeLokasi } from '@/data/umkm';
import AuthModal from '@/components/AuthModal';
import EditLapakModal from '@/components/EditLapakModal';
import {
  Search,
  MapPin,
  MessageSquare,
  Phone,
  Store,
  X,
  UserCheck,
  LogOut,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Menu,
  Globe as GlobeIcon,
  Sparkles,
  Compass,
  ArrowRight,
  Layers,
  Activity,
  Shield,
} from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

// Dynamic import untuk Leaflet Map
const MapLeaflet = dynamic(() => import('@/components/MapLeaflet'), {
  ssr: false,
  loading: () => <LoadingScreen message="Menyiapkan Peta Interaktif..." />,
});

// Dynamic import untuk 3D Globe Canvas
const Globe3D = dynamic(() => import('@/components/Globe3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-emerald-400/60 text-xs font-mono animate-pulse">
      Memuat Aliran Globe 3D...
    </div>
  ),
});

export default function HomePage() {
  const [umkmList, setUmkmList] = useState<UMKM[]>([]);
  const [filteredList, setFilteredList] = useState<UMKM[]>([]);
  const [selectedUMKM, setSelectedUMKM] = useState<UMKM | null>(null);

  // Toggle Sidebar & Hero View
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showHeroGlobe, setShowHeroGlobe] = useState(true);

  // Auth & Owner Session
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentOwner, setCurrentOwner] = useState<UMKM | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipe, setSelectedTipe] = useState<'semua' | TipeLokasi>('semua');
  const [selectedKategori, setSelectedKategori] = useState<'semua' | KategoriLokasi>('semua');
  const [selectedDusun, setSelectedDusun] = useState<'semua' | 'Dusun I' | 'Dusun II'>('semua');

  const [mapCenter, setMapCenter] = useState<[number, number]>([1.0285, 104.5486]);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('umkm')
        .select('*')
        .eq('status_persetujuan', 'approved')
        .order('nama', { ascending: true });

      if (!error && data) {
        setUmkmList(data);
        if (currentOwner) {
          const updatedOwner = data.find((item) => item.id === currentOwner.id);
          if (updatedOwner) setCurrentOwner(updatedOwner);
        }
      }
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('realtime_umkm')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'umkm' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let result = umkmList || [];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          (item.nama && item.nama.toLowerCase().includes(q)) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(q)) ||
          (Array.isArray(item.produk) && item.produk.some((p) => p.toLowerCase().includes(q)))
      );
    }

    if (selectedTipe !== 'semua') {
      result = result.filter((item) => item.tipe_lokasi === selectedTipe);
    }

    if (selectedKategori !== 'semua') {
      result = result.filter((item) => item.kategori === selectedKategori);
    }

    if (selectedDusun !== 'semua') {
      result = result.filter((item) => item.dusun === selectedDusun);
    }

    setFilteredList(result);
  }, [searchQuery, selectedTipe, selectedKategori, selectedDusun, umkmList]);

  const handleSelectLocation = (item: UMKM) => {
    if (!item) return;
    setSelectedUMKM(item);
    setShowHeroGlobe(false);
    if (item.lat && item.lng) {
      setMapCenter([item.lat, item.lng]);
    }
  };

  const handleLoginSuccess = (ownerData: UMKM) => {
    setCurrentOwner(ownerData);
    if (ownerData.lat && ownerData.lng) {
      setMapCenter([ownerData.lat, ownerData.lng]);
    }
  };

  const getKategoriBadge = (kategori: KategoriLokasi) => {
    switch (kategori) {
      case 'tani_ikan':
        return '🌾 Tani & Ikan';
      case 'kuliner':
        return '☕ Kuliner';
      case 'kerajinan':
        return '🎨 Kerajinan';
      case 'jasa':
        return '🔧 Jasa';
      case 'pemerintahan':
        return '🏛️ Pemdes';
      case 'perangkat':
        return '🏠 Perangkat Desa';
      default:
        return '📍 Lokasi';
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTipe('semua');
    setSelectedKategori('semua');
    setSelectedDusun('semua');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HEADER / NAVBAR PEMILIK LAPAK */}
      {currentOwner && (
        <header className="bg-slate-900/90 border-b border-emerald-500/30 backdrop-blur-xl z-40 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-2xl shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center shadow-inner">
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-[8px] sm:text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 sm:px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0">
                  Pemilik Mode
                </span>
                <p className="text-xs font-bold text-white truncate">{currentOwner.nama}</p>
              </div>
              {currentOwner.status_owner ? (
                <p className="text-[9px] sm:text-[10px] text-amber-300 font-medium truncate">
                  💬 "{currentOwner.status_owner}"
                </p>
              ) : (
                <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Sapa pengunjung dengan status live...</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-3 rounded-xl transition shadow-lg active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kelola Lapak</span>
            </button>

            <button
              onClick={() => setCurrentOwner(null)}
              title="Keluar Akun"
              className="p-1.5 bg-slate-800/80 hover:bg-rose-950/80 hover:text-rose-300 text-slate-400 rounded-xl border border-slate-700/80 transition active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* SIDEBAR PANEL KIRI */}
        <aside
          className={`bg-slate-900/95 backdrop-blur-2xl flex flex-col z-30 shadow-2xl transition-all duration-300 ease-in-out shrink-0 ${
            isSidebarOpen && !showHeroGlobe
              ? 'fixed md:relative inset-x-0 bottom-0 md:inset-auto h-[60vh] md:h-full max-h-[60vh] md:max-h-none w-full md:w-[380px] opacity-100 translate-y-0 md:translate-x-0 rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-r border-slate-800/80 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] md:shadow-2xl'
              : 'fixed md:relative inset-x-0 bottom-0 md:inset-auto w-full md:w-0 h-0 md:h-full opacity-0 translate-y-full md:-translate-x-full pointer-events-none border-none'
          }`}
        >
          <div className="w-12 h-1 bg-slate-700/60 rounded-full mx-auto my-2 md:hidden shrink-0" />

          <div className="w-full md:w-[380px] flex flex-col h-full max-h-full min-h-0 shrink-0">
            
            {/* Header Sidebar */}
            <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur shrink-0">
              <div className="flex items-center justify-between mb-2.5">
                <button
                  onClick={() => setShowHeroGlobe(true)}
                  className="flex items-center gap-2.5 text-left group transition hover:opacity-90 active:scale-95"
                  title="Kembali ke Beranda Globe 3D"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-slate-800/80 border border-slate-700/60 p-1.5 flex items-center justify-center shadow-inner group-hover:border-emerald-500/50 transition-colors">
                    <img src="/logo-kkn.png" alt="Logo KKN" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                      Peta Desa Toapaya
                    </h1>
                    <p className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1">
                      <span>GIS & Direktori UMKM</span>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1 rounded border border-emerald-500/30">Globe 3D</span>
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-1.5">
                  {!currentOwner && (
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 px-2.5 sm:px-3 rounded-xl border border-emerald-400/30 shadow-lg transition flex items-center gap-1 active:scale-95"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Login</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    title="Sembunyikan Sidebar"
                    className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition border border-slate-700/80 active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 hidden md:block" />
                    <X className="w-4 h-4 md:hidden" />
                  </button>
                </div>
              </div>

              {/* Input Pencarian */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
                <input
                  type="text"
                  placeholder="Cari UMKM, komoditas, layanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/80 text-white text-xs rounded-xl pl-8 sm:pl-9 pr-7 py-2 sm:py-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500/80 transition placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Switch Filter Tipe */}
              <div className="grid grid-cols-3 gap-1 mt-2 sm:mt-2.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-[10px] sm:text-[11px] font-semibold">
                <button
                  onClick={() => setSelectedTipe('semua')}
                  className={`py-1 rounded-lg transition ${
                    selectedTipe === 'semua'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSelectedTipe('umkm')}
                  className={`py-1 rounded-lg transition ${
                    selectedTipe === 'umkm'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  UMKM
                </button>
                <button
                  onClick={() => setSelectedTipe('non_umkm')}
                  className={`py-1 rounded-lg transition ${
                    selectedTipe === 'non_umkm'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fasilitas
                </button>
              </div>

              {/* Dropdown Filters */}
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <select
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value as any)}
                  className="bg-slate-950/80 text-slate-300 text-[10px] sm:text-[11px] rounded-xl p-1.5 sm:p-2 border border-slate-800 focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                >
                  <option value="semua">Semua Kategori</option>
                  <option value="tani_ikan">🌾 Tani & Ikan</option>
                  <option value="kuliner">☕ Kuliner</option>
                  <option value="kerajinan">🎨 Kerajinan</option>
                  <option value="jasa">🔧 Jasa</option>
                  <option value="pemerintahan">🏛️ Pemdes</option>
                  <option value="perangkat">🏠 Perangkat Desa</option>
                </select>

                <select
                  value={selectedDusun}
                  onChange={(e) => setSelectedDusun(e.target.value as any)}
                  className="bg-slate-950/80 text-slate-300 text-[10px] sm:text-[11px] rounded-xl p-1.5 sm:p-2 border border-slate-800 focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                >
                  <option value="semua">Semua Dusun</option>
                  <option value="Dusun I">Dusun I</option>
                  <option value="Dusun II">Dusun II</option>
                </select>
              </div>

              {/* Status Hasil Filter */}
              <div className="flex items-center justify-between mt-2 px-1 text-[10px] sm:text-[11px] text-slate-400">
                <span>
                  Menampilkan <strong className="text-white">{filteredList.length}</strong> lokasi
                </span>
                {(searchQuery || selectedTipe !== 'semua' || selectedKategori !== 'semua' || selectedDusun !== 'semua') && (
                  <button
                    onClick={resetFilters}
                    className="text-emerald-400 hover:underline font-medium text-[10px]"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* List Lokasi */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-3 space-y-2 overscroll-contain">
              {filteredList.length === 0 ? (
                <div className="text-center py-8 px-4 space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Lokasi tidak ditemukan.</p>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold"
                  >
                    Bersihkan kata kunci filter
                  </button>
                </div>
              ) : (
                filteredList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectLocation(item)}
                    className={`group p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-2.5 sm:gap-3 items-center relative overflow-hidden active:scale-[0.98] ${
                      selectedUMKM?.id === item.id
                        ? 'bg-slate-800/90 border-emerald-500/80 shadow-lg'
                        : 'bg-slate-950/40 hover:bg-slate-800/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {selectedUMKM?.id === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />
                    )}

                    <img
                      src={item.foto || 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80'}
                      alt={item.nama}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 bg-slate-800 border border-slate-700/50"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/50 truncate">
                          {getKategoriBadge(item.kategori)}
                        </span>
                        <span className="text-[9px] text-slate-400 bg-slate-800/60 px-1 py-0.2 rounded shrink-0">
                          {item.dusun}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-xs truncate group-hover:text-emerald-400 transition-colors">
                        {item.nama}
                      </h3>

                      {item.status_owner ? (
                        <p className="text-[10px] text-amber-300 font-medium truncate mt-0.5">
                          💬 {item.status_owner}
                        </p>
                      ) : (
                        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">{item.alamat_lengkap}</p>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 shrink-0" />
                  </div>
                ))
              )}
            </div>

            {/* Footer Sidebar */}
            <div className="p-2.5 sm:p-3 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur shrink-0">
              <button
                onClick={() => setShowHeroGlobe(true)}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-lg"
              >
                <GlobeIcon className="w-4 h-4 text-emerald-400" />
                <span>Tampilkan Beranda Globe 3D</span>
              </button>
            </div>
          </div>
        </aside>

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
                    <img src="/logo-kkn.png" alt="Logo Desa" className="w-full h-full object-contain" />
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
      </div>

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
              />
              <button 
                onClick={() => setSelectedUMKM(null)}
                className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-full border border-slate-700/80 transition active:scale-95"
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
          onUpdateSuccess={fetchData}
        />
      )}

    </div>
  );
}