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
                Object.entries(props.node.coalescedPrimitives).map(([name, count]) => (
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
                ))
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
        padding="2rem"
        height="100%"
        component="section"
        role="presentation"
        sx={{ width: 300 }}
      >
        <Typography variant="h4" component="h2">
          Module details
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
