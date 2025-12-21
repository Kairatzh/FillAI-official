'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';

/**
 * Living atmospheric background with parallax, fog, and ambient effects
 */
export default function BackgroundEnvironment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cursorPosition } = useUIStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.01;

      // Parallax offset based on cursor position
      const parallaxX = (cursorPosition.x / canvas.width - 0.5) * 50;
      const parallaxY = (cursorPosition.y / canvas.height - 0.5) * 50;

      // Multiple radial gradients for depth (серо-черная палитра)
      const gradients = [
        { x: canvas.width * 0.3 + parallaxX, y: canvas.height * 0.2 + parallaxY, radius: 600, opacity: 0.06 },
        { x: canvas.width * 0.7 - parallaxX, y: canvas.height * 0.8 - parallaxY, radius: 500, opacity: 0.05 },
        { x: canvas.width * 0.5 + Math.sin(time) * 30, y: canvas.height * 0.5 + Math.cos(time * 0.7) * 30, radius: 400, opacity: 0.04 },
      ];

      gradients.forEach((grad) => {
        const gradient = ctx.createRadialGradient(grad.x, grad.y, 0, grad.x, grad.y, grad.radius);
        gradient.addColorStop(0, `rgba(60, 60, 60, ${grad.opacity})`);
        gradient.addColorStop(0.5, `rgba(30, 30, 30, ${grad.opacity * 0.7})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Сетка убрана по требованию

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, [cursorPosition]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Radial gradient overlays */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 30% 20%, rgba(60, 60, 60, 0.15) 0%, transparent 55%)',
            'radial-gradient(circle at 70% 80%, rgba(80, 80, 80, 0.12) 0%, transparent 55%)',
            'radial-gradient(circle at 30% 20%, rgba(60, 60, 60, 0.15) 0%, transparent 55%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Canvas for dynamic effects */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Volumetric fog layers */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(20, 20, 20, 0.6) 100%)',
        }}
        animate={{
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

