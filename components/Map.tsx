'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UMKM } from '@/data/umkm';

function MapViewController({ selectedUMKM }: { selectedUMKM: UMKM | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedUMKM) {
      map.flyTo([selectedUMKM.lat, selectedUMKM.lng], 16, {
        duration: 1.2,
      });
    }
  }, [selectedUMKM, map]);

  return null;
}

const createCustomPin = (item: UMKM, isSelected: boolean) => {
  let emoji = '🌱';
  let badgeColor = 'bg-emerald-600';

  if (item.kategori === 'tani_ikan') {
    emoji = '🍍';
    badgeColor = 'bg-emerald-600';
  } else if (item.kategori === 'kuliner') {
    emoji = '☕';
    badgeColor = 'bg-amber-500';
  } else if (item.kategori === 'kerajinan') {
    emoji = '🎨';
    badgeColor = 'bg-purple-600';
  } else if (item.kategori === 'jasa') {
    emoji = '🔧';
    badgeColor = 'bg-blue-600';
  }

  const selectedClass = isSelected
    ? 'ring-4 ring-emerald-400 scale-125 z-50'
    : 'hover:scale-110';

  const hasStatusOwner = item.status_owner && item.status_owner.trim() !== '';

  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center justify-center">
        <!-- 💬 BUBBLE CHAT STATUS PEMILIK (Melayang di Atas Pin) -->
        ${
          hasStatusOwner
            ? `
          <div class="absolute -top-12 z-50 bg-slate-900/95 text-emerald-400 text-[11px] font-bold px-3 py-1.5 rounded-2xl shadow-2xl border border-emerald-500/50 whitespace-nowrap animate-bounce flex items-center gap-1.5 backdrop-blur-md">
            <span>💬</span>
            <span class="text-white">"${item.status_owner}"</span>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-emerald-500/50"></div>
          </div>
        `
            : ''
        }

        <!-- PIN UTAMA LOKASI -->
        <div class="relative flex items-center justify-center">
          ${isSelected ? `<div class="absolute -inset-2 rounded-full bg-emerald-500/40 animate-ping"></div>` : ''}
          <div class="${badgeColor} text-white rounded-2xl p-2 shadow-xl border-2 border-white flex items-center justify-center w-10 h-10 transition-all duration-300 ${selectedClass}">
            <span class="text-base">${emoji}</span>
          </div>
        </div>
      </div>
    `,
    className: 'custom-pin-container',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

interface MapProps {
  data: UMKM[];
  selectedUMKM: UMKM | null;
  onSelectUMKM: (umkm: UMKM) => void;
}

export default function Map({ data, selectedUMKM, onSelectUMKM }: MapProps) {
  const centerPosition: [number, number] = [1.0285, 104.5486];

  return (
    <MapContainer
      center={centerPosition}
      zoom={14}
      zoomControl={false}
      className="w-full h-full z-0 font-sans"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapViewController selectedUMKM={selectedUMKM} />

      {data.map((item) => (
        <Marker
          key={item.id}
          position={[item.lat, item.lng]}
          icon={createCustomPin(item, selectedUMKM?.id === item.id)}
          eventHandlers={{
            click: () => onSelectUMKM(item),
          }}
        />
      ))}
    </MapContainer>
  );
}