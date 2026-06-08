import './UserMenuModal.css';
import './modal-shell.css';
import ModalCloseButton from './ModalCloseButton';

function UserMenuModal({
  open,
  onClose,
  userName,
  t,
  onProfile,
  onRules,
  onLogout,
  languagePickOpen,
  onToggleLanguagePick,
  currentLangLabel,
  languageOptions,
  onSelectLanguage,
}) {
  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className="user-menu-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-menu-username"
      >
        <div className="user-menu-modal-header">
          <span className="user-menu-modal-header-spacer" aria-hidden />
          <ModalCloseButton ariaLabel={t('profileClose')} onClick={onClose} />
        </div>

        <div className="user-menu-modal-body">
          <p id="user-menu-username" className="user-menu-modal-username">
            {userName || '—'}
          </p>

          <button className="user-menu-modal-row" type="button" onClick={onProfile}>
            {t('menuProfile')}
          </button>

          <button className="user-menu-modal-row" type="button" onClick={onRules}>
            {t('menuRules')}
          </button>

          <div className="user-menu-modal-section">
            <div className="user-menu-modal-section-label">{t('menuLanguage')}</div>
            <button type="button" className="user-menu-modal-lang-toggle" onClick={onToggleLanguagePick}>
              {currentLangLabel}
            </button>
            <div
              className={`user-menu-modal-lang-list-wrap ${
                languagePickOpen ? 'user-menu-modal-lang-list-open' : ''
              }`}
            >
              <div className="user-menu-modal-lang-list">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="user-menu-modal-lang-item"
                    onClick={() => onSelectLanguage(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="user-menu-modal-row user-menu-modal-row--logout" type="button" onClick={onLogout}>
            {t('menuLogOut')}
          </button>
        </div>
      </div>
    </>
  );
}

export default UserMenuModal;
