import { useEffect, useMemo, useState } from 'react';
import './HomePage.css';
import '../styles/data-display.css';
import AppWindBackground from '../components/home/AppWindBackground';
import AppLoggedHeader from '../components/home/AppLoggedHeader';
import AuthLoadingOverlay from '../components/home/AuthLoadingOverlay';
import IntroOverlay from '../components/home/IntroOverlay';
import LoginFormCard from '../components/home/LoginFormCard';
import ProfileModal from '../components/home/ProfileModal';
import RulesModal from '../components/home/RulesModal';
import UserMenuModal from '../components/home/UserMenuModal';
import SiteFooterBar from '../components/home/SiteFooterBar';
import UserDataSection from '../components/home/UserDataSection';
import { useExcelRange } from '../hooks/useExcelRange';
import { useHomeAuth } from '../hooks/useHomeAuth';
import { useI18n } from '../i18n/i18n';

function HomePage() {
  const { t, languageOptions, setLang, lang } = useI18n();
  const { tableData, errorMessage, statusText } = useExcelRange(t);
  const auth = useHomeAuth({ tableData, t });

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [languagePickOpen, setLanguagePickOpen] = useState(false);

  const currentLangLabel = useMemo(() => {
    return languageOptions.find((opt) => opt.id === lang)?.label || lang;
  }, [languageOptions, lang]);

  useEffect(() => {
    if (!menuOpen && !profileOpen && !rulesOpen) return;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (rulesOpen) setRulesOpen(false);
      else if (profileOpen) setProfileOpen(false);
      else setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, profileOpen, rulesOpen]);

  useEffect(() => {
    if (!menuOpen) setLanguagePickOpen(false);
  }, [menuOpen]);

  const handleLogout = () => {
    auth.handleLogout();
    setMenuOpen(false);
    setProfileOpen(false);
    setRulesOpen(false);
    setLanguagePickOpen(false);
  };

  return (
    <main className="app-shell">
      <AppWindBackground />
      <AuthLoadingOverlay visible={auth.showAuthLoading && !auth.currentUser} loadingText={t('loading')} />
      <IntroOverlay visible={auth.showIntro} />
      <div className={`app-container${auth.currentUser ? ' app-container--logged-in' : ''}`}>
        {!auth.currentUser ? (
          !auth.showAuthLoading ? (
            <LoginFormCard
              t={t}
              loginName={auth.loginName}
              onLoginNameChange={auth.setLoginName}
              loginPassword={auth.loginPassword}
              onLoginPasswordChange={auth.setLoginPassword}
              showPassword={auth.showPassword}
              onTogglePassword={() => auth.setShowPassword((prev) => !prev)}
              onSubmit={auth.handleLogin}
              authError={auth.authError}
            />
          ) : null
        ) : (
          <div className="logged-page">
            <AppLoggedHeader t={t} />
            <div className="logged-layout">
              <p className={errorMessage ? 'status-text error logged-status' : 'status-text logged-status'}>
                {statusText}
              </p>
              <aside className="menu-area">
                <button
                  className="clickme-button"
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  {t('clickMe')}
                </button>
              </aside>
              <UserDataSection userMonthBlocks={auth.userMonthBlocks} />
            </div>

            <UserMenuModal
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              userName={auth.currentUser?.name}
              t={t}
              onProfile={() => {
                setProfileOpen(true);
                setMenuOpen(false);
                setRulesOpen(false);
                setLanguagePickOpen(false);
              }}
              onRules={() => {
                setRulesOpen(true);
                setMenuOpen(false);
                setLanguagePickOpen(false);
              }}
              onLogout={handleLogout}
              languagePickOpen={languagePickOpen}
              onToggleLanguagePick={() => setLanguagePickOpen((v) => !v)}
              currentLangLabel={currentLangLabel}
              languageOptions={languageOptions}
              onSelectLanguage={(id) => {
                setLang(id);
                setLanguagePickOpen(false);
              }}
            />

            <ProfileModal
              t={t}
              open={profileOpen}
              onClose={() => setProfileOpen(false)}
              currentUser={auth.currentUser}
              currentLangLabel={currentLangLabel}
            />

            <RulesModal t={t} open={rulesOpen} onClose={() => setRulesOpen(false)} />
          </div>
        )}
        <SiteFooterBar t={t} />
      </div>
    </main>
  );
}

export default HomePage;
