import React, { useState, useEffect, useRef } from 'react';

/**
 * CasinoCounter
 * Generates an exciting, smooth casino slot-machine style ticker rolling animation
 * as numbers load or change.
 */
export default function CasinoCounter({ 
  value = 0, 
  prefix = '₹', 
  suffix = '', 
  duration = 900,
  isCurrency = true,
  className = ''
}) {
  const [displayNumber, setDisplayNumber] = useState(0);
  const prevValueRef = useRef(0);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const startVal = prevValueRef.current || 0;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Casino slot ease-out deceleration curve: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentInterpolated = startVal + (target - startVal) * easeProgress;

      if (progress < 1) {
        // In the spinning phase (first 70%), randomize lower digits for the casino ticker roll effect
        if (progress < 0.75 && target > 100) {
          const jitter = (Math.random() - 0.5) * (target * 0.05 * (1 - progress));
          setDisplayNumber(Math.max(0, Math.round(currentInterpolated + jitter)));
        } else {
          setDisplayNumber(Math.round(currentInterpolated));
        }
        animationFrameRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayNumber(target);
        prevValueRef.current = target;
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  const formatted = isCurrency
    ? (displayNumber || 0).toLocaleString('en-IN')
    : displayNumber;

  return (
    <span className={`inline-flex items-baseline font-mono tracking-tight font-bold ${className}`}>
      {prefix && <span className="opacity-80 mr-0.5">{prefix}</span>}
      <span>{formatted}</span>
      {suffix && <span className="opacity-80 ml-0.5">{suffix}</span>}
    </span>
  );
}
