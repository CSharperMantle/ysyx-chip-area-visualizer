import "react-i18next"
import type en from "../i18n/locales/en.json"

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation"
    resources: {
      translation: typeof en
    }
  }
}
