'use client';

import { useState, useEffect, useRef } from 'react';

interface StatsCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  label: string;
  bgColor?: string;
}

export default function StatsCounter({ end, duration = 2000, suffix = '', label, bgColor = 'bg-white border border-slate-200' }: StatsCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateCount = () => {
      const startTime = Date.now();
      const startValue = 0;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart);
        
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCount();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasAnimated, end, duration]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString('en-US');
  };

  const displayValue = formatNumber(count);

  return (
    <div 
      ref={observerRef} 
      className={`text-center px-6 py-8 rounded-2xl ${bgColor} transition-all duration-300 cursor-default`}
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
        {displayValue}
        {suffix && <span className="text-2xl">{suffix}</span>}
      </div>
      <div className="text-slate-600 font-medium text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
}
