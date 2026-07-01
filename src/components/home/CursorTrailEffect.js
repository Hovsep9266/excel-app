import { useEffect, useRef, useState } from 'react';
import './CursorTrailEffect.css';

const SLASH_POOL = 28;
const MOBILE_SLASH_DECAY = 0.13;
const DESKTOP_SLASH_DECAY = 0.055;
const MIN_MOVE_SPEED = 4.5;
const MIN_SPAWN_GAP_MS = 28;

function getTouchPoint(event) {
  const touch = event.touches[0] || event.changedTouches[0];
  if (!touch) return null;
  return { x: touch.clientX, y: touch.clientY };
}

function CursorTrailEffect() {
  const [enabled, setEnabled] = useState(false);
  const [isTouchUi, setIsTouchUi] = useState(false);
  const containerRef = useRef(null);
  const touchUiRef = useRef(false);
  const slashNodesRef = useRef([]);
  const slashesRef = useRef(Array.from({ length: SLASH_POOL }, () => null));
  const lastMoveRef = useRef({ x: -200, y: -200, t: 0 });
  const lastSpawnAtRef = useRef(0);
  const lastTouchAtRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateEnabled = () => {
      setEnabled(!reducedMotion.matches);
    };

    updateEnabled();
    reducedMotion.addEventListener('change', updateEnabled);

    return () => {
      reducedMotion.removeEventListener('change', updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const narrowScreen = window.matchMedia('(max-width: 767px)');

    const updateTouchUi = () => {
      const next = coarsePointer.matches || narrowScreen.matches;
      touchUiRef.current = next;
      setIsTouchUi(next);
    };

    updateTouchUi();
    coarsePointer.addEventListener('change', updateTouchUi);
    narrowScreen.addEventListener('change', updateTouchUi);

    return () => {
      coarsePointer.removeEventListener('change', updateTouchUi);
      narrowScreen.removeEventListener('change', updateTouchUi);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    const findSlashSlot = () => {
      const pool = slashesRef.current;
      const emptyIndex = pool.findIndex((slash) => !slash || slash.life <= 0);
      if (emptyIndex !== -1) return emptyIndex;

      let oldestIndex = 0;
      for (let index = 1; index < pool.length; index += 1) {
        if (pool[index].life < pool[oldestIndex].life) oldestIndex = index;
      }
      return oldestIndex;
    };

    const spawnSlash = (x, y, angle, options = {}) => {
      const {
        length = 76,
        power = 1,
        variant = 'main',
        life = 1,
        offset = 0,
      } = options;

      const slot = findSlashSlot();
      slashesRef.current[slot] = {
        x: x + Math.cos(angle + Math.PI / 2) * offset,
        y: y + Math.sin(angle + Math.PI / 2) * offset,
        angle,
        length,
        power,
        variant,
        life,
      };
    };

    const spawnSlashFan = (x, y, baseAngle, { heavy = false, touchTap = false } = {}) => {
      const spread = touchTap ? 0.14 : 0.1;
      const count = touchTap ? 3 : heavy ? 5 : 3;
      const baseLength = touchTap ? 88 : heavy ? 108 : 78;
      const basePower = touchTap ? 1.2 : heavy ? 1.45 : 1;

      const middle = (count - 1) / 2;
      for (let index = 0; index < count; index += 1) {
        const offsetIndex = index - middle;
        spawnSlash(x, y, baseAngle + offsetIndex * spread, {
          length: baseLength + Math.abs(offsetIndex) * 10 + (heavy ? 18 : 0),
          power: basePower - Math.abs(offsetIndex) * 0.08,
          variant: heavy ? 'heavy' : offsetIndex === 0 ? 'main' : 'gust',
          offset: offsetIndex * (heavy ? 5 : 3),
        });
      }

      if (heavy || touchTap) {
        spawnSlash(x, y, baseAngle + 0.42, {
          length: baseLength * 0.72,
          power: basePower * 0.55,
          variant: 'gust',
          offset: -10,
        });
        spawnSlash(x, y, baseAngle - 0.42, {
          length: baseLength * 0.72,
          power: basePower * 0.55,
          variant: 'gust',
          offset: 10,
        });
      }
    };

    const spawnFromMotion = (x, y) => {
      const last = lastMoveRef.current;
      const now = performance.now();
      const dx = x - last.x;
      const dy = y - last.y;
      const speed = Math.hypot(dx, dy);

      if (speed < MIN_MOVE_SPEED || now - lastSpawnAtRef.current < MIN_SPAWN_GAP_MS) {
        lastMoveRef.current = { x, y, t: now };
        return;
      }

      const angle = Math.atan2(dy, dx);
      const power = Math.min(1.35, 0.75 + speed * 0.018);
      const length = Math.min(124, 58 + speed * 1.35);

      spawnSlash(x, y, angle, { length, power, variant: 'main' });

      if (speed > 11) {
        spawnSlash(x, y, angle + 0.11, {
          length: length * 0.82,
          power: power * 0.62,
          variant: 'gust',
          offset: 4,
        });
        spawnSlash(x, y, angle - 0.09, {
          length: length * 0.74,
          power: power * 0.5,
          variant: 'gust',
          offset: -5,
        });
      }

      lastSpawnAtRef.current = now;
      lastMoveRef.current = { x, y, t: now };
    };

    const onMove = (event) => {
      if (touchUiRef.current) return;
      spawnFromMotion(event.clientX, event.clientY);
    };

    const onDown = (event) => {
      if (touchUiRef.current || Date.now() - lastTouchAtRef.current < 500) return;

      const last = lastMoveRef.current;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      const angle = Math.hypot(dx, dy) > 2 ? Math.atan2(dy, dx) : -Math.PI / 4;

      spawnSlashFan(event.clientX, event.clientY, angle, { heavy: true });
      lastMoveRef.current = { x: event.clientX, y: event.clientY, t: performance.now() };
    };

    const onTouchStart = (event) => {
      const point = getTouchPoint(event);
      if (!point) return;

      lastTouchAtRef.current = Date.now();
      const angle = -Math.PI / 3 + Math.random() * 0.55;
      spawnSlashFan(point.x, point.y, angle, { touchTap: true });
    };

    const tick = () => {
      const isTouch = touchUiRef.current;
      const decay = isTouch ? MOBILE_SLASH_DECAY : DESKTOP_SLASH_DECAY;

      slashesRef.current = slashesRef.current.map((slash) => {
        if (!slash || slash.life <= 0) return null;
        return { ...slash, life: slash.life - decay };
      });

      slashNodesRef.current.forEach((node, index) => {
        if (!node) return;

        const slash = slashesRef.current[index];
        if (!slash || slash.life <= 0) {
          node.style.opacity = '0';
          return;
        }

        const angleDeg = (slash.angle * 180) / Math.PI;
        const stretch = 0.55 + slash.life * 0.55;
        const width = slash.length * stretch;
        const opacity = Math.min(1, slash.life * slash.power);

        node.style.width = `${width}px`;
        node.style.transform = `translate3d(${slash.x}px, ${slash.y}px, 0) translate(-50%, -50%) rotate(${angleDeg}deg) scaleX(${0.85 + slash.life * 0.2})`;
        node.style.opacity = String(opacity);
        node.dataset.variant = slash.variant;
      });

      if (containerRef.current) {
        containerRef.current.classList.toggle(
          'cursor-trail--wind-active',
          slashesRef.current.some((slash) => slash && slash.life > 0)
        );
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className={`cursor-trail cursor-trail--katana${isTouchUi ? ' cursor-trail--touch' : ''}`}
      aria-hidden="true"
    >
      {Array.from({ length: SLASH_POOL }, (_, index) => (
        <span
          key={index}
          ref={(node) => {
            slashNodesRef.current[index] = node;
          }}
          className="cursor-trail__slash"
          data-variant="main"
        >
          <span className="cursor-trail__slash-wind" />
          <span className="cursor-trail__slash-edge" />
        </span>
      ))}
    </div>
  );
}

export default CursorTrailEffect;
