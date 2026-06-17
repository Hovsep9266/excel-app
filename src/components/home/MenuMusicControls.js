import './MenuMusicControls.css';

function MusicIcon({ playing }) {
  if (playing) {
    return (
      <svg className="menu-music-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
        <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg className="menu-music-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
    </svg>
  );
}

function MenuMusicControls({ t, hasTracks, isPlaying, onToggle }) {
  if (!hasTracks) return null;

  return (
    <button
      type="button"
      className={`menu-music-btn${isPlaying ? ' menu-music-btn--playing' : ''}`}
      onClick={onToggle}
      aria-pressed={isPlaying}
    >
      <MusicIcon playing={isPlaying} />
      <span>{isPlaying ? t('musicPause') : t('musicPlay')}</span>
    </button>
  );
}

export default MenuMusicControls;
