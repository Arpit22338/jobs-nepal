"use client";

import { useEffect, useRef, useState, RefObject } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement>(
  options: ScrollAnimationOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

// CSS classes for animations
export const scrollAnimations = {
  fadeUp: 'opacity-0 translate-y-8',
  fadeUpVisible: 'opacity-100 translate-y-0',
  fadeIn: 'opacity-0',
  fadeInVisible: 'opacity-100',
  fadeLeft: 'opacity-0 -translate-x-8',
  fadeLeftVisible: 'opacity-100 translate-x-0',
  fadeRight: 'opacity-0 translate-x-8',
  fadeRightVisible: 'opacity-100 translate-x-0',
  scaleUp: 'opacity-0 scale-95',
  scaleUpVisible: 'opacity-100 scale-100',
  blur: 'opacity-0 blur-sm',
  blurVisible: 'opacity-100 blur-0',
};

// Component wrapper for scroll animations
export function getScrollClass(isVisible: boolean, animation: keyof typeof scrollAnimations = 'fadeUp') {
  const baseAnimation = scrollAnimations[animation];
  const visibleAnimation = scrollAnimations[`${animation}Visible` as keyof typeof scrollAnimations] || scrollAnimations.fadeUpVisible;
  
  return `transition-all duration-700 ease-out ${isVisible ? visibleAnimation : baseAnimation}`;
}
