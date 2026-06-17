import { useEffect, useMemo, useRef, useState } from 'react';
import { isAnnouncementAdmin, isSelectableAnnouncementRecipient } from '../../utils/isAnnouncementAdmin';
import './AnnouncementModal.css';
import './modal-shell.css';
import ModalCloseButton from './ModalCloseButton';

function withoutAdminRecipients(recipientIds = [], allUsers = []) {
  const adminIds = new Set(allUsers.filter(isAnnouncementAdmin).map((user) => user.id));
  return recipientIds.filter((id) => !adminIds.has(Number(id)));
}

function AnnouncementModal({
  t,
  open,
  onClose,
  allUsers,
  currentAnnouncement,
  onSubmit,
  onDelete,
}) {
  const [text, setText] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const wasOpenRef = useRef(false);

  const selectableUsers = allUsers.filter(isSelectableAnnouncementRecipient);
  const selectableUserIds = useMemo(() => selectableUsers.map((user) => user.id), [selectableUsers]);
  const hasAnnouncement = Boolean(currentAnnouncement?.text);
  const selectAllRef = useRef(null);

  const allSelected =
    selectableUserIds.length > 0 && selectableUserIds.every((id) => selectedIds.includes(id));
  const someSelected =
    selectableUserIds.some((id) => selectedIds.includes(id)) && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;

    if (!justOpened) return;

    setText(currentAnnouncement?.text || '');
    setSelectedIds(withoutAdminRecipients(currentAnnouncement?.recipientIds || [], allUsers));
    setErrorMessage('');
    setIsSaving(false);
    setIsDeleting(false);
  }, [open, currentAnnouncement, allUsers]);

  if (!open) return null;

  const toggleUser = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    setSelectedIds(allSelected ? [] : [...selectableUserIds]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMessage(t('announcementTextRequired'));
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      await onSubmit({ text: trimmed, recipientIds: selectedIds });
      onClose();
    } catch (error) {
      setErrorMessage(error.message || t('announcementSaveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setErrorMessage('');
      await onDelete();
      onClose();
    } catch (error) {
      setErrorMessage(error.message || t('announcementDeleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className="announcement-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-modal-title"
      >
        <div className="announcement-modal-header">
          <h3 id="announcement-modal-title" className="announcement-modal-title">
            {t('announcementTitle')}
          </h3>
          <ModalCloseButton ariaLabel={t('profileClose')} onClick={onClose} />
        </div>

        <form className="announcement-modal-body" onSubmit={handleSubmit}>
          <p className="announcement-modal-hint">{t('announcementRecipientsHint')}</p>

          <div className="announcement-user-list">
            {selectableUsers.length > 0 ? (
              <label className="announcement-user-row announcement-user-row--all">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAllUsers}
                />
                <span>{t('announcementSelectAll')}</span>
              </label>
            ) : null}
            {selectableUsers.map((user) => (
              <label key={user.id} className="announcement-user-row">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                />
                <span>{user.name}</span>
              </label>
            ))}
          </div>

          <label className="announcement-text-label" htmlFor="announcement-text">
            {t('announcementTextLabel')}
          </label>
          <textarea
            id="announcement-text"
            className="announcement-textarea"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('announcementTextPlaceholder')}
            rows={4}
          />

          {errorMessage ? <p className="announcement-error">{errorMessage}</p> : null}

          <div className="announcement-modal-actions">
            {hasAnnouncement ? (
              <button
                type="button"
                className="announcement-delete-btn"
                onClick={handleDelete}
                disabled={isSaving || isDeleting}
              >
                {isDeleting ? t('loading') : t('announcementDelete')}
              </button>
            ) : null}
            <button type="submit" className="announcement-submit-btn" disabled={isSaving || isDeleting}>
              {isSaving ? t('loading') : t('announcementSubmit')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default AnnouncementModal;
