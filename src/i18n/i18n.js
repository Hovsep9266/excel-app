import React, { createContext, useContext, useMemo, useState } from 'react';
import { languageOptions, messages } from './messages';

const I18nContext = createContext(null);

const AUTH_LANG_KEY = 'excel-app-lang';

function getInitialLang() {
  try {
    const saved = window.localStorage.getItem(AUTH_LANG_KEY);
    if (saved && messages[saved]) return saved;
  } catch (e) {
    // ignore
  }
  return 'en';
}

function formatTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (!vars) return `{${key}}`;
    return vars[key] ?? `{${key}}`;
  });
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  const persist = (nextLang) => {
    setLang(nextLang);
    try {
      window.localStorage.setItem(AUTH_LANG_KEY, nextLang);
    } catch (e) {
      // ignore
    }
  };

  const value = useMemo(() => {
    const t = (key, vars) => {
      const msg = messages[lang]?.[key];
      if (!msg) return key;
      return vars ? formatTemplate(msg, vars) : msg;
    };

    return { lang, setLang: persist, t, languageOptions };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

