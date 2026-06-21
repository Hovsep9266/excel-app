import './SiteFooterBar.css';
import { APP_NAME } from '../../utils';

function SiteFooterBar({ t, videoControls, onVideoExit }) {
  const showVideoControls = Boolean(videoControls);

  return (
    <footer className={`site-footer${showVideoControls ? ' site-footer--with-video' : ''}`}>
      <div className="site-footer-left">
        <span className="site-footer-brand">{APP_NAME}</span>
        <span className="site-footer-sep">•</span>
        <span>© {new Date().getFullYear()}</span>
      </div>

      {showVideoControls ? (
        <div className="site-footer-center">
          <button type="button" className="site-footer-video-btn" onClick={videoControls.togglePause}>
            {videoControls.isPaused ? t('videoPlay') : t('videoStop')}
          </button>
          <button
            type="button"
            className="site-footer-video-btn site-footer-video-btn--exit"
            onClick={onVideoExit}
          >
            {t('videoExit')}
          </button>
        </div>
      ) : null}

      <div className="site-footer-right">{t('footerRight')}</div>
    </footer>
  );
}

export default SiteFooterBar;
