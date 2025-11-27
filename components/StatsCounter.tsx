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
    return num.toLocaleString('en-US');
  };

  const displayValue = formatNumber(count);

  return (
    <div ref={observerRef} className={`text-center px-4 py-6 rounded-lg ${bgColor} transition-all hover:shadow-md`}>
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-600 mb-3">
        {displayValue}{suffix}
      </div>
      <div className="text-gray-700 font-medium text-base md:text-lg">{label}</div>
    </div>
  );
}

