import { useEffect, useRef, useState } from 'react';
import './MenuVideoBackground.css';
import { useYoutubePlayer } from '../../hooks/useYoutubePlayer';

function MenuVideoBackground({
  youtubeId,
  fileSrc,
  startSeconds = 0,
  visible,
  onEnded,
  onRegisterControls,
}) {
  const fileVideoRef = useRef(null);
  const [filePaused, setFilePaused] = useState(false);
  const youtube = useYoutubePlayer({
    videoId: youtubeId,
    active: Boolean(youtubeId),
    startSeconds,
    onEnded,
  });

  useEffect(() => {
    if (!fileSrc) return undefined;

    const video = fileVideoRef.current;
    if (!video) return undefined;

    video.currentTime = 0;
    if (visible) video.play().catch(() => {});
    setFilePaused(false);

    const handlePlay = () => setFilePaused(false);
    const handlePause = () => setFilePaused(true);
    const handleEnded = () => onEnded?.();

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.pause();
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [fileSrc, onEnded, visible]);

  const isPaused = youtubeId ? youtube.isPaused : filePaused;

  const togglePause = () => {
    if (youtubeId) {
      if (youtube.isPaused) youtube.play();
      else youtube.pause();
      return;
    }

    const video = fileVideoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  useEffect(() => {
    if (!onRegisterControls) return undefined;

    onRegisterControls({
      isPaused,
      togglePause,
    });

    return () => onRegisterControls(null);
  }, [isPaused, onRegisterControls]);

  return (
    <div
      className={`menu-video-bg${visible ? ' menu-video-bg--visible' : ''}`}
      aria-hidden="true"
    >
      {youtubeId ? (
        <div className="menu-video-bg__media">
          <div ref={youtube.containerRef} className="menu-video-bg__youtube-target" />
        </div>
      ) : (
        <video
          ref={fileVideoRef}
          className="menu-video-bg__file-video"
          src={fileSrc}
          playsInline
          autoPlay
          muted={false}
        />
      )}

      <div className="menu-video-bg__shade" />
    </div>
  );
}

export default MenuVideoBackground;
