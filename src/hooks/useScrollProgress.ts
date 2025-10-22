import { useState, useEffect, useRef, RefObject } from 'react';

export const useScrollProgress = (elementRef: RefObject<HTMLElement>) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const elementHeight = elementRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on element position
      const startScroll = rect.top + window.scrollY - windowHeight;
      const endScroll = rect.top + window.scrollY + elementHeight;
      const scrollRange = endScroll - startScroll;
      const currentScroll = window.scrollY;
      
      const scrollProgress = (currentScroll - startScroll) / scrollRange;
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      
      setProgress(clampedProgress);
    };

    handleScroll(); // Initial calculation
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [elementRef]);

  return progress;
};
