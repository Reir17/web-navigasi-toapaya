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

