import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion';
import { getCurrencyParts } from '../../utils/currency';

interface NumberTickerProps {
  value: number;
  currency?: string;
  className?: string;
  showSymbol?: boolean;
  symbolClassName?: string;
}

/**
 * Zero-Rerender Number Ticker
 * Updates DOM node textContent directly on every frame of spring animation
 * without triggering React component re-renders.
 */
export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  currency = 'EUR',
  className = '',
  showSymbol = true,
  symbolClassName = 'text-white/60 ml-1.5 font-normal text-3xl',
}) => {
  const valueRef = useRef<HTMLSpanElement>(null);
  const symbolRef = useRef<HTMLSpanElement>(null);

  const initialParts = getCurrencyParts(value, currency);

  const motionVal = useMotionValue(value);
  const springVal = useSpring(motionVal, {
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  });

  // Zero-rerender DOM textContent update on each spring frame
  useMotionValueEvent(springVal, 'change', (latest) => {
    if (valueRef.current) {
      const parts = getCurrencyParts(latest, currency);
      valueRef.current.textContent = parts.value;
    }
  });

  useEffect(() => {
    motionVal.set(value);
    // Explicitly snap to target on finish to avoid float precision drift
    const timer = setTimeout(() => {
      if (valueRef.current) {
        const exactParts = getCurrencyParts(value, currency);
        valueRef.current.textContent = exactParts.value;
        if (symbolRef.current) {
          symbolRef.current.textContent = exactParts.currencySymbol;
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [value, currency, motionVal]);

  return (
    <span className={`inline-flex items-baseline font-sans tabular-nums tracking-tight font-bold ${className}`}>
      <span ref={valueRef}>{initialParts.value}</span>
      {showSymbol && (
        <span ref={symbolRef} className={symbolClassName}>
          {initialParts.currencySymbol}
        </span>
      )}
    </span>
  );
};

