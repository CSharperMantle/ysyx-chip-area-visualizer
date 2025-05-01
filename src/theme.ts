import { createTheme } from "@mui/material"
import * as colors from "@mui/material/colors"

const theme = createTheme({
  palette: {
    primary: {
      main: colors.blue[500],
    },
    secondary: {
      main: colors.deepOrange["A400"],
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans Variable"',
      "system-ui",
      "Avenir",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
  },
  colorSchemes: {
    dark: true,
  },
})

export default theme
