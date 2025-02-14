import * as d3 from "d3"
import { useId, useMemo, useState } from "react"

import { styled, useTheme } from "@mui/material"

import { ConvertedTreeNode } from "../convert"
import DetailsDrawer, { DetailsNode } from "./DetailsDrawer"

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

const HoverSVGGroup = styled("g")(({ theme }) => ({
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

const D3Treemap = (props: {
  data: ConvertedTreeNode
  width: number
  height: number
  scaleFunc: (x: number) => number
}) => {
  type NodeType = d3.HierarchyRectangularNode<ConvertedTreeNode>

  const theme = useTheme()

  const data = scaleAdjust(props.data, props.scaleFunc)
  const width = props.width
  const height = props.height

  const tiler = (node: NodeType, x0: number, y0: number, x1: number, y1: number) => {
    d3.treemapSquarify(node, 0, 0, width, height)
    for (const child of node.children ?? []) {
      child.x0 = x0 + (child.x0 / width) * (x1 - x0)
      child.x1 = x0 + (child.x1 / width) * (x1 - x0)
      child.y0 = y0 + (child.y0 / height) * (y1 - y0)
      child.y1 = y0 + (child.y1 / height) * (y1 - y0)
    }
  }

  const root = useMemo(() => {
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
  }, [data])

  const xScale = useMemo(
    () => d3.scaleLinear().rangeRound([0, width]).domain([root.x0, root.x1]),
    [root, width]
  )
  const yScale = useMemo(
    () => d3.scaleLinear().rangeRound([0, height]).domain([root.y0, root.y1]),
    [root, height]
  )

  const getNamePath = (d: NodeType) =>
    d
      .ancestors()
      .reverse()
      .map((d) => d.data.name)

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
          font: "0.8rem sans-serif",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: svgBorderColor,
        }}
      >
        {(root.leaves() ?? []).map((node, i) => {
          const [x, y] = [xScale(node.x0), yScale(node.y0)]
          const [rectWidth, rectHeight] = [
            xScale(node.x1) - xScale(node.x0),
            yScale(node.y1) - yScale(node.y0),
          ]

          const leafId = useId()
          const clipId = useId()

          let area: number | null = null
          switch (node.data.type) {
            case "leaf":
            case "adj-leaf":
              area = node.data.size
              break
            case "internal":
              area = null
              break
          }

          return (
            <HoverSVGGroup
              key={i}
              transform={`translate(${x},${y})`}
              onClick={() => {
                setDetailsNode({ ...node.data, path: getNamePath(node) })
                setDetailsOpen(true)
              }}
            >
              <title>
                {getNamePath(node).join("/")}
                {area ? ` (Area: ${area})` : null}
              </title>
              <rect id={leafId} stroke={svgBorderColor} width={rectWidth} height={rectHeight} />
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
                {getNamePath(node).map((name, i) => {
                  return (
                    <tspan key={i} x={3} dy="1em">
                      {name}
                    </tspan>
                  )
                })}
                {area ? (
                  <>
                    <tspan x={3} dy="2em">
                      Area:
                    </tspan>
                    <tspan dx={3}>{area}</tspan>
                  </>
                ) : null}
              </text>
            </HoverSVGGroup>
          )
        })}
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
