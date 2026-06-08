import './SiteFooterBar.css';
import { APP_NAME } from '../../utils';

function SiteFooterBar({ t }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-left">
        <span className="site-footer-brand">{APP_NAME}</span>
        <span className="site-footer-sep">•</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
      <div className="site-footer-right">{t('footerRight')}</div>
    </footer>
  );
}

export default SiteFooterBar;
