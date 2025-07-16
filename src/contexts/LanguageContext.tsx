
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define all translatable strings here
export const translations = {
  en: {
    findSpecialists: "Find Specialists",
    howItWorks: "How it Works",
    aboutUs: "About Us",
    contact: "Contact",
    login: "Log in",
    register: "Register",
    dashboard: "Dashboard",
    profile: "Profile",
    myAppointments: "My Appointments",
    logout: "Logout",
    myAccount: "My Account"
  },
  nl: {
    findSpecialists: "Vind Specialisten",
    howItWorks: "Hoe het Werkt",
    aboutUs: "Over Ons",
    contact: "Contact",
    login: "Inloggen",
    register: "Registreren",
    dashboard: "Dashboard",
    profile: "Profiel",
    myAppointments: "Mijn Afspraken",
    logout: "Uitloggen",
    myAccount: "Mijn Account"
  }
};

type Language = 'en' | 'nl';
type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Get translation for a key
  const t = (key: TranslationKey): string => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
