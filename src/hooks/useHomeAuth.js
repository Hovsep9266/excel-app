import { useEffect, useMemo, useRef, useState } from 'react';
import { APP_NAME, INTRO_DURATION_MS } from '../utils';
import { buildObjectsFromColumnA } from '../utils/buildColumnAObjects';
import { findWorkerForLogin, parseUserWorkMonths } from '../utils/parseUserWorkMonths';
import { AUTH_STORAGE_KEY } from '../constants/authStorage';

function workerSnapshot(worker) {
  return {
    id: worker.id,
    name: worker.name,
    password: worker.password,
    otherData: worker.otherData || [],
  };
}

function workersEqual(left, right) {
  if (!left || !right) return false;
  return (
    left.id === right.id &&
    left.name === right.name &&
    left.password === right.password &&
    left.otherData.join('|') === right.otherData.join('|')
  );
}

export function findWorkerSessionMatch(workers, session) {
  if (!session || !workers.length) return null;

  const byId = workers.find((worker) => worker.id === session.id);
  if (byId) return byId;

  const login = findWorkerForLogin(workers, session.name, session.password);
  return login.ok ? login.user : null;
}

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
  const showIntroOnLoginRef = useRef(false);

  const builtObjects = useMemo(() => buildObjectsFromColumnA(tableData), [tableData]);
  const userMonthBlocks = useMemo(() => {
    if (!currentUser) return [];
    return parseUserWorkMonths(tableData, currentUser.name);
  }, [currentUser, tableData]);

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

    if (!hadUserBefore && showIntroOnLoginRef.current) {
      showIntroOnLoginRef.current = false;
      setShowIntro(true);
      const introTimer = window.setTimeout(() => {
        setShowIntro(false);
      }, INTRO_DURATION_MS);
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

    const result = findWorkerForLogin(builtObjects, nextName, nextPassword);

    if (!result.ok) {
      setAuthError(t('wrongCredentials'));
      return;
    }

    const user = result.user;
    setAuthError('');
    showIntroOnLoginRef.current = true;
    setCurrentUser(user);
    setSavedAuth(workerSnapshot(user));
  };

  useEffect(() => {
    if (!currentUser || !builtObjects.length) return;

    const refreshedUser = findWorkerSessionMatch(builtObjects, currentUser);
    if (!refreshedUser) {
      setCurrentUser(null);
      return;
    }

    if (!workersEqual(workerSnapshot(currentUser), workerSnapshot(refreshedUser))) {
      setCurrentUser(refreshedUser);
      setSavedAuth(workerSnapshot(refreshedUser));
    }
  }, [builtObjects, currentUser]);

  useEffect(() => {
    if (currentUser || !savedAuth || !builtObjects.length) return;

    const restoredUser = findWorkerSessionMatch(builtObjects, savedAuth);
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
    showIntroOnLoginRef.current = false;
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
    userMonthBlocks,
    allUsers: builtObjects,
  };
}
