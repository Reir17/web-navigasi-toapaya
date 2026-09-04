'use client';

import Image from 'next/image';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Memuat Peta Navigasi Desa Toapaya...' }: LoadingScreenProps) {
  return (
    <div className="w-full h-full min-h-[300px] bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div className="absolute w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute w-48 h-48 bg-amber-500/10 rounded-full blur-2xl animate-pulse delay-500 pointer-events-none" />

      {/* Container Logo & Animasi Cincin */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer Glowing Spinning Ring */}
        <div className="absolute -inset-3 rounded-full border-2 border-transparent border-t-emerald-500 border-r-amber-400 border-b-emerald-600 animate-spin" />
        
        {/* Secondary Pulsing Outer Ring */}
        <div className="absolute -inset-1 rounded-full border border-emerald-500/30 animate-ping opacity-25" />

        {/* Logo Image Wrapper */}
        <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.25)] bg-slate-900 flex items-center justify-center animate-pulse">
          <Image
            src="/logo-kkn.png" // Pastikan gambar berada di folder /public/logo-kkn27.png
            alt="Logo KKN Desa Toapaya 27"
            width={144}
            height={144}
            priority
            className="object-cover w-full h-full p-1 rounded-full"
          />
        </div>
      </div>

      {/* Label KKN & Universitas */}
      <div className="text-center z-10 max-w-xs">
        <h3 className="text-xs font-extrabold text-emerald-400 tracking-wider uppercase mb-1">
          KKN DESA TOAPAYA 2026
        </h3>
        <p className="text-[11px] font-medium text-slate-300 animate-pulse mb-3">
          {message}
        </p>

        {/* Custom Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto border border-slate-700/50">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 rounded-full animate-[shimmer_1.5s_infinite] w-full origin-left-right" />
        </div>
      </div>
    </div>
  );
}