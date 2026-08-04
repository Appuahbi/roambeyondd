import { useEffect, useRef, useState } from 'react';

export function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let rafId;
    let obs;

    const teardown = () => {
      if (obs) {
        obs.disconnect();
        obs = null;
      }
      cancelAnimationFrame(rafId);
    };

    const setup = () => {
      const el = ref.current;
      if (!el) {
        rafId = requestAnimationFrame(setup);
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setShown(true);
        return;
      }
      obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              setShown(true);
              if (obs) obs.disconnect();
            }
          });
        },
        { threshold }
      );
      obs.observe(el);
    };

    setup();
    return teardown;
  }, [threshold]);

  return [ref, shown];
}

export function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}
