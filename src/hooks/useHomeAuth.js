import { useEffect, useMemo, useRef, useState } from 'react';
import { APP_NAME } from '../utils';
import { buildObjectsFromColumnA } from '../utils/buildColumnAObjects';
import { AUTH_STORAGE_KEY } from '../constants/authStorage';

export function useHomeAuth({ tableData, t }) {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthLoading, setShowAuthLoading] = useState(true);
  const [savedAuth, setSavedAuth] = useState(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  });

  const [showIntro, setShowIntro] = useState(false);

  const builtObjects = useMemo(() => buildObjectsFromColumnA(tableData), [tableData]);
  const userRows = useMemo(() => {
    if (!currentUser) return [];
    return [[currentUser.name, ...currentUser.otherData]];
  }, [currentUser]);

  useEffect(() => {
    const authLoadingTimer = window.setTimeout(() => {
      setShowAuthLoading(false);
    }, 1000);
    return () => window.clearTimeout(authLoadingTimer);
  }, []);

  const prevHadUserRef = useRef(false);
  useEffect(() => {
    const hadUserBefore = prevHadUserRef.current;
    const hasUserNow = Boolean(currentUser);

    if (!hasUserNow) {
      prevHadUserRef.current = false;
      setShowIntro(false);
      return undefined;
    }

    if (!hadUserBefore) {
      setShowIntro(true);
      const introTimer = window.setTimeout(() => {
        setShowIntro(false);
      }, 2300);
      prevHadUserRef.current = true;
      return () => window.clearTimeout(introTimer);
    }

    prevHadUserRef.current = true;
    return undefined;
  }, [currentUser]);

  const handleLogin = (event) => {
    event.preventDefault();
    const nextName = loginName.trim();
    const nextPassword = loginPassword.trim();

    const user = builtObjects.find(
      (item) => item.name === nextName && item.password === nextPassword
    );

    if (!user) {
      setAuthError(t('wrongCredentials'));
      return;
    }

    setAuthError('');
    setCurrentUser(user);
    setSavedAuth({ id: user.id, name: user.name, password: user.password });
  };

  useEffect(() => {
    if (!currentUser) return;
    const refreshedUser = builtObjects.find(
      (item) => item.id === currentUser.id && item.name === currentUser.name
    );
    if (refreshedUser) {
      setCurrentUser(refreshedUser);
      return;
    }
    setCurrentUser(null);
  }, [builtObjects, currentUser]);

  useEffect(() => {
    if (currentUser || !savedAuth) return;
    const restoredUser = builtObjects.find(
      (item) =>
        item.id === savedAuth.id &&
        item.name === savedAuth.name &&
        item.password === savedAuth.password
    );
    if (restoredUser) {
      setCurrentUser(restoredUser);
    }
  }, [builtObjects, currentUser, savedAuth]);

  useEffect(() => {
    try {
      if (savedAuth) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(savedAuth));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      // Ignore localStorage failures.
    }
  }, [savedAuth]);

  const handleLogout = () => {
    setCurrentUser(null);
    setSavedAuth(null);
    setLoginName('');
    setLoginPassword('');
    setAuthError('');
    setShowPassword(false);
  };

  useEffect(() => {
    const baseTitle = APP_NAME;
    if (currentUser?.name) {
      const safeName = encodeURIComponent(currentUser.name);
      window.history.replaceState(null, '', `/${safeName}`);
      document.title = `${APP_NAME} - ${currentUser.name}`;
      return;
    }
    window.history.replaceState(null, '', '/');
    document.title = baseTitle;
  }, [currentUser]);

  return {
    loginName,
    setLoginName,
    loginPassword,
    setLoginPassword,
    showPassword,
    setShowPassword,
    authError,
    currentUser,
    showAuthLoading,
    showIntro,
    handleLogin,
    handleLogout,
    userRows,
  };
}
