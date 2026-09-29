import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Draggable range control used for the seek bar and volume.
 *
 * A native `<input type="range">` cannot express Spotify's styling (bar that
 * grows on hover, handle that appears only on hover), so this is built from a
 * div plus pointer events. Keyboard support is preserved via arrow keys.
 */
export default function Slider({
  value = 0,
  max = 1,
  onChange,
  green = false,
  label = 'Volumen',
  valueText,
  step = 0.01,
}) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  const positionFromEvent = useCallback(
    (clientX) => {
      const el = trackRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return 0;
      const pct = (clientX - rect.left) / rect.width;
      return Math.min(1, Math.max(0, pct));
    },
    []
  );

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    onChange(positionFromEvent(e.clientX) * max);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    onChange(positionFromEvent(e.clientX) * max);
  };

  const stopDragging = () => setDragging(false);

  // A pointer released outside the element still ends the drag.
  useEffect(() => {
    if (!dragging) return undefined;
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
    return () => {
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [dragging]);

  const handleKeyDown = (e) => {
    const big = max / 10;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = value + step * 5;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = value - step * 5;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = max;
    else if (e.key === 'PageUp') next = value + big;
    else if (e.key === 'PageDown') next = value - big;
    if (next === null) return;
    e.preventDefault();
    onChange(Math.min(max, Math.max(0, next)));
  };

  return (
    <div
      className={`slider${green ? ' slider--green' : ''}`}
      ref={trackRef}
      style={{ '--fill': `${ratio * 100}%` }}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
    >
      <div className="slider-track">
        <div className="slider-fill" />
      </div>
      <div className="slider-handle" />
    </div>
  );
}
