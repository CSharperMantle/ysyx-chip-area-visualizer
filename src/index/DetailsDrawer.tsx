import { sortBy } from "lodash-es"
import { useTranslation } from "react-i18next"

import { styled, useTheme } from "@mui/material"
import Divider from "@mui/material/Divider"
import Drawer from "@mui/material/Drawer"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"

import { ConvertedTreeNode } from "../parser/convert"

export type DetailsNode = ConvertedTreeNode & {
  path: string[]
}

const BreakAnywhereCode = styled("code")(() => ({
  wordBreak: "break-all",
}))

const DetailsDrawer = (props: { open: boolean; node: DetailsNode | null; onClose: () => void }) => {
  const theme = useTheme()
  const { t } = useTranslation()

  const areaDisplay =
    props.node && props.node.type !== "internal" ? (
      <Typography variant="body1" component="p">
        <strong>{t("details.area")}</strong> <code>{props.node.size}</code>
      </Typography>
    ) : null
  const coalescedPrimitivesList =
    props.node && props.node.type !== "internal" && props.node.coalescedPrimitives ? (
      <>
        <TableContainer
          sx={{
            overflowY: "scroll",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>{t("details.primitive")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("details.count")}</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.node.coalescedPrimitives.length === 0 ? (
                <TableRow key="none" sx={{ border: 0 }}>
                  <TableCell colSpan={3} align="center">
                    {t("details.none")}
                  </TableCell>
                </TableRow>
              ) : (
                sortBy(Object.entries(props.node.coalescedPrimitives), [(v) => -v[1]]).map(
                  ([name, count]) => (
                    <TableRow
                      key={name}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <BreakAnywhereCode>{name}</BreakAnywhereCode>
                      </TableCell>
                      <TableCell>{count}</TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    ) : null

  return (
    <Drawer open={props.open} onClose={props.onClose} anchor="right">
      <Stack
        direction="column"
        spacing={2}
        component="section"
        role="presentation"
        sx={{ width: 300, height: "100%", padding: theme.spacing(2) }}
      >
        <Typography variant="h4" component="h2">
          {t("details.title")}
        </Typography>
        <Divider />
        <Typography variant="body1" component="p">
          <strong>{t("details.name")}</strong>{" "}
          <BreakAnywhereCode>{props.node?.name ?? "?"}</BreakAnywhereCode>
        </Typography>
        <Typography variant="body1" component="p">
          <strong>{t("details.path")}</strong>{" "}
          <BreakAnywhereCode>{props.node?.path.join("/") ?? "?"}</BreakAnywhereCode>
        </Typography>
        {areaDisplay}
        {coalescedPrimitivesList}
      </Stack>
    </Drawer>
  )
}

export default DetailsDrawer
