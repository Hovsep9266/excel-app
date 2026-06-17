import { useCallback, useEffect, useRef, useState } from 'react';

export function useMenuMusic(trackUrls) {
  const audioRef = useRef(null);
  const trackIndexRef = useRef(0);
  const trackUrlsRef = useRef(trackUrls);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    trackUrlsRef.current = trackUrls;
  }, [trackUrls]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const playTrackAt = (index) => {
      const urls = trackUrlsRef.current;
      if (!urls.length) return;

      const nextIndex = ((index % urls.length) + urls.length) % urls.length;
      trackIndexRef.current = nextIndex;
      audio.src = urls[nextIndex];
      audio.play().catch(() => {});
    };

    const handleEnded = () => {
      playTrackAt(trackIndexRef.current + 1);
    };
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audioRef.current = null;
    };
  }, []);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    const urls = trackUrlsRef.current;
    if (!audio || !urls.length) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (!audio.src) {
      trackIndexRef.current = 0;
      audio.src = urls[0];
      audio.play().catch(() => {});
      return;
    }

    audio.play().catch(() => {});
  }, []);

  const hasTracks = trackUrls.length > 0;

  return {
    hasTracks,
    isPlaying,
    togglePlayback,
  };
}
