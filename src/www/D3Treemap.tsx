import * as d3 from "d3"
import { useId, useMemo, useState } from "react"

import { styled, useTheme } from "@mui/material"

import { ConvertedTreeNode } from "../convert"
import DetailsDrawer, { DetailsNode } from "./DetailsDrawer"

type NodeType = d3.HierarchyRectangularNode<ConvertedTreeNode>

function scaleAdjust(tree: ConvertedTreeNode, f: (x: number) => number): ConvertedTreeNode {
  switch (tree.type) {
    case "leaf":
      return { ...tree, type: "adj-leaf", displaySize: f(tree.size) }
    case "adj-leaf":
      return tree
    case "internal":
      return { ...tree, children: tree.children.map((c) => scaleAdjust(c, f)) }
  }
}

const AnimatedSVGGroup = styled("g")(({ theme }) => ({
  "&": {
    cursor: "pointer",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.standard,
    }),
  },
  "& > rect": {
    fill: theme.palette.mode === "dark" ? theme.palette.grey["800"] : theme.palette.grey["300"],
    transition: theme.transitions.create("fill", {
      duration: theme.transitions.duration.shorter,
    }),
  },
  "&:hover > rect": {
    fill: theme.palette.mode === "dark" ? theme.palette.grey["700"] : theme.palette.grey["200"],
  },
}))

const TreemapNode = (props: {
  node: NodeType
  xScale: d3.ScaleContinuousNumeric<number, number, never>
  yScale: d3.ScaleContinuousNumeric<number, number, never>
  setDetailsNode: (x: DetailsNode | null) => void
  setDetailsOpen: (x: boolean) => void
}) => {
  function getNamePath(d: NodeType) {
    return d
      .ancestors()
      .reverse()
      .map((d) => d.data.name)
  }

  const [x, y] = [props.xScale(props.node.x0), props.yScale(props.node.y0)]
  const [rectWidth, rectHeight] = [
    props.xScale(props.node.x1) - props.xScale(props.node.x0),
    props.yScale(props.node.y1) - props.yScale(props.node.y0),
  ]

  const theme = useTheme()
  const strokeColor =
    theme.palette.mode === "dark" ? theme.palette.grey["400"] : theme.palette.grey["900"]

  const leafId = useId()
  const clipId = useId()

  let area: number | null = null
  switch (props.node.data.type) {
    case "leaf":
    case "adj-leaf":
      area = props.node.data.size
      break
    case "internal":
      area = null
      break
  }

  return (
    <AnimatedSVGGroup
      transform={`translate(${x},${y})`}
      onClick={() => {
        props.setDetailsNode({ ...props.node.data, path: getNamePath(props.node) })
        props.setDetailsOpen(true)
      }}
    >
      <title>
        {getNamePath(props.node).join("/")}
        {area ? ` (Area: ${area})` : null}
      </title>
      <rect id={leafId} stroke={strokeColor} width={rectWidth} height={rectHeight} />
      <clipPath id={clipId}>
        <use xlinkHref={new URL(`#${leafId}`, location.toString()).toString()} />
      </clipPath>
      <text
        clipPath={clipId}
        x={3}
        fill={theme.palette.text.primary}
        style={{
          userSelect: "none",
        }}
      >
        {getNamePath(props.node).map((name, i) => (
          <tspan key={i} x={3} dy="1em">
            {name}
          </tspan>
        ))}
        {area ? (
          <>
            <tspan x={3} dy="2em">
              Area:
            </tspan>
            <tspan dx={3}>{area}</tspan>
          </>
        ) : null}
      </text>
    </AnimatedSVGGroup>
  )
}

const D3Treemap = (props: {
  data: ConvertedTreeNode
  width: number
  height: number
  scaleFunc: (x: number) => number
}) => {
  const theme = useTheme()

  const data = scaleAdjust(props.data, props.scaleFunc)
  const width = props.width
  const height = props.height

  const root = useMemo(() => {
    const tiler = (node: NodeType, x0: number, y0: number, x1: number, y1: number) => {
      d3.treemapSquarify(node, 0, 0, width, height)
      for (const child of node.children ?? []) {
        child.x0 = x0 + (child.x0 / width) * (x1 - x0)
        child.x1 = x0 + (child.x1 / width) * (x1 - x0)
        child.y0 = y0 + (child.y0 / height) * (y1 - y0)
        child.y1 = y0 + (child.y1 / height) * (y1 - y0)
      }
    }

    const hierarchy = d3
      .hierarchy(data)
      .sum((d) => {
        switch (d.type) {
          case "leaf":
            return d.size
          case "adj-leaf":
            return d.displaySize
          case "internal":
            return 0
        }
      })
      .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
    return d3.treemap<ConvertedTreeNode>().size([width, height]).round(true).tile(tiler)(hierarchy)
  }, [data, width, height])

  const xScale = useMemo(
    () => d3.scaleLinear().rangeRound([0, width]).domain([root.x0, root.x1]),
    [root, width]
  )
  const yScale = useMemo(
    () => d3.scaleLinear().rangeRound([0, height]).domain([root.y0, root.y1]),
    [root, height]
  )

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsNode, setDetailsNode] = useState<DetailsNode | null>(null)

  const svgBorderColor =
    theme.palette.mode === "dark" ? theme.palette.grey["400"] : theme.palette.grey["900"]

  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{
          fontSize: "0.8rem",
          fontFamily: theme.typography.fontFamily,
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: svgBorderColor,
        }}
      >
        {(root.leaves() ?? []).map((node, i) => (
          <TreemapNode
            key={i}
            node={node}
            xScale={xScale}
            yScale={yScale}
            setDetailsNode={setDetailsNode}
            setDetailsOpen={setDetailsOpen}
          />
        ))}
      </svg>

      <DetailsDrawer
        open={detailsOpen}
        node={detailsNode}
        onClose={() => {
          setDetailsOpen(false)
        }}
      />
    </>
  )
}

export default D3Treemap
