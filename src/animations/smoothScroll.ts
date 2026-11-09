import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll(): Lenis {
  if (lenisInstance) return lenisInstance;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !prefersReduced,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    lerp: 0.1,
    autoRaf: false,
  anchors: false,
    syncTouch: false,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    infinite: false,
    autoResize: true,
  });

  lenisInstance = lenis;

  function raf(time: number) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return lenis;
}

export function destroySmoothScroll(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
