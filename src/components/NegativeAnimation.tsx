import React, { useEffect, useRef } from 'react';

interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

interface NegativeAnimationProps {
  isActive: boolean;
}

export function NegativeAnimation({ isActive }: NegativeAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raindropsRef = useRef<Raindrop[]>([]);
  const animationFrameRef = useRef<number>();

  const createRaindrop = (canvas: HTMLCanvasElement): Raindrop => {
    return {
      x: Math.random() * canvas.width,
      y: -20,
      length: Math.random() * 15 + 10,
      speed: Math.random() * 8 + 12,
      opacity: Math.random() * 0.3 + 0.1
    };
  };

  const initializeRain = (canvas: HTMLCanvasElement) => {
    raindropsRef.current = Array.from({ length: 150 }, () => createRaindrop(canvas));
  };

  const animate = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#DC2626';
    ctx.lineCap = 'round';

    raindropsRef.current.forEach((drop, index) => {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.globalAlpha = drop.opacity;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Update raindrop position
      drop.y += drop.speed;

      // Reset raindrop if it's off screen
      if (drop.y > canvas.height + drop.length) {
        raindropsRef.current[index] = createRaindrop(canvas);
      }
    });

    // Add a dark overlay for mood
    ctx.fillStyle = 'rgba(220, 38, 38, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animationFrameRef.current = requestAnimationFrame(() => animate(canvas, ctx));
  };

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

    if (isActive) {
      initializeRain(canvas);
      animate(canvas, ctx);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: 0.9 }}
    />
  );
}