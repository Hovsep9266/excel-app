import './ProfileModal.css';
import './modal-shell.css';
import ModalCloseButton from './ModalCloseButton';

function ProfileModal({ t, open, onClose, currentUser, currentLangLabel }) {
  if (!open) return null;
  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="profile-modal" role="dialog" aria-modal="true" aria-label="Profile">
        <div className="profile-modal-header">
          <h3 className="profile-modal-title">{t('profileTitle')}</h3>
          <ModalCloseButton ariaLabel={t('profileClose')} onClick={onClose} />
        </div>

        <div className="profile-modal-body">
          <p className="profile-line">
            <span>{t('menuLanguage')}:</span> {currentLangLabel}
          </p>
          <p className="profile-line">
            <span>{t('nameLabel')}:</span> {currentUser?.name || '-'}
          </p>
          <p className="profile-line">
            <span>{t('idLabel')}:</span> {currentUser?.id ?? '-'}
          </p>
          <p className="profile-line">
            <span>{t('passwordLabel')}:</span> {currentUser?.password || '-'}
          </p>
          <p className="profile-line">
            <span>{t('fieldsLabel')}:</span> {currentUser?.otherData?.length ?? 0}
          </p>
        </div>
      </div>
    </>
  );
}

export default ProfileModal;
