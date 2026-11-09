import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface HeroScrollRefs {
  hero: HTMLElement;
  photoWrap: HTMLElement;
  photo: HTMLElement;
  titleLines: HTMLElement[];
  heroBottom: HTMLElement;
  floatingCard: HTMLElement;
  scroll: HTMLElement;
  dumbbell: HTMLElement;
  nextSection: HTMLElement;
}

export function initHeroScroll(refs: HeroScrollRefs): () => void {
  const {
    hero,
    photoWrap,
    photo,
    titleLines,
    heroBottom,
    floatingCard,
    scroll,
    dumbbell,
    nextSection,
  } = refs;

  const reduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (reduced) return () => {};

  const triggers: ScrollTrigger[] = [];

  /*
   * HERO SCROLL ANIMATION
   */

  const st1 = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: 0.8,

    onUpdate: (self) => {
      const p = self.progress;

      gsap.set(hero, {
        scale: 1 - p * 0.018,
        transformOrigin: 'center top',
      });

      gsap.set(photoWrap, {
        scale: 1.02 + p * 0.08,
        y: p * 34,
      });

      gsap.set(photo, {
        opacity: 1 - p * 0.4,
        filter: `blur(${p * 1.5}px) saturate(${1 - p * 0.55})`,
      });

      gsap.set(titleLines, {
        yPercent: -p * 28,
        opacity: 1 - p * 0.6,
      });

      gsap.set(heroBottom, {
        y: -p * 40,
        opacity: 1 - p * 1.2,
      });

      gsap.set(floatingCard, {
        x: p * 40,
        opacity: 1 - p * 1.5,
      });

      gsap.set(scroll, {
        opacity: 1 - p * 2,
      });

      gsap.set(dumbbell, {
        y: -p * 35,
        rotation: p * 12,
        opacity: 1 - p * 0.5,
      });
    },
  });

  triggers.push(st1);

  /*
   * NEXT SECTION REVEAL
   */

  const st2 = ScrollTrigger.create({
    trigger: nextSection,
    start: 'top 85%',
    end: 'top 30%',
    scrub: 0.8,

    onUpdate: (self) => {
      gsap.set(nextSection, {
        opacity: 0.2 + self.progress * 0.8,
        y: (1 - self.progress) * 40,
      });
    },
  });

  triggers.push(st2);

  /*
   * CLEANUP
   */

  return () => {
    triggers.forEach((t) => t.kill());
  };
}