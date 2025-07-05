import { useState } from "react"
import { useTranslation } from "react-i18next"

import LanguageIcon from "@mui/icons-material/Language"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Tooltip from "@mui/material/Tooltip"

import { LANGUAGES } from "../i18n"

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const currentLanguage = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0]

  return (
    <>
      <Tooltip title="Language">
        <IconButton
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget)
          }}
          size="large"
          aria-controls={open ? "language-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          setAnchorEl(null)
        }}
        slotProps={{
          list: { "aria-labelledby": "language-button" },
        }}
      >
        {LANGUAGES.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => {
              i18n.changeLanguage(language.code)
              setAnchorEl(null)
            }}
            selected={language.code === currentLanguage.code}
          >
            {language.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default LanguageSwitcher
