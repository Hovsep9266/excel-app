import '../../pages/home-common.css';
import './AppLoggedHeader.css';
import { APP_NAME } from '../../utils';

function AppLoggedHeader({ t }) {
  return (
    <div className="app-header">
      <div className="app-header-copy">
        <h1 className="app-title site-brand-name">{APP_NAME}</h1>
        <p className="app-subtitle">{t('liveViewSubtitle')}</p>
      </div>
      <div className="app-site-icon" aria-label={APP_NAME}>
        HS
      </div>
    </div>
  );
}

export default AppLoggedHeader;
