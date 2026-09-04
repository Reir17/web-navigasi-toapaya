'use client';

import { useEffect, useRef } from 'react';

// Kombinasi kata "TOAPAYA" dan tanda baca pendukung
const TEXT_SEQUENCE = ['W', 'A', 'M', 'B', 'U', 'L', '✦', '•', '+', '°', '✧', '•', '◇'];

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const radius = Math.min(width, height) * 0.38;

    // Membuat multi-loop path orbit berisi kata "TOAPAYA"
    const loopCount = 14;
    const itemsPerLoop = 35;
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
        paths.push({
          char,
          theta: (Math.PI * 2 * i) / itemsPerLoop,
          loopIndex: l,
          inclination,
          azimuth,
          speedOffset: 0.7 + (l % 3) * 0.25,
          baseSize: 'WAMBUL'.includes(char) ? 14 : 10,
          isLetter: 'WAMBUL'.includes(char),
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

      // Glow Latar Belakang (Radial Ambient Illumination)
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

      // Render Aliran Huruf & Simbol 3D Globe
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

          // Huruf TOAPAYA diberi aksen emas/neon hijau menyala
          if (mouseGlow > 0.2) {
            ctx.fillStyle = `rgba(167, 243, 208, ${alpha})`;
            ctx.shadowColor = '#34d399';
            ctx.shadowBlur = 12;
          } else if (item.isLetter) {
            ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = `rgba(110, 231, 183, ${alpha * 0.7})`;
            ctx.shadowColor = '#059669';
            ctx.shadowBlur = 2;
          }

          ctx.fillText(item.char, screenX, screenY);
          ctx.restore();
        }
      });

      // Render & Update Click-Burst Particles
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
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 8;
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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isHovered: true,
      };
    };

    const handleMouseLeave = () => {
      mousePosRef.current.isHovered = false;
      mousePosRef.current.x = -9999;
      mousePosRef.current.y = -9999;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const burstCount = 30;
      const colors = [
        'rgba(52, 211, 153, ALPHA)',
        'rgba(167, 243, 208, ALPHA)',
        'rgba(251, 191, 36, ALPHA)',
      ];

      for (let i = 0; i < burstCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        const char = TEXT_SEQUENCE[Math.floor(Math.random() * TEXT_SEQUENCE.length)];
        burstParticlesRef.current.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          char,
          size: 12 + Math.random() * 10,
          alpha: 1,
          life: 0,
          maxLife: 35 + Math.random() * 20,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full relative cursor-pointer select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400/60 font-mono tracking-widest uppercase pointer-events-none whitespace-nowrap">
        ✦ TOAPAYA 3D GLOBE • HOVER / CLICK ✦
      </div>
    </div>
  );
}