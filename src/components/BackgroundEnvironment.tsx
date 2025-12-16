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

      // Multiple radial gradients for depth
      const gradients = [
        { x: canvas.width * 0.3 + parallaxX, y: canvas.height * 0.2 + parallaxY, radius: 600, opacity: 0.03 },
        { x: canvas.width * 0.7 - parallaxX, y: canvas.height * 0.8 - parallaxY, radius: 500, opacity: 0.02 },
        { x: canvas.width * 0.5 + Math.sin(time) * 30, y: canvas.height * 0.5 + Math.cos(time * 0.7) * 30, radius: 400, opacity: 0.015 },
      ];

      gradients.forEach((grad) => {
        const gradient = ctx.createRadialGradient(grad.x, grad.y, 0, grad.x, grad.y, grad.radius);
        gradient.addColorStop(0, `rgba(107, 114, 128, ${grad.opacity})`);
        gradient.addColorStop(0.5, `rgba(75, 85, 99, ${grad.opacity * 0.5})`);
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
        className="absolute inset-0 opacity-10"
        animate={{
          background: [
            'radial-gradient(circle at 30% 20%, rgba(107, 114, 128, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 80%, rgba(75, 85, 99, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 20%, rgba(107, 114, 128, 0.08) 0%, transparent 50%)',
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
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 10, 0.3) 100%)',
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

