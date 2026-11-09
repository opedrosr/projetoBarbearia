import { gsap } from 'gsap';

export interface HeroAnimationRefs {
  hero: HTMLElement;
  photoWrap: HTMLElement;
  photo: HTMLElement;
  overlay: HTMLElement;
  topline: HTMLElement;
  eyebrow: HTMLElement;
  titleLines: HTMLElement[];
  heroBottom: HTMLElement;
  heroBottomP: HTMLElement;
  heroButton: HTMLElement;
  sideNote: HTMLElement;
  floatingCard: HTMLElement;
  scroll: HTMLElement;
}

const PREMIUM_EASE = 'power3.out';
const SOFT_EASE = 'power2.out';

/*
 * ANIMAÇÃO DE ENTRADA DO HERO
 */

export function playHeroEntry(
  refs: HeroAnimationRefs,
): gsap.core.Timeline {
  const {
    photoWrap,
    photo,
    overlay,
    topline,
    eyebrow,
    titleLines,
    heroBottom,
    heroBottomP,
    heroButton,
    sideNote,
    floatingCard,
    scroll,
  } = refs;

  const reduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (reduced) {
    gsap.set(
      [
        photoWrap,
        photo,
        overlay,
        topline,
        eyebrow,
        ...titleLines,
        heroBottom,
        heroBottomP,
        heroButton,
        sideNote,
        floatingCard,
        scroll,
      ],
      {
        clearProps: 'all',
      },
    );

    return gsap.timeline();
  }

  gsap.set(photoWrap, {
    scale: 1.1,
    opacity: 0,
    filter: 'blur(14px)',
    transformOrigin: 'center center',
  });

  gsap.set(photo, {
    xPercent: -3,
    scale: 1.055,
    filter: 'blur(3px) saturate(.82)',
    transformOrigin: 'center center',
  });

  gsap.set(overlay, {
    opacity: 0,
  });

  gsap.set(topline, {
    opacity: 0,
    y: -10,
  });

  gsap.set(eyebrow, {
    opacity: 0,
    x: -18,
  });

  gsap.set(titleLines, {
    opacity: 0,
    yPercent: 110,
    clipPath: 'inset(0 0 100% 0)',
  });

  gsap.set(heroBottom, {
    opacity: 0,
    y: 20,
  });

  gsap.set(heroBottomP, {
    opacity: 0,
    y: 12,
  });

  gsap.set(heroButton, {
    opacity: 0,
    y: 16,
    scale: 0.96,
  });

  gsap.set(sideNote, {
    opacity: 0,
    x: -12,
  });

  gsap.set(floatingCard, {
    opacity: 0,
    x: 34,
    y: -10,
    scale: 0.97,
  });

  gsap.set(scroll, {
    opacity: 0,
    y: 10,
  });

  const tl = gsap.timeline({
    defaults: {
      ease: PREMIUM_EASE,
    },
  });

  tl.to(
    photoWrap,
    {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.15,
    },
    0.05,
  )

    .to(
      photo,
      {
        xPercent: 0,
        scale: 1,
        filter: 'blur(0px) saturate(1)',
        duration: 1.35,
        ease: SOFT_EASE,
      },
      0.05,
    )

    .to(
      overlay,
      {
        opacity: 1,
        duration: 0.95,
      },
      0.25,
    )

    .to(
      topline,
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
      },
      0.48,
    )

    .to(
      eyebrow,
      {
        opacity: 1,
        x: 0,
        duration: 0.65,
      },
      0.58,
    )

    .to(
      titleLines,
      {
        opacity: 1,
        yPercent: 0,
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.9,
        stagger: 0.105,
        ease: PREMIUM_EASE,
      },
      0.64,
    )

    .to(
      heroBottom,
      {
        opacity: 1,
        y: 0,
        duration: 0.62,
      },
      1.08,
    )

    .to(
      heroBottomP,
      {
        opacity: 1,
        y: 0,
        duration: 0.52,
      },
      1.15,
    )

    .to(
      heroButton,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.58,
        ease: 'power3.out',
      },
      1.22,
    )

    .to(
      sideNote,
      {
        opacity: 1,
        x: 0,
        duration: 0.62,
      },
      1.3,
    )

    .to(
      floatingCard,
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.72,
        ease: 'power3.out',
      },
      1.34,
    )

    .to(
      scroll,
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
      },
      1.48,
    );

  return tl;
}

/*
 * INTERAÇÃO COM O MOUSE
 */

export function createMouseInteraction(
  photo: HTMLElement,
  textEls: HTMLElement[],
  smallEls: HTMLElement[],
): {
  onMove: (e: MouseEvent) => void;
  onLeave: () => void;
  cleanup: () => void;
} {
  const photoX = gsap.quickTo(photo, 'x', {
    duration: 1.1,
    ease: SOFT_EASE,
  });

  const photoY = gsap.quickTo(photo, 'y', {
    duration: 1.1,
    ease: SOFT_EASE,
  });

  const photoScale = gsap.quickTo(photo, 'scale', {
    duration: 1.4,
    ease: SOFT_EASE,
  });

  const textX = gsap.quickTo(textEls, 'x', {
    duration: 1.4,
    ease: SOFT_EASE,
  });

  const textY = gsap.quickTo(textEls, 'y', {
    duration: 1.4,
    ease: SOFT_EASE,
  });

  const smallX = gsap.quickTo(smallEls, 'x', {
    duration: 1.2,
    ease: SOFT_EASE,
  });

  const smallY = gsap.quickTo(smallEls, 'y', {
    duration: 1.2,
    ease: SOFT_EASE,
  });

  const onMove = (e: MouseEvent) => {
    const nx =
      (e.clientX / window.innerWidth - 0.5) * 2;

    const ny =
      (e.clientY / window.innerHeight - 0.5) * 2;

    photoX(nx * 10);
    photoY(ny * 7);
    photoScale(1.018);

    textX(nx * 3.5);
    textY(ny * 2.5);

    smallX(nx * 7);
    smallY(ny * 5);
  };

  const onLeave = () => {
    photoX(0);
    photoY(0);
    photoScale(1);

    textX(0);
    textY(0);

    smallX(0);
    smallY(0);
  };

  const cleanup = () => {
    gsap.killTweensOf([
      photo,
      ...textEls,
      ...smallEls,
    ]);
  };

  return {
    onMove,
    onLeave,
    cleanup,
  };
}

/*
 * ANIMAÇÃO AMBIENTE DO HALTER
 */

export function startAmbientLoop(
  dumbbell: HTMLElement,
): gsap.core.Tween {
  return gsap.to(dumbbell, {
    y: -12,
    rotation: 3,
    duration: 2.8,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    transformOrigin: 'center center',
  });
}