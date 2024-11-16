import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import { NegativeAnimation } from './NegativeAnimation';

interface ProgressBarProps {
  percentage: number;
  target?: number;
  showLabel?: boolean;
}

export function ProgressBar({ percentage, target = 80, showLabel = true }: ProgressBarProps) {
  const controls = useAnimation();
  const barControls = useAnimation();
  const prevPercentageRef = useRef(percentage);
  const hasExceededTargetRef = useRef(false);
  const [showNegativeAnimation, setShowNegativeAnimation] = useState(false);
  const lastUpdateTimeRef = useRef(Date.now());
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const getProgressColor = (value: number) => {
    if (value >= target) return '#059669';
    if (value >= target * 0.7) return '#EAB308';
    return '#DC2626';
  };

  const createConfettiCanvas = () => {
    if (confettiCanvasRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    confettiCanvasRef.current = canvas;

    return () => {
      if (confettiCanvasRef.current) {
        document.body.removeChild(confettiCanvasRef.current);
        confettiCanvasRef.current = null;
      }
    };
  };

  const triggerConfetti = () => {
    createConfettiCanvas();
    
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 0,
      disableForReducedMotion: true,
      useWorker: true,
      resize: true
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        if (confettiCanvasRef.current) {
          document.body.removeChild(confettiCanvasRef.current);
          confettiCanvasRef.current = null;
        }
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const triggerNegativeAnimation = async () => {
    setShowNegativeAnimation(true);
    await Promise.all([
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      }),
      barControls.start({
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.98, 1, 0.98, 1],
        transition: { duration: 0.5 }
      })
    ]);
    
    setTimeout(() => setShowNegativeAnimation(false), 3000);
  };

  useEffect(() => {
    const prevPercentage = prevPercentageRef.current;
    const hasExceededTarget = hasExceededTargetRef.current;
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

    if (timeSinceLastUpdate > 1000 && Math.abs(percentage - prevPercentage) <= 20) {
      if (percentage >= target && prevPercentage < target && !hasExceededTarget) {
        triggerConfetti();
        hasExceededTargetRef.current = true;
      }
      else if (percentage < target && prevPercentage >= target) {
        triggerNegativeAnimation();
        hasExceededTargetRef.current = false;
      }
      else if (percentage < target && prevPercentage > percentage && 
               (prevPercentage - percentage) > 10) {
        triggerNegativeAnimation();
      }

      lastUpdateTimeRef.current = now;
    }

    prevPercentageRef.current = percentage;
  }, [percentage, target]);

  useEffect(() => {
    return () => {
      if (confettiCanvasRef.current) {
        document.body.removeChild(confettiCanvasRef.current);
        confettiCanvasRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <NegativeAnimation isActive={showNegativeAnimation} />
      <div className="relative">
        {target > 0 && (
          <div
            className="absolute h-full w-px bg-indigo-600 z-10"
            style={{ left: `${target}%` }}
          >
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-indigo-600 whitespace-nowrap">
              Target: {target}%
            </span>
          </div>
        )}
        <motion.div 
          className="h-4 bg-gray-200 rounded-full overflow-hidden"
          animate={controls}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ backgroundColor: getProgressColor(percentage) }}
            className="h-full rounded-full relative"
          >
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={barControls}
            >
              {showLabel && (
                <span className="text-xs font-medium text-white">
                  {percentage}%
                </span>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}