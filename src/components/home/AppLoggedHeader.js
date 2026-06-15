import '../../pages/home-common.css';
import './AppLoggedHeader.css';
import { APP_NAME } from '../../utils';

function AppLoggedHeader({ statusText, isError }) {
  return (
    <div className="app-header">
      <div className="app-header-copy">
        <h1 className="app-title site-brand-name">{APP_NAME}</h1>
        {statusText ? (
          <p className={isError ? 'app-header-status app-header-status--error' : 'app-header-status'}>
            {statusText}
          </p>
        ) : null}
      </div>
      <div className="app-site-icon" aria-label={APP_NAME}>
        HS
      </div>
    </div>
  );
}

export default AppLoggedHeader;
