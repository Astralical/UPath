"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, type Language, type TranslationKey } from "@/lib/i18n";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "zh",
  setLang: () => {},
  t: () => "",
});

function resolvePath(obj: any, path: string): string {
  const parts = path.split(".");
  let current: any = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return path;
    current = current[part];
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("zh");

  useEffect(() => {
    const stored = localStorage.getItem("upath-lang") as Language | null;
    if (stored === "en" || stored === "zh") {
      setLangState(stored);
    } else {
      // Default to Chinese for this platform
      setLangState("zh");
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("upath-lang", newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return resolvePath(translations[lang], key);
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
