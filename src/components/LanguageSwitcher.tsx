"use client";

import { useLang } from "@/lib/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-300 hover:bg-gray-100 transition-colors text-gray-600"
      title={lang === "zh" ? "Switch to English" : "Switch to Chinese"}
    >
      {lang === "zh" ? "EN" : "中文"}
    </button>
  );
}
