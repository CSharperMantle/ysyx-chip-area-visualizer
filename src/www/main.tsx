import { forwardRef, StrictMode } from "react"
import { createRoot } from "react-dom/client"

import Alert from "@mui/material/Alert"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { SnackbarProvider } from "notistack"

import App from "./App.tsx"
import theme from "./theme.ts"

import "@fontsource-variable/noto-sans/wght.css"
import "./index.scss"

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
const InfoAlert = forwardRef(({ message }: any, ref: any) => (
  <Alert severity="info" variant="filled" ref={ref}>
    {message}
  </Alert>
))

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
const ErrorAlert = forwardRef(({ message }: any, ref: any) => (
  <Alert severity="error" variant="filled" ref={ref}>
    {message}
  </Alert>
))

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
const WarningAlert = forwardRef(({ message }: any, ref: any) => (
  <Alert severity="warning" variant="filled" ref={ref}>
    {message}
  </Alert>
))

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
const SuccessAlert = forwardRef(({ message }: any, ref: any) => (
  <Alert severity="success" variant="filled" ref={ref}>
    {message}
  </Alert>
))

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        Components={{
          default: InfoAlert,
          error: ErrorAlert,
          warning: WarningAlert,
          success: SuccessAlert,
          info: InfoAlert,
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        autoHideDuration={3000}
      >
        <CssBaseline />
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>
)
