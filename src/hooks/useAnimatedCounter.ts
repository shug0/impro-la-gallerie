import { useState, useEffect, useRef, useCallback } from 'react';

export const useAnimatedCounter = (max: number, intervalMs: number, isActive = true) => {
  const [count, setCount] = useState(1);
  const rafId = useRef<number>();
  const lastUpdate = useRef<number>(0);
  const isActiveRef = useRef(isActive);

  // Update ref when isActive changes
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const animate = useCallback((timestamp: number) => {
    if (!isActiveRef.current) {
      // If not active, schedule next frame but don't update
      rafId.current = requestAnimationFrame(animate);
      return;
    }

    if (timestamp - lastUpdate.current >= intervalMs) {
      setCount(prev => prev >= max ? 1 : prev + 1);
      lastUpdate.current = timestamp;
    }
    
    rafId.current = requestAnimationFrame(animate);
  }, [max, intervalMs]);

  useEffect(() => {
    lastUpdate.current = performance.now();
    rafId.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [animate]);

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