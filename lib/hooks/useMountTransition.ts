'use client';
import { useEffect, useState } from 'react';

/**
 * Keeps a popup/modal mounted for `duration` ms after it's asked to close,
 * so a CSS opacity/transform transition can actually play instead of the
 * element vanishing on the same render `isOpen` flips to false.
 *
 * Usage: `const {shouldRender, isVisible} = useMountTransition(isOpen, 200);`
 * then `if (!shouldRender) return null;` and toggle a `.is-visible` class
 * (or similar) off `isVisible` on the outermost element, with a matching
 * `transition: opacity .2s ease, transform .2s ease` in CSS.
 */
export function useMountTransition(isOpen: boolean, duration = 200) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isOpen) {
      setShouldRender(true);
      // Let the browser paint the "not yet visible" state first, otherwise
      // the transition has no starting point to animate from.
      timeoutId = setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      timeoutId = setTimeout(() => setShouldRender(false), duration);
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen, duration]);

  return { shouldRender, isVisible };
}
