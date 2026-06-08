import './RulesModal.css';
import './modal-shell.css';
import ModalCloseButton from './ModalCloseButton';

const CAPABILITY_KEYS = [
  'rulesCanDo1',
  'rulesCanDo2',
  'rulesCanDo3',
  'rulesCanDo4',
  'rulesCanDo5',
  'rulesCanDo6',
];

function RulesModal({ open, onClose, t }) {
  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-modal-title">
        <div className="rules-modal-header">
          <h3 id="rules-modal-title" className="rules-modal-title">
            {t('rulesTitle')}
          </h3>
          <ModalCloseButton ariaLabel={t('profileClose')} onClick={onClose} />
        </div>

        <div className="rules-modal-body">
          <p className="rules-modal-intro">{t('rulesIntro')}</p>

          <section className="rules-modal-section">
            <h4 className="rules-modal-section-title">{t('rulesAboutTitle')}</h4>
            <p className="rules-modal-text">{t('rulesAboutText')}</p>
          </section>

          <section className="rules-modal-section">
            <h4 className="rules-modal-section-title">{t('rulesCanDoTitle')}</h4>
            <ul className="rules-modal-list">
              {CAPABILITY_KEYS.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </section>

          <section className="rules-modal-section">
            <h4 className="rules-modal-section-title">{t('rulesSeeTitle')}</h4>
            <p className="rules-modal-text">{t('rulesSeeText')}</p>
          </section>

          <section className="rules-modal-section">
            <h4 className="rules-modal-section-title">{t('rulesTipsTitle')}</h4>
            <p className="rules-modal-text">{t('rulesTipsText')}</p>
          </section>

          <p className="rules-modal-thanks">{t('rulesThanksText')}</p>
        </div>
      </div>
    </>
  );
}

export default RulesModal;
