import { keyBy, last, mapValues, sum, trimStart } from "lodash-es"
import toposort from "toposort"

import { ParsedModule } from "./parse"

export type ConvertedTreeNode =
  | {
      type: "internal"
      name: string
      children: ConvertedTreeNode[]
      primitiveArea: number
    }
  | {
      type: "leaf"
      name: string
      size: number
      count: number
      coalescedPrimitives?: { [name: string]: number }
    }
  | {
      type: "adj-leaf"
      name: string
      size: number
      displaySize: number
      count: number
      coalescedPrimitives?: { [name: string]: number }
    }

interface ModuleTreeNode {
  name: string
  primitiveArea: number
  totalArea: number
  primitives: {
    [name: string]: number
  }
  children: ModuleTreeNode[]
}

export class ConversionError extends Error {
  constructor(message: string) {
    super(`Cannot convert: ${message}`)
  }
}

function buildModuleSubtree(modules: Map<string, ParsedModule>, obj: ParsedModule): ModuleTreeNode {
  const children = Object.entries(obj.cells)
    .filter(([name]) => modules.has(name))
    .map(([name]) => buildModuleSubtree(modules, modules.get(name)!))
  const primitives = mapValues(
    keyBy(
      Object.entries(obj.cells).filter(([name]) => !modules.has(name)),
      (e) => e[0]
    ),
    (e) => e[1]
  )
  return {
    name: obj.name,
    primitiveArea: obj.area,
    totalArea: obj.area + sum(children.map((c) => c.totalArea)),
    primitives: primitives,
    children,
  }
}

function buildModuleTree(parsedModules: ParsedModule[]): ModuleTreeNode {
  const modules = new Map(
    parsedModules.filter((m) => !m.top).map((m) => [trimStart(m.name, "\\"), m])
  )
  const edges = parsedModules
    .filter((m) => !m.top)
    .flatMap((m) =>
      Object.entries(m.cells)
        .filter(([name]) => modules.has(name))
        .map(([name]) => [name, trimStart(m.name, "\\")] as [string, string])
    )
  let sorted: ReturnType<typeof toposort<string>>
  try {
    sorted = toposort<string>(edges)
  } catch (err) {
    throw new ConversionError(
      `Circular inclusion: ${err instanceof Error ? err.message : String(err)}`
    )
  }
  return buildModuleSubtree(modules, modules.get(last(sorted)!)!)
}

function makeAggPrimitiveNode(
  primitives: { [name: string]: number },
  area: number,
  coalesce: boolean
): ConvertedTreeNode {
  if (coalesce) {
    return {
      type: "leaf",
      name: "[Primitives]",
      size: area,
      count: 1,
      coalescedPrimitives: primitives,
    }
  } else {
    const totalCount = sum(Object.values(primitives))
    return {
      type: "internal",
      name: "[Primitives]",
      children: Object.entries(primitives).map(([name, count]) => ({
        type: "leaf",
        name,
        size: area * (count / totalCount),
        count,
      })),
      primitiveArea: area,
    }
  }
}

function convertSubtree(node: ModuleTreeNode, coalesce: boolean): ConvertedTreeNode {
  let aggPrims: ConvertedTreeNode[] = []
  if (Object.values(node.primitives).length > 0) {
    aggPrims = [makeAggPrimitiveNode(node.primitives, node.primitiveArea, coalesce)]
  }
  return {
    type: "internal",
    name: node.name,
    children: node.children.map((e) => convertSubtree(e, coalesce)).concat(aggPrims),
    primitiveArea: node.primitiveArea,
  }
}

export function convertParsedModules(
  parsedModules: ParsedModule[],
  coalesce: boolean = true
): ConvertedTreeNode {
  const tree = buildModuleTree(parsedModules)
  return convertSubtree(tree, coalesce)
}
