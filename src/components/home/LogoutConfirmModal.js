import './LogoutConfirmModal.css';
import './modal-shell.css';
import ModalCloseButton from './ModalCloseButton';

function LogoutConfirmModal({ t, open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className="logout-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
      >
        <div className="logout-confirm-modal-header">
          <h3 id="logout-confirm-title" className="logout-confirm-modal-title">
            {t('logoutConfirmTitle')}
          </h3>
          <ModalCloseButton ariaLabel={t('profileClose')} onClick={onClose} />
        </div>

        <div className="logout-confirm-modal-body">
          <p className="logout-confirm-modal-text">{t('logoutConfirmText')}</p>
          <div className="logout-confirm-modal-actions">
            <button type="button" className="logout-confirm-btn logout-confirm-btn--no" onClick={onClose}>
              {t('logoutConfirmNo')}
            </button>
            <button type="button" className="logout-confirm-btn logout-confirm-btn--yes" onClick={onConfirm}>
              {t('logoutConfirmYes')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LogoutConfirmModal;
