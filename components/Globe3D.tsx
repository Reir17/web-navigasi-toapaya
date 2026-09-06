'use client';

import { useEffect, useRef, useState } from 'react';

const TEXT_SEQUENCE = ['T', 'O', 'A', 'P', 'A', 'Y', 'A', '✦', '•', '+', '°', '✧', '•', '◇'];

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; isHovered: boolean }>({
    x: -9999,
    y: -9999,
    isHovered: false,
  });

  const burstParticlesRef = useRef<BurstParticle[]>([]);
  
  // State & Ref untuk Easter Egg 10 Klik
  const [showThankYou, setShowThankYou] = useState(false);
  const clickCountRef = useRef(0);
  const clickResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const thankYouTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let parentWidth = canvas.parentElement?.clientWidth || 600;
    let parentHeight = canvas.parentElement?.clientHeight || 600;
    
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const isMobile = parentWidth < 768;

    const setupCanvasSize = () => {
      parentWidth = canvas.parentElement?.clientWidth || 600;
      parentHeight = canvas.parentElement?.clientHeight || 600;
      
      canvas.width = parentWidth * dpr;
      canvas.height = parentHeight * dpr;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${parentHeight}px`;

      ctx.scale(dpr, dpr);
    };

    setupCanvasSize();

    let width = parentWidth;
    let height = parentHeight;
    const radius = Math.min(width, height) * 0.38;

    const loopCount = isMobile ? 8 : 14;
    const itemsPerLoop = isMobile ? 22 : 35;
    const paths: {
      char: string;
      theta: number;
      loopIndex: number;
      inclination: number;
      azimuth: number;
      speedOffset: number;
      baseSize: number;
      isLetter: boolean;
    }[] = [];

    let seqIdx = 0;
    for (let l = 0; l < loopCount; l++) {
      const inclination = (Math.PI / loopCount) * l - Math.PI / 2;
      const azimuth = (Math.PI / 4) * (l % 3);

      for (let i = 0; i < itemsPerLoop; i++) {
        const char = TEXT_SEQUENCE[seqIdx % TEXT_SEQUENCE.length];
        const isLetter = 'TOAPAYA'.includes(char);
        paths.push({
          char,
          theta: (Math.PI * 2 * i) / itemsPerLoop,
          loopIndex: l,
          inclination,
          azimuth,
          speedOffset: 0.7 + (l % 3) * 0.25,
          baseSize: isLetter ? (isMobile ? 11 : 14) : (isMobile ? 8 : 10),
          isLetter,
        });
        seqIdx++;
      }
    }

    let rotY = 0;
    let currentSpeed = 0.0035;
    const targetSpeedBase = 0.0035;
    const tiltX = 0.25;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isHovered = mousePosRef.current.isHovered;
      const targetSpeed = isHovered ? targetSpeedBase * 2.5 : targetSpeedBase;
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;
      rotY += currentSpeed;

      const centerX = width / 2;
      const centerY = height / 2;

      // Glow Latar Belakang
      const glowGrad = ctx.createRadialGradient(
        centerX, centerY, radius * 0.3,
        centerX, centerY, radius * 1.4
      );
      glowGrad.addColorStop(0, isHovered ? 'rgba(52, 211, 153, 0.22)' : 'rgba(16, 185, 129, 0.12)');
      glowGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.03)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Render Globe
      paths.forEach((item) => {
        item.theta += 0.006 * item.speedOffset;

        const lx = Math.cos(item.theta) * radius;
        const ly = Math.sin(item.theta) * radius;
        const lz = 0;

        const x1 = lx;
        const y1 = ly * Math.cos(item.inclination) - lz * Math.sin(item.inclination);
        const z1 = ly * Math.sin(item.inclination) + lz * Math.cos(item.inclination);

        const x2 = x1 * Math.cos(item.azimuth) + z1 * Math.sin(item.azimuth);
        const y2 = y1;
        const z2 = -x1 * Math.sin(item.azimuth) + z1 * Math.cos(item.azimuth);

        const rx = x2 * Math.cos(rotY) + z2 * Math.sin(rotY);
        const rz = -x2 * Math.sin(rotY) + z2 * Math.cos(rotY);

        const finalX = rx;
        const finalY = y2 * Math.cos(tiltX) - rz * Math.sin(tiltX);
        const finalZ = y2 * Math.sin(tiltX) + rz * Math.cos(tiltX);

        if (finalZ > -radius * 0.65) {
          const screenX = centerX + finalX;
          const screenY = centerY + finalY;

          const zNorm = (finalZ + radius) / (2 * radius);
          const dx = screenX - mousePosRef.current.x;
          const dy = screenY - mousePosRef.current.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);

          const isNearMouse = distToMouse < 85;
          const mouseGlow = isNearMouse ? Math.max(0, 1 - distToMouse / 85) : 0;

          const size = item.baseSize * (0.75 + zNorm * 0.55) + mouseGlow * 6;
          const alpha = Math.min(1, Math.max(0.15, zNorm * 0.85 + mouseGlow * 0.4));

          ctx.save();
          ctx.font = item.isLetter
            ? `900 ${Math.round(size)}px sans-serif`
            : `bold ${Math.round(size)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (mouseGlow > 0.2) {
            ctx.fillStyle = `rgba(167, 243, 208, ${alpha})`;
            if (!isMobile) {
              ctx.shadowColor = '#34d399';
              ctx.shadowBlur = 12;
            }
          } else if (item.isLetter) {
            ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
            if (!isMobile) {
              ctx.shadowColor = '#10b981';
              ctx.shadowBlur = 6;
            }
          } else {
            ctx.fillStyle = `rgba(110, 231, 183, ${alpha * 0.7})`;
            if (!isMobile) {
              ctx.shadowColor = '#059669';
              ctx.shadowBlur = 2;
            }
          }

          ctx.fillText(item.char, screenX, screenY);
          ctx.restore();
        }
      });

      // Render Burst Particles
      const bursts = burstParticlesRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        ctx.save();
        ctx.font = `bold ${Math.round(p.size)}px sans-serif`;
        ctx.fillStyle = p.color.replace('ALPHA', p.alpha.toFixed(2));
        if (!isMobile) {
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 8;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();

        if (p.life >= p.maxLife) {
          bursts.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const updatePointerPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        isHovered: true,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePointerPos(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseLeave = () => {
      mousePosRef.current.isHovered = false;
      mousePosRef.current.x = -9999;
      mousePosRef.current.y = -9999;
    };

    // Fungsi Trigger Partikel Spesial
    const triggerBurst = (clientX: number, clientY: number, isSpecial = false) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;

      const burstCount = isSpecial ? (isMobile ? 40 : 80) : isMobile ? 12 : 30;
      const colors = isSpecial
        ? [
            'rgba(251, 191, 36, ALPHA)', // Emas
            'rgba(245, 158, 11, ALPHA)', // Amber
            'rgba(52, 211, 153, ALPHA)',  // Emerald
            'rgba(255, 255, 255, ALPHA)', // Putih
          ]
        : [
            'rgba(52, 211, 153, ALPHA)',
            'rgba(167, 243, 208, ALPHA)',
            'rgba(251, 191, 36, ALPHA)',
          ];

      for (let i = 0; i < burstCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isSpecial ? 3 + Math.random() * 9 : 2 + Math.random() * 6;
        const char = TEXT_SEQUENCE[Math.floor(Math.random() * TEXT_SEQUENCE.length)];
        burstParticlesRef.current.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          char: isSpecial && Math.random() > 0.5 ? '✦' : char,
          size: isSpecial ? 16 + Math.random() * 14 : 12 + Math.random() * 10,
          alpha: 1,
          life: 0,
          maxLife: isSpecial ? 50 + Math.random() * 30 : 35 + Math.random() * 20,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    // Detektor Spam Klik (10x Klik)
    const handleSpamClick = (clientX: number, clientY: number) => {
      clickCountRef.current += 1;

      // Reset hitungan jika pengguna berhenti mengklik selama 1.5 detik
      if (clickResetTimeoutRef.current) clearTimeout(clickResetTimeoutRef.current);
      clickResetTimeoutRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1500);

      // Jika mencapai 10 klik
      if (clickCountRef.current >= 10) {
        clickCountRef.current = 0;
        
        // Tampilkan Toast
        setShowThankYou(true);
        triggerBurst(clientX, clientY, true);

        // Timer hapus pesan otomatis
        if (thankYouTimeoutRef.current) clearTimeout(thankYouTimeoutRef.current);
        thankYouTimeoutRef.current = setTimeout(() => {
          setShowThankYou(false);
        }, 3500);
      } else {
        triggerBurst(clientX, clientY, false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      handleSpamClick(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault(); // Mencegah emulasi event click ganda di mobile
        updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
        handleSpamClick(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      setupCanvasSize();
      width = parentWidth;
      height = parentHeight;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (clickResetTimeoutRef.current) clearTimeout(clickResetTimeoutRef.current);
      if (thankYouTimeoutRef.current) clearTimeout(thankYouTimeoutRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full relative cursor-pointer select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Easter Egg Popup Toast 10x Klik */}
      {showThankYou && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-[scaleIn_0.35s_ease-out_forwards]">
          <div className="relative px-6 py-4 sm:px-8 sm:py-5 rounded-2xl bg-zinc-950/85 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.35)] flex flex-col items-center justify-center text-center gap-1 group">
            {/* Glow Aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-2xl blur-lg opacity-40 animate-pulse -z-10" />
            
            <span className="text-xs font-mono tracking-widest text-emerald-400/90 uppercase">
              ✦ EASTER EGG UNLOCKED ✦
            </span>
            <h3 className="text-lg sm:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 drop-shadow-md">
              TERIMA KASIH ORANG BAIK 🙏
            </h3>
          </div>
        </div>
      )}

      {/* Subtitle Bawah */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400/60 font-mono tracking-widest uppercase pointer-events-none whitespace-nowrap">
        ✦ TOAPAYA 3D GLOBE • HOVER / SPAM CLICK ✦
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6) rotate(-3deg);
          }
          70% {
            transform: translate(-50%, -50%) scale(1.08) rotate(1deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}