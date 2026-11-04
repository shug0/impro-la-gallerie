import { useState, useEffect, useRef, useCallback } from 'react';

export const useAnimatedCounter = (max: number, intervalMs: number, isActive = true) => {
  const [count, setCount] = useState(1);
  const lastUpdate = useRef<number>(0);
  const isActiveRef = useRef(isActive);

  // Update ref when isActive changes
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    let rafId: number;

    const animate = (timestamp: number) => {
      // If not active, schedule next frame but don't update
      if (isActiveRef.current && timestamp - lastUpdate.current >= intervalMs) {
        setCount(prev => prev >= max ? 1 : prev + 1);
        lastUpdate.current = timestamp;
      }

      rafId = requestAnimationFrame(animate);
    };

    lastUpdate.current = performance.now();
    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [max, intervalMs]);

  // Stop animation
  const stop = useCallback(() => {
    isActiveRef.current = false;
  }, []);

  // Start animation
  const start = useCallback(() => {
    isActiveRef.current = true;
    lastUpdate.current = performance.now();
  }, []);

  return { count, stop, start };
};
