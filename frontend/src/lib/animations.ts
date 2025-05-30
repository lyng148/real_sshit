import { animate, createTimeline, stagger } from 'animejs';

// Common easing curves
export const EASING = {
  smooth: 'easeOutExpo',
  bounce: 'easeOutElastic(1, .8)',
  sharp: 'easeOutCubic',
  gentle: 'easeInOutSine',
  quick: 'easeOutQuad',
} as const;

// Animation durations
export const DURATION = {
  fast: 300,
  normal: 500,
  slow: 800,
  page: 1000,
} as const;

// Page transition animations
export const pageTransitions = {
  fadeIn: (target: string | HTMLElement, delay = 0) => {
    return animate(target, {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: DURATION.normal,
      delay,
      easing: EASING.smooth,
    });
  },

  slideInFromRight: (target: string | HTMLElement, delay = 0) => {
    return animate(target, {
      opacity: [0, 1],
      translateX: [50, 0],
      duration: DURATION.normal,
      delay,
      easing: EASING.smooth,
    });
  },

  slideInFromLeft: (target: string | HTMLElement, delay = 0) => {
    return animate(target, {
      opacity: [0, 1],
      translateX: [-50, 0],
      duration: DURATION.normal,
      delay,
      easing: EASING.smooth,
    });
  },

  scaleIn: (target: string | HTMLElement, delay = 0) => {
    return animate(target, {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: DURATION.normal,
      delay,
      easing: EASING.bounce,
    });
  },
};

// Card animations
export const cardAnimations = {
  hoverScale: (target: string | HTMLElement) => {
    return animate(target, {
      scale: 1.02,
      duration: DURATION.fast,
      easing: EASING.quick,
    });
  },

  hoverReset: (target: string | HTMLElement) => {
    return animate(target, {
      scale: 1,
      duration: DURATION.fast,
      easing: EASING.quick,
    });
  },

  staggerIn: (targets: string, delay = 100) => {
    return animate(targets, {
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.95, 1],
      duration: DURATION.normal,
      delay: stagger(delay),
      easing: EASING.smooth,
    });
  },
};

// Button animations
export const buttonAnimations = {
  click: (target: string | HTMLElement) => {
    return animate(target, {
      scale: [1, 0.95, 1],
      duration: DURATION.fast,
      easing: EASING.quick,
    });
  },

  pulse: (target: string | HTMLElement) => {
    return animate(target, {
      scale: [1, 1.05, 1],
      duration: DURATION.slow,
      loop: true,
      easing: EASING.gentle,
    });
  },
};

// Loading animations
export const loadingAnimations = {
  spinner: (target: string | HTMLElement) => {
    return animate(target, {
      rotate: '1turn',
      duration: DURATION.page,
      loop: true,
      easing: 'linear',
    });
  },

  dots: (target: string) => {
    return animate(target, {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      duration: DURATION.normal,
      delay: stagger(150),
      loop: true,
      easing: EASING.gentle,
    });
  },
};

// Notification animations
export const notificationAnimations = {
  slideInFromTop: (target: string | HTMLElement) => {
    return animate(target, {
      opacity: [0, 1],
      translateY: [-50, 0],
      duration: DURATION.normal,
      easing: EASING.bounce,
    });
  },

  slideOutToTop: (target: string | HTMLElement) => {
    return animate(target, {
      opacity: [1, 0],
      translateY: [0, -50],
      duration: DURATION.normal,
      easing: EASING.sharp,
    });
  },
};

// Progress bar animations
export const progressAnimations = {
  fillBar: (target: string | HTMLElement, width: number) => {
    return animate(target, {
      width: `${width}%`,
      duration: DURATION.slow,
      easing: EASING.smooth,
    });
  },

  countUp: (target: string | HTMLElement, endValue: number) => {
    const obj = { value: 0 };
    return animate(obj, {
      value: endValue,
      duration: DURATION.slow,
      easing: EASING.smooth,
      update: () => {
        if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) el.textContent = Math.round(obj.value).toString();
        } else {
          target.textContent = Math.round(obj.value).toString();
        }
      },
    });
  },
};

// List animations
export const listAnimations = {
  staggeredAppear: (targets: string, delay = 80) => {
    return animate(targets, {
      opacity: [0, 1],
      translateX: [-30, 0],
      duration: DURATION.normal,
      delay: stagger(delay),
      easing: EASING.smooth,
    });
  },

  removeItem: (target: string | HTMLElement) => {
    return animate(target, {
      opacity: [1, 0],
      height: [null, 0],
      marginBottom: [null, 0],
      duration: DURATION.normal,
      easing: EASING.sharp,
    });
  },
};

// Modal animations
export const modalAnimations = {
  fadeInBackdrop: (target: string | HTMLElement) => {
    return animate(target, {
      opacity: [0, 1],
      duration: DURATION.fast,
      easing: EASING.quick,
    });
  },

  scaleInModal: (target: string | HTMLElement) => {
    return animate(target, {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: DURATION.normal,
      easing: EASING.bounce,
    });
  },

  fadeOutBackdrop: (target: string | HTMLElement) => {
    return animate(target, {
      opacity: [1, 0],
      duration: DURATION.fast,
      easing: EASING.quick,
    });
  },

  scaleOutModal: (target: string | HTMLElement) => {
    return animate(target, {
      opacity: [1, 0],
      scale: [1, 0.9],
      duration: DURATION.fast,
      easing: EASING.sharp,
    });
  },
};

// Chart animations
export const chartAnimations = {
  drawLine: (target: string | HTMLElement) => {
    return animate(target, {
      strokeDashoffset: [1000, 0],
      duration: DURATION.slow,
      easing: EASING.smooth,
    });
  },

  growBar: (target: string | HTMLElement, height: number) => {
    return animate(target, {
      height: [0, height],
      duration: DURATION.slow,
      delay: stagger(100),
      easing: EASING.bounce,
    });
  },
};

// Create a timeline for complex animations
export const createAnimationTimeline = (
  options: { easing?: string; duration?: number } = {}
) => {
  return createTimeline({
    easing: options.easing || EASING.smooth,
    duration: options.duration || DURATION.normal,
  });
};

// Utility to animate on scroll
export const animateOnScroll = (
  target: string,
  animation: any,
  threshold = 0.1
) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animation();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold }
  );

  const elements = document.querySelectorAll(target);
  elements.forEach((el) => observer.observe(el));

  return observer;
};

// Export a default animations object
export const animations = {
  page: pageTransitions,
  card: cardAnimations,
  button: buttonAnimations,
  loading: loadingAnimations,
  notification: notificationAnimations,
  progress: progressAnimations,
  list: listAnimations,
  modal: modalAnimations,
  chart: chartAnimations,
}; 