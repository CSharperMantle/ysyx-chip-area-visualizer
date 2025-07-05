import { I18nextProvider } from "react-i18next"
import { clientOnly } from "vike-react/clientOnly"

import i18n from "./index"

const ClientOnlyI18nextProvider = clientOnly(async () => {
  const Component = ({ children }: { children: React.ReactNode }) => {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  }
  return Component
})

const SSGFallback = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClientOnlyI18nextProvider fallback={<SSGFallback>{children}</SSGFallback>}>
      {children}
    </ClientOnlyI18nextProvider>
  )
}

export { I18nProvider }
