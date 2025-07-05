import { useTranslation as useI18nTranslation } from "react-i18next"

import en from "./locales/en.json"

type TFunction = (key: string, options?: any) => string

const createFallbackT = (): TFunction => {
  return (key: string) => {
    const keys = key.split(".")
    let value: any = en

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key
  }
}

export const useTranslation = () => {
  try {
    const result = useI18nTranslation()
    return result
  } catch {
    return {
      t: createFallbackT(),
      i18n: {
        language: "en",
        changeLanguage: () => Promise.resolve(),
      },
    }
  }
}

export { Trans } from "react-i18next"
