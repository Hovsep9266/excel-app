import { useCallback, useRef, useState } from 'react';

export const BACKGROUND_FADE_MS = 900;

export function useMenuVideoBackground() {
  const [videoMounted, setVideoMounted] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const closeTimerRef = useRef(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openVideo = useCallback(() => {
    clearCloseTimer();
    setVideoMounted(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setVideoVisible(true));
    });
  }, [clearCloseTimer]);

  const closeVideo = useCallback(() => {
    clearCloseTimer();
    setVideoVisible(false);
    closeTimerRef.current = window.setTimeout(() => {
      setVideoMounted(false);
      closeTimerRef.current = null;
    }, BACKGROUND_FADE_MS);
  }, [clearCloseTimer]);

  const resetVideo = useCallback(() => {
    clearCloseTimer();
    setVideoVisible(false);
    setVideoMounted(false);
  }, [clearCloseTimer]);

  return {
    videoMounted,
    videoVisible,
    openVideo,
    closeVideo,
    resetVideo,
  };
}
