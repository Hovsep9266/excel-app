import { useCallback, useEffect, useRef, useState } from 'react';

let youtubeApiPromise;

function loadYoutubeIframeApi() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.YT?.Player) return Promise.resolve(window.YT);

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve(window.YT);
      };

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);
    });
  }

  return youtubeApiPromise;
}

export function useYoutubePlayer({ videoId, active, startSeconds = 0, onEnded }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const onEndedRef = useRef(onEnded);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    if (!active || !videoId) return undefined;

    let cancelled = false;

    loadYoutubeIframeApi().then((YT) => {
      if (cancelled || !containerRef.current || !YT?.Player) return;

      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          start: startSeconds > 0 ? startSeconds : undefined,
        },
        events: {
          onReady: (event) => {
            if (startSeconds > 0) event.target.seekTo(startSeconds, true);
            event.target.playVideo();
            setIsPaused(false);
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) setIsPaused(false);
            if (event.data === YT.PlayerState.PAUSED) setIsPaused(true);
            if (event.data === YT.PlayerState.ENDED) onEndedRef.current?.();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      setIsPaused(false);
    };
  }, [active, videoId, startSeconds]);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo?.();
    setIsPaused(true);
  }, []);

  const play = useCallback(() => {
    playerRef.current?.playVideo?.();
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    if (isPaused) play();
    else pause();
  }, [isPaused, pause, play]);

  return {
    containerRef,
    isPaused,
    pause,
    play,
    togglePause,
  };
}
