'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UMKM, KategoriLokasi } from '@/data/umkm';
import { useEffect } from 'react';
import { Store, Building2, Home, MapPin, Phone, Clock, ArrowRight } from 'lucide-react';

// Fungsi penentu ikon emoji berdasarkan kategori
const getCategoryEmoji = (kategori: KategoriLokasi) => {
  switch (kategori) {
    case 'tani_ikan':
      return '🌾🐟';
    case 'kuliner':
      return '☕';
    case 'kerajinan':
      return '🎨';
    case 'jasa':
      return '🔧';
    case 'pemerintahan':
      return '🏛️';
    case 'perangkat':
      return '🏠';
    default:
      return '📍';
  }
};

// Fungsi warna badge berdasarkan Tipe Lokasi
const getMarkerBgColor = (item: UMKM) => {
  if (item.tipe_lokasi === 'non_umkm') {
    return item.kategori === 'pemerintahan'
      ? 'bg-sky-600 border-sky-300 shadow-sky-500/50'
      : 'bg-indigo-600 border-indigo-300 shadow-indigo-500/50';
  }
  return 'bg-emerald-600 border-emerald-300 shadow-emerald-500/50';
};

// Custom Marker Generator
const createCustomIcon = (item: UMKM) => {
  const emoji = getCategoryEmoji(item.kategori);
  const bgColor = getMarkerBgColor(item);
  const hasBubble = item.status_owner && item.status_owner.trim() !== '';

  const html = `
    <div class="relative flex flex-col items-center group cursor-pointer">
      <!-- BUBBLE CHAT LIVE OWNER -->
      ${
        hasBubble
          ? `
        <div class="absolute -top-12 z-20 whitespace-nowrap bg-slate-900/95 text-amber-300 border border-amber-500/50 text-[11px] font-medium px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-1.5 max-w-[200px] truncate">
          <span class="text-xs">💬</span>
          <span class="truncate">${item.status_owner}</span>
        </div>
      `
          : ''
      }

      <!-- PIN MARKER UTAMA -->
      <div class="w-10 h-10 ${bgColor} rounded-2xl border-2 shadow-lg flex items-center justify-center text-white text-lg transition-transform duration-300 hover:scale-125 z-10">
        ${emoji}
      </div>

      <!-- BADGE LABEL NAMA LOKASI -->
      <div class="mt-1 bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded-lg shadow-md z-0 text-center max-w-[120px]">
        <p class="text-[10px] font-bold text-white truncate">${item.nama}</p>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 25],
  });
};

// Dynamic Center Controller
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.2 });
  }, [center, map]);
  return null;
}

interface MapLeafletProps {
  data: UMKM[];
  selectedUMKM: UMKM | null;
  onSelectUMKM: (item: UMKM) => void;
  centerCoordinates: [number, number];
}

export default function MapLeaflet({
  data,
  selectedUMKM,
  onSelectUMKM,
  centerCoordinates,
}: MapLeafletProps) {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={centerCoordinates}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterController center={centerCoordinates} />

        {data.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={createCustomIcon(item)}
            eventHandlers={{
              click: () => onSelectUMKM(item),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 max-w-[220px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded font-bold text-emerald-400 uppercase">
                    {item.tipe_lokasi === 'non_umkm' ? 'Fasilitas / Perangkat' : 'UMKM'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">{item.nama}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.deskripsi}</p>
                <button
                  onClick={() => onSelectUMKM(item)}
                  className="mt-2.5 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1"
                >
                  Lihat Detail <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}