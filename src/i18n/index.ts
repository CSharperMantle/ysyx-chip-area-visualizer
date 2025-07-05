import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import en from "./locales/en.json"
import zh from "./locales/zh.json"

const RESOURCES = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
} as const

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
] as const

const isBrowser = typeof window !== "undefined"

const i18nConfig = {
  resources: RESOURCES,
  lng: "en",
  fallbackLng: "en",
  debug: import.meta.env.DEV,
  interpolation: {
    escapeValue: false,
  },
  detection: isBrowser
    ? {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
      }
    : {
        order: ["htmlTag"],
        caches: [],
      },
}

if (isBrowser) {
  i18n.use(LanguageDetector)
}

i18n.use(initReactI18next).init(i18nConfig)

export default i18n

export { LANGUAGES, RESOURCES }
