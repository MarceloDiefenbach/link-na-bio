import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type Language = "pt" | "en";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "pt",
  setLang: () => {},
});

function getStoredLang(): Language | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("lang");
  return stored === "pt" || stored === "en" ? stored : null;
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => getStoredLang() ?? "pt");

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", newLang);
    }
  };

  useEffect(() => {
    if (getStoredLang()) return;
    fetch("https://api.country.is")
      .then((res) => res.json())
      .then((data) => {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("country", data.country);
          } catch {}
        }
        setLang(data.country === "BR" ? "pt" : "en");
      })
      .catch(() => {
        if (typeof navigator !== "undefined" && navigator.language.startsWith("en")) {
          setLang("en");
        }
      });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

