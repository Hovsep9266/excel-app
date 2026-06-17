import { useEffect, useRef } from 'react';
import './AnnouncementBanner.css';

function AnnouncementBanner({ text, onHeightChange }) {
  const bannerRef = useRef(null);

  useEffect(() => {
    const element = bannerRef.current;
    if (!element) {
      onHeightChange?.(0);
      return undefined;
    }

    const updateHeight = () => {
      onHeightChange?.(element.offsetHeight);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => {
      observer.disconnect();
      onHeightChange?.(0);
    };
  }, [text, onHeightChange]);

  if (!text) return null;

  return (
    <div ref={bannerRef} className="announcement-banner" role="status" aria-live="polite">
      <p className="announcement-banner-text">{text}</p>
    </div>
  );
}

export default AnnouncementBanner;
