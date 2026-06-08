import './IntroOverlay.css';
import { useI18n } from '../../i18n/i18n';
import { APP_NAME, INTRO_DURATION_MS } from '../../utils';

function IntroOverlay({ visible }) {
  const { t } = useI18n();

  if (!visible) return null;

  return (
    <div
      className="intro-overlay"
      style={{ '--intro-duration': `${INTRO_DURATION_MS}ms` }}
      aria-hidden="true"
    >
      <div className="intro-splash">
        <div className="intro-mark" aria-hidden="true">
          AP
        </div>
        <p className="intro-welcome">{t('introWelcome')}</p>
        <p className="intro-brand">{APP_NAME}</p>
        <p className="intro-tagline">{t('introTagline')}</p>
      </div>
    </div>
  );
}

export default IntroOverlay;
