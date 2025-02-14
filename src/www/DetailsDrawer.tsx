import { sortBy } from "lodash-es"

import { useTheme } from "@mui/material"
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

import { ConvertedTreeNode } from "../convert"

export type DetailsNode = ConvertedTreeNode & {
  path: string[]
}

const DetailsDrawer = (props: { open: boolean; node: DetailsNode | null; onClose: () => void }) => {
  const theme = useTheme()

  const areaDisplay =
    props.node && props.node.type !== "internal" ? (
      <Typography variant="body1" component="p">
        <strong>Area:</strong> <code>{props.node.size}</code>
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
                  <strong>Primitive</strong>
                </TableCell>
                <TableCell>
                  <strong>Count</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.node.coalescedPrimitives.length === 0 ? (
                <TableRow key="none" sx={{ border: 0 }}>
                  <TableCell colSpan={3} align="center">
                    (none)
                  </TableCell>
                </TableRow>
              ) : (
                sortBy(Object.entries(props.node.coalescedPrimitives), [(v) => v[1]]).map(
                  ([name, count]) => (
                    <TableRow
                      key={name}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <code>{name}</code>
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
          Details
        </Typography>
        <Divider />
        <Typography variant="body1" component="p">
          <strong>Name:</strong> <code>{props.node?.name ?? "?"}</code>
        </Typography>
        <Typography variant="body1" component="p">
          <strong>Path:</strong> <code>{props.node?.path.join("/") ?? "?"}</code>
        </Typography>
        {areaDisplay}
        {coalescedPrimitivesList}
      </Stack>
    </Drawer>
  )
}

export default DetailsDrawer
