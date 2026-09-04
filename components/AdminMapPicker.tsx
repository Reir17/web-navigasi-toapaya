'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

const pickerIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 bg-rose-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white text-base animate-bounce">
        📍
      </div>
    </div>
  `,
  className: 'custom-picker-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Listener saat peta diklik oleh admin
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Controller untuk menggeser kamera peta jika titik lat/lng berubah via GPS
function MapFlyController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 16, { duration: 1 });
    }
  }, [lat, lng, map]);
  return null;
}

interface MapPickerProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function AdminMapPicker({ lat, lng, onLocationSelect }: MapPickerProps) {
  const position: [number, number] = [lat || 1.0285, lng || 104.5486];

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-700 relative z-0 shadow-inner">
      <MapContainer
        center={position}
        zoom={14}
        className="w-full h-full cursor-crosshair"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFlyController lat={lat} lng={lng} />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        
        {lat !== 0 && lng !== 0 && (
          <Marker position={[lat, lng]} icon={pickerIcon} />
        )}
      </MapContainer>
    </div>
  );
}