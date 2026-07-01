import { useEffect, useMemo, useState } from 'react';
import './HomePage.css';
import '../styles/data-display.css';
import AppWindBackground from '../components/home/AppWindBackground';
import CursorTrailEffect from '../components/home/CursorTrailEffect';
import AnnouncementBanner from '../components/home/AnnouncementBanner';
import AnnouncementModal from '../components/home/AnnouncementModal';
import AppLoggedHeader from '../components/home/AppLoggedHeader';
import AuthLoadingOverlay from '../components/home/AuthLoadingOverlay';
import IntroOverlay from '../components/home/IntroOverlay';
import LoginFormCard from '../components/home/LoginFormCard';
import LogoutConfirmModal from '../components/home/LogoutConfirmModal';
import ProfileModal from '../components/home/ProfileModal';
import RulesModal from '../components/home/RulesModal';
import UserMenuModal from '../components/home/UserMenuModal';
import MenuVideoBackground from '../components/home/MenuVideoBackground';
import SiteFooterBar from '../components/home/SiteFooterBar';
import UserDataSection from '../components/home/UserDataSection';
import { menuMusicTracks } from '../constants/menuMusic';
import { getMenuVideoConfig } from '../constants/menuVideo';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useExcelRange } from '../hooks/useExcelRange';
import { useHomeAuth } from '../hooks/useHomeAuth';
import { useMenuMusic } from '../hooks/useMenuMusic';
import { useMenuVideoBackground } from '../hooks/useMenuVideoBackground';
import { useI18n } from '../i18n/i18n';
import { canUserSeeAnnouncement, isAnnouncementAdmin, normalizeUserKey } from '../utils/isAnnouncementAdmin';

function HomePage() {
  const { t, languageOptions, setLang, lang } = useI18n();
  const { tableData, errorMessage, statusText } = useExcelRange(t);
  const auth = useHomeAuth({ tableData, t });
  const announcements = useAnnouncements();
  const menuMusic = useMenuMusic(menuMusicTracks);
  const menuVideo = useMemo(() => getMenuVideoConfig(), []);
  const menuVideoBackground = useMenuVideoBackground();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [languagePickOpen, setLanguagePickOpen] = useState(false);
  const [tablesExpanded, setTablesExpanded] = useState(true);
  const [announcementBannerHeight, setAnnouncementBannerHeight] = useState(0);
  const [videoPlaybackControls, setVideoPlaybackControls] = useState(null);

  const currentLangLabel = useMemo(() => {
    return languageOptions.find((opt) => opt.id === lang)?.label || lang;
  }, [languageOptions, lang]);

  const canManageAnnouncements = useMemo(
    () => isAnnouncementAdmin(auth.currentUser),
    [auth.currentUser]
  );

  const visibleAnnouncementText = useMemo(() => {
    if (!canUserSeeAnnouncement(auth.currentUser, announcements.announcement)) return '';
    return announcements.announcement?.text || '';
  }, [auth.currentUser, announcements.announcement]);

  useEffect(() => {
    if (!menuOpen && !profileOpen && !rulesOpen && !logoutConfirmOpen && !announcementOpen) return;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (logoutConfirmOpen) setLogoutConfirmOpen(false);
      else if (announcementOpen) setAnnouncementOpen(false);
      else if (rulesOpen) setRulesOpen(false);
      else if (profileOpen) setProfileOpen(false);
      else setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, profileOpen, rulesOpen, logoutConfirmOpen, announcementOpen]);

  useEffect(() => {
    if (!menuOpen) setLanguagePickOpen(false);
  }, [menuOpen]);

  const handleLogout = () => {
    auth.handleLogout();
    setMenuOpen(false);
    setProfileOpen(false);
    setRulesOpen(false);
    setAnnouncementOpen(false);
    setLogoutConfirmOpen(false);
    setLanguagePickOpen(false);
    menuVideoBackground.resetVideo();
    setVideoPlaybackControls(null);
  };

  const handleLogoutRequest = () => {
    setMenuOpen(false);
    setLanguagePickOpen(false);
    setLogoutConfirmOpen(true);
  };

  const hasVisibleAnnouncement = Boolean(auth.currentUser && visibleAnnouncementText);

  const isMusicBlocked =
    menuVideoBackground.videoVisible &&
    Boolean(videoPlaybackControls) &&
    !videoPlaybackControls.isPaused;

  useEffect(() => {
    if (isMusicBlocked) {
      menuMusic.pausePlayback();
    }
  }, [isMusicBlocked, menuMusic.pausePlayback]);

  useEffect(() => {
    if (!hasVisibleAnnouncement) {
      setAnnouncementBannerHeight(0);
    }
  }, [hasVisibleAnnouncement]);

  return (
    <main
      className={`app-shell${hasVisibleAnnouncement ? ' app-shell--with-announcement' : ''}`}
      style={{ '--announcement-banner-height': `${announcementBannerHeight}px` }}
    >
      <AppWindBackground visible={!menuVideoBackground.videoVisible} />
      <CursorTrailEffect />
      {menuVideoBackground.videoMounted && menuVideo.hasVideo ? (
        <MenuVideoBackground
          youtubeId={menuVideo.youtubeId}
          fileSrc={menuVideo.fileSrc}
          startSeconds={menuVideo.startSeconds}
          visible={menuVideoBackground.videoVisible}
          onEnded={menuVideoBackground.closeVideo}
          onRegisterControls={setVideoPlaybackControls}
        />
      ) : null}
      <AuthLoadingOverlay visible={auth.showAuthLoading && !auth.currentUser} loadingText={t('loading')} />
      <IntroOverlay visible={auth.showIntro} />
      {hasVisibleAnnouncement ? (
        <AnnouncementBanner
          text={visibleAnnouncementText}
          onHeightChange={setAnnouncementBannerHeight}
        />
      ) : null}
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
            <AppLoggedHeader statusText={statusText} isError={Boolean(errorMessage)} />
            <div className="logged-layout">
              <aside className={`menu-area${tablesExpanded ? '' : ' menu-area--collapsed'}`}>
                <button
                  className="clickme-button"
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  tabIndex={tablesExpanded ? 0 : -1}
                >
                  {t('clickMe')}
                </button>
              </aside>
              <UserDataSection
                userMonthBlocks={auth.userMonthBlocks}
                tablesExpanded={tablesExpanded}
                onTablesExpandedChange={(next) => {
                  const expanded = typeof next === 'function' ? next(tablesExpanded) : next;
                  setTablesExpanded(expanded);
                  if (!expanded) setMenuOpen(false);
                }}
              />
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
                setAnnouncementOpen(false);
                setLanguagePickOpen(false);
              }}
              onRules={() => {
                setRulesOpen(true);
                setMenuOpen(false);
                setLanguagePickOpen(false);
              }}
              onAnnouncement={() => {
                setAnnouncementOpen(true);
                setMenuOpen(false);
                setProfileOpen(false);
                setRulesOpen(false);
                setLanguagePickOpen(false);
              }}
              canManageAnnouncements={canManageAnnouncements}
              onLogout={handleLogoutRequest}
              languagePickOpen={languagePickOpen}
              onToggleLanguagePick={() => setLanguagePickOpen((v) => !v)}
              currentLangLabel={currentLangLabel}
              languageOptions={languageOptions}
              onSelectLanguage={(id) => {
                setLang(id);
                setLanguagePickOpen(false);
              }}
              musicHasTracks={menuMusic.hasTracks}
              musicIsPlaying={menuMusic.isPlaying}
              musicDisabled={isMusicBlocked}
              onToggleMusic={menuMusic.togglePlayback}
              hasMenuVideo={menuVideo.hasVideo}
              onVideo={() => {
                menuMusic.pausePlayback();
                menuVideoBackground.openVideo();
                setMenuOpen(false);
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

            <AnnouncementModal
              t={t}
              open={announcementOpen}
              onClose={() => setAnnouncementOpen(false)}
              allUsers={auth.allUsers}
              currentAnnouncement={announcements.announcement}
              onSubmit={({ text, recipientIds }) => {
                const recipientKeys = auth.allUsers
                  .filter((user) => recipientIds.includes(user.id))
                  .map((user) => normalizeUserKey(user.name));
                return announcements.publishAnnouncement({
                  text,
                  recipientIds,
                  recipientKeys,
                  userId: auth.currentUser?.id,
                  userName: auth.currentUser?.name,
                });
              }}
              onDelete={() =>
                announcements.removeAnnouncement({
                  userId: auth.currentUser?.id,
                  userName: auth.currentUser?.name,
                })
              }
            />

            <LogoutConfirmModal
              t={t}
              open={logoutConfirmOpen}
              onClose={() => setLogoutConfirmOpen(false)}
              onConfirm={handleLogout}
            />
          </div>
        )}
        <SiteFooterBar
          t={t}
          videoControls={
            menuVideoBackground.videoMounted && menuVideoBackground.videoVisible
              ? videoPlaybackControls
              : null
          }
          onVideoExit={() => {
            menuVideoBackground.closeVideo();
            setVideoPlaybackControls(null);
          }}
        />
      </div>
    </main>
  );
}

export default HomePage;
