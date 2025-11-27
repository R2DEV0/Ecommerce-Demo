'use client';

import { useState, useEffect, useRef } from 'react';

interface StatsCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  label: string;
  bgColor?: string;
}

export default function StatsCounter({ end, duration = 2000, suffix = '', label, bgColor = 'bg-primary-50' }: StatsCounterProps) {
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
        
        // Easing function for smooth animation
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
      // Format millions: 2,406,124 -> 2.4M
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      // Format thousands: 102,002 -> 102K
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString('en-US');
  };

  const displayValue = formatNumber(count);

  return (
    <div ref={observerRef} className={`text-center px-6 py-10 rounded-2xl ${bgColor} transition-all hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-primary-200 min-h-[180px] flex flex-col justify-center`}>
      <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-600 mb-4 leading-tight">
        <span className="block">{displayValue}</span>
        {suffix && <span className="text-3xl md:text-4xl">{suffix}</span>}
      </div>
      <div className="text-gray-700 font-bold text-base md:text-lg uppercase tracking-wider mt-auto">{label}</div>
    </div>
  );
}

