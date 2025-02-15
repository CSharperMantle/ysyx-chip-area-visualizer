import { useEffect, useId, useMemo, useRef, useState } from "react"

import DeleteIcon from "@mui/icons-material/Delete"
import FileOpenIcon from "@mui/icons-material/FileOpen"
import PieChartIcon from "@mui/icons-material/PieChart"
import { styled, useTheme } from "@mui/material"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Divider from "@mui/material/Divider"
import FormControl from "@mui/material/FormControl"
import Grid from "@mui/material/Grid2"
import IconButton from "@mui/material/IconButton"
import InputLabel from "@mui/material/InputLabel"
import Link from "@mui/material/Link"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Select from "@mui/material/Select"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"

import { useSnackbar } from "notistack"
import { useRegisterSW } from "virtual:pwa-register/react"

import { ConvertedTreeNode, convertParsedModules } from "../convert"
import { ParsedModule, parseTextStats, parseYosysJsonStats } from "../parse"
import D3Treemap from "./D3Treemap"

const CenteringGrid = styled(Grid)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}))

const UpdateDialog = (props: { open: boolean; onConfirm: () => void; onCancel: () => void }) => {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <Dialog open={props.open} aria-labelledby={titleId} aria-describedby={descriptionId}>
      <DialogTitle id={titleId}>Apply updates?</DialogTitle>
      <DialogContent>
        <DialogContentText id={descriptionId}>
          A new version of this app is available. Refresh to update?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button onClick={props.onConfirm} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const LicenseText = () => {
  return (
    <Stack direction="column" spacing={2}>
      <Typography variant="h5" component="h2">
        License
      </Typography>
      <Typography variant="body1" component="p">
        Copyright &copy; 2025 Rong "Mantle" Bao {"<"}
        <Link href="mailto:webmaster@csmantle.top">webmaster@csmantle.top</Link>
        {">"}.
      </Typography>
      <Typography variant="body1" component="p">
        This program is free software: you can redistribute it and/or modify it under the terms of
        the GNU Affero General Public License as published by the Free Software Foundation, either
        version 3 of the License, or (at your option) any later version.
      </Typography>
      <Typography variant="body1" component="p">
        This program is distributed in the hope that it will be useful, but{" "}
        <strong>WITHOUT ANY WARRANTY</strong>; without even the implied warranty of{" "}
        <strong>MERCHANTABILITY</strong> or <strong>FITNESS FOR A PARTICULAR PURPOSE</strong>. See
        the GNU Affero General Public License for more details.
      </Typography>
      <Typography variant="body1" component="p">
        You should have received a copy of the GNU Affero General Public License along with this
        program. If not, see{" "}
        <Link href="https://www.gnu.org/licenses/" target="_blank" rel="noopener">
          https://www.gnu.org/licenses/
        </Link>
        .
      </Typography>
    </Stack>
  )
}

const EmptyGraphRoot: ConvertedTreeNode = {
  type: "leaf",
  count: 0,
  size: 0,
  name: "(empty)",
}

const App = () => {
  const theme = useTheme()

  const [treeData, setTreeData] = useState<ConvertedTreeNode>(EmptyGraphRoot)

  const { enqueueSnackbar } = useSnackbar()

  const fileTypeInputLabelId = useId()
  const scaleCorrectionLabelId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>("")
  const [fileType, setFileType] = useState("txt")
  const [attempted, setAttempted] = useState(false)
  const [errored, setErrored] = useState(false)

  const [scaleFuncSel, setScaleFuncSel] = useState("none")
  const [scaleExp, setScaleExp] = useState(0.75)

  const scaleFunc = useMemo(() => {
    let func: (x: number) => number
    switch (scaleFuncSel) {
      case "none":
        func = (x) => x
        break
      case "log10":
        func = Math.log10
        break
      case "ln":
        func = Math.log
        break
      case "exp":
        func = (x) => Math.pow(x, scaleExp)
        break
      default:
        throw new Error(`Invalid scale function: ${scaleFuncSel}`)
    }
    return func
  }, [scaleFuncSel, scaleExp])

  async function drawGraph() {
    setAttempted(true)
    try {
      const inputText = await inputRef.current?.files?.item(0)?.text()
      if (!inputText) {
        throw new Error("Failed to fetch input file content.")
      }
      let parsed: ParsedModule[]
      switch (fileType) {
        case "txt":
          parsed = parseTextStats(inputText)
          break
        case "json":
          parsed = parseYosysJsonStats(inputText)
          break
        default:
          throw new Error(`Invalid file type: ${fileType}`)
      }
      const converted = convertParsedModules(parsed, true)
      setTreeData(converted)
      setErrored(false)
    } catch (err) {
      setErrored(true)
      console.error(err)
      err = err instanceof Error ? err : new Error(`${err}`)
      enqueueSnackbar({
        message: `${err}`,
        variant: "error",
      })
    }
  }

  async function clearGraph() {
    setAttempted(false)
    setErrored(false)
    setFileName("")
    setTreeData(EmptyGraphRoot)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(e) {
      enqueueSnackbar(`Service worker registration failed: ${e}. Offline cache will not work.`, {
        variant: "warning",
      })
    },
  })

  useEffect(() => {
    if (offlineReady) {
      enqueueSnackbar("App is ready for offline use.", {
        variant: "info",
      })
      setOfflineReady(false)
    }
  }, [offlineReady])

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          padding: theme.spacing(3),
        }}
      >
        <Stack
          direction="column"
          spacing={4}
          component="main"
          sx={{
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              textAlign: "center",
            }}
          >
            Y Chip Area Visualizer
          </Typography>
          <Container maxWidth="md" component="section">
            <Stack direction="column" spacing={2}>
              <Typography variant="body1" component="p">
                This app parses TXT or JSON output of{" "}
                <Link href="https://github.com/YosysHQ/yosys" target="_blank" rel="noopener">
                  Yosys
                </Link>{" "}
                <Link
                  href="https://yosyshq.readthedocs.io/projects/yosys/en/stable/cmd/stat.html"
                  target="_blank"
                  rel="noopener"
                >
                  <code>stat</code>
                </Link>{" "}
                command, and visualizes the component area in a treemap. Originally developed for{" "}
                <Link
                  href="https://github.com/CSharperMantle/ics2023"
                  target="_blank"
                  rel="noopener"
                >
                  my YSYX project
                </Link>
                , it can be generalized to any compatible Yosys <code>stat</code> outputs. So, the
                "Y" in the name stands for both <strong>Y</strong>SYX and <strong>Y</strong>osys.
              </Typography>
              <Typography variant="body1" component="p">
                Click the cells in the generated graph to display detailed information.
              </Typography>
            </Stack>
          </Container>
          <Divider />
          <Container maxWidth="md" component="section">
            <Grid
              container
              columnSpacing={2}
              rowSpacing={1}
              columns={{ xs: 4, md: 8 }}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <CenteringGrid size={1}>
                <Tooltip title="Open">
                  <IconButton size="large" onClick={() => inputRef.current?.click()}>
                    <FileOpenIcon />
                    <input
                      type="file"
                      accept={fileType === "txt" ? ".txt,text/plain" : ".json,application/json"}
                      ref={inputRef}
                      onChange={async (ev) => {
                        setFileName(ev.target.files?.[0]?.name ?? "")
                        await drawGraph()
                      }}
                      style={{
                        display: "none",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </CenteringGrid>
              <CenteringGrid size={3}>
                <TextField
                  fullWidth
                  label="File name"
                  value={fileName}
                  error={attempted && errored}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  variant="filled"
                />
              </CenteringGrid>
              <CenteringGrid size={2}>
                <FormControl fullWidth variant="filled">
                  <InputLabel id={fileTypeInputLabelId}>File type</InputLabel>
                  <Select
                    labelId={fileTypeInputLabelId}
                    value={fileType}
                    onChange={(ev) => {
                      setFileType(ev.target.value)
                    }}
                  >
                    <MenuItem value={"txt"}>synth_stat.txt</MenuItem>
                    <MenuItem value={"json"}>JSON</MenuItem>
                  </Select>
                </FormControl>
              </CenteringGrid>
              <CenteringGrid size={1}>
                <Tooltip title="Graph">
                  <IconButton size="large" color="primary" onClick={drawGraph}>
                    <PieChartIcon />
                  </IconButton>
                </Tooltip>
              </CenteringGrid>
              <CenteringGrid size={1}>
                <Tooltip title="Clear">
                  <IconButton size="large" onClick={clearGraph}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CenteringGrid>
              <CenteringGrid size={{ xs: 2, md: 4 }}>
                <FormControl fullWidth variant="filled">
                  <InputLabel id={scaleCorrectionLabelId}>Scale correction</InputLabel>
                  <Select
                    labelId={scaleCorrectionLabelId}
                    value={scaleFuncSel}
                    onChange={(ev) => {
                      setScaleFuncSel(ev.target.value)
                    }}
                  >
                    <MenuItem value={"none"}>None</MenuItem>
                    <MenuItem value={"log10"}>Log 10</MenuItem>
                    <MenuItem value={"ln"}>Ln</MenuItem>
                    <MenuItem value={"exp"}>Exponential</MenuItem>
                  </Select>
                </FormControl>
              </CenteringGrid>
              <CenteringGrid size={{ xs: 2, md: 4 }}>
                <TextField
                  fullWidth
                  label="Exponent"
                  type="number"
                  variant="filled"
                  value={scaleExp}
                  disabled={scaleFuncSel !== "exp"}
                  onChange={(ev) => {
                    setScaleExp(parseFloat(ev.target.value))
                  }}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                    htmlInput: {
                      step: 0.05,
                    },
                  }}
                />
              </CenteringGrid>
            </Grid>
          </Container>
          <Container
            maxWidth="lg"
            component="section"
            sx={{
              overflowX: "scroll",
            }}
          >
            <Paper
              elevation={2}
              sx={{
                padding: "0.5rem",
              }}
            >
              <D3Treemap data={treeData} scaleFunc={scaleFunc} width={1280} height={720} />
            </Paper>
          </Container>
          <Divider />
          <Container maxWidth="md" component="section">
            <Stack direction="column" spacing={2}>
              <Typography variant="h5" component="h2">
                How does it work?
              </Typography>
              <Typography variant="body1" component="p">
                All parsing is done locally in the browser, and no data is sent to any server. We
                use{" "}
                <Link href="https://d3js.org/" target="_blank" rel="noopener">
                  D3.js
                </Link>{" "}
                for visualization, and{" "}
                <Link href="https://react.dev/" target="_blank" rel="noopener">
                  React
                </Link>{" "}
                for DOM manipulation. The animations are powered by{" "}
                <Link
                  href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions"
                  target="_blank"
                  rel="noopener"
                >
                  CSS transitions
                </Link>{" "}
                in SVG, without using third-party animation libraries. Aside from its primary
                functionalities, this app can also serve as an example of writing modern
                visualizations that are both declarative and beautiful.
              </Typography>
              <Typography variant="body1" component="p">
                The source code for this app is available at{" "}
                <Link
                  href="https://github.com/CSharperMantle/ysyx-chip-area-visualizer"
                  target="_blank"
                  rel="noopener"
                >
                  https://github.com/CSharperMantle/ysyx-chip-area-visualizer
                </Link>
                .
              </Typography>
            </Stack>
          </Container>
          <Container maxWidth="md" component="section">
            <LicenseText />
          </Container>
        </Stack>
      </Container>
      <UpdateDialog
        open={needRefresh}
        onConfirm={async () => {
          await updateServiceWorker(true)
          setNeedRefresh(false)
        }}
        onCancel={() => {
          setNeedRefresh(false)
        }}
      />
    </>
  )
}

export default App
