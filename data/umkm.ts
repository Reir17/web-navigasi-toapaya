export type TipeLokasi = 'umkm' | 'non_umkm';

export type KategoriLokasi = 
  | 'tani_ikan'   // Pertanian & Perikanan
  | 'kuliner'     // Makanan & Minuman
  | 'kerajinan'   // Olahan & Kerajinan
  | 'jasa'        // Jasa & Bengkel
  | 'pemerintahan'// Kantor & Fasilitas Desa
  | 'perangkat';  // Rumah Perangkat Desa

export interface UMKM {
  id: string;
  nama: string;
  tipe_lokasi: TipeLokasi; // 'umkm' atau 'non_umkm'
  kategori: KategoriLokasi;
  dusun: 'Dusun I' | 'Dusun II';
  rt_rw: string;
  lat: number;
  lng: number;
  deskripsi: string;
  produk?: string[]; // Opsional untuk Non-UMKM
  jam_buka: string;
  whatsapp: string;
  status_panen?: string;
  status_owner?: string | null;
  pin_owner: string;
  harga_mulai?: string; // Opsional untuk Non-UMKM
  foto: string;
  alamat_lengkap: string;
  created_at?: string;
}

// Data Dummy Cadangan (Fallback jika Supabase belum ada isinya)
export classNameUMKMList: UMKM[] = [
  {
    id: '1',
    nama: 'Kebun Nanas & Kolam Gurame Pak Ahmad',
    tipe_lokasi: 'umkm',
    kategori: 'tani_ikan',
    dusun: 'Dusun I',
    rt_rw: 'RT 02 / RW 01',
    lat: 1.0285,
    lng: 104.5486,
    deskripsi: 'Menyediakan nanas madu segar petik langsung dan ikan gurame hidup/siap olah.',
    produk: ['Nanas Madu', 'Bibit Nanas', 'Ikan Gurame Segar'],
    jam_buka: '07:00 - 17:00 WIB',
    whatsapp: '6281234567890',
    status_panen: 'Panen Nanas & Gurame Melimpah!',
    status_owner: 'Lagi di kolam ikan belakang, masuk aja!',
    pin_owner: '1234',
    harga_mulai: 'Rp 8.000 / kg',
    foto: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80',
    alamat_lengkap: 'Jl. Kebun Nanas No. 12, Dusun I, Desa Toapaya',
  },
  {
    id: '2',
    nama: 'Kantor Desa Toapaya',
    tipe_lokasi: 'non_umkm',
    kategori: 'pemerintahan',
    dusun: 'Dusun I',
    rt_rw: 'RT 01 / RW 01',
    lat: 1.0310,
    lng: 104.5500,
    deskripsi: 'Pusat pelayanan administrasi dan pemerintahan Desa Toapaya.',
    jam_buka: '08:00 - 15:30 WIB (Senin - Jumat)',
    whatsapp: '6281100001111',
    status_owner: 'Pelayanan administrasi buka seperti biasa',
    pin_owner: '9999',
    foto: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    alamat_lengkap: 'Jl. Utama Desa Toapaya No. 1',
  },
];