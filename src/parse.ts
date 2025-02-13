export interface ParsedModule {
  name: string
  top: boolean
  area: number
  stats: {
    name: string
    count: number
  }[]
  cells: {
    [name: string]: number
  }
  excludedCells: string[]
}

export class TextStatsParseError extends Error {
  constructor(message: string) {
    super(`Invalid synth_stat.txt: ${message}`)
  }
}

export class YosysJsonStatsParseError extends Error {
  constructor(message: string) {
    super(`Invalid synth_stat.json: ${message}`)
  }
}

const STAT_FILE_HEADER = "16. Printing statistics."
const TOP_METANAME = "@Top@"

export function parseTextStats(input: string): ParsedModule[] {
  // Split by "\n=== [component name] ===\n"
  const rawModules = input.split(/^=== .+ ===$/m).map((content) =>
    content
      .split(/\r|\n/)
      .filter((line) => line.length > 0)
      .map((line) => line.trim())
  )
  if (rawModules.length === 0) {
    return []
  }
  if (rawModules[0].length !== 1 || rawModules[0][0] !== STAT_FILE_HEADER) {
    throw new TextStatsParseError("Bad header")
  }
  const parsedRawModules: (ParsedModule | string)[] = rawModules.slice(1).map((rawModule) => {
    const data = rawModule.map((line) => {
      const statMatch = line.match(/^Number of (.+):\s+(\d+)$/)
      if (statMatch && statMatch.length === 3) {
        const [, name, count] = statMatch
        return { type: "stat" as const, name, count: parseInt(count, 10) }
      }
      const exclusionMatch = line.match(/^Area for cell type (.+?) is unknown!$/)
      if (exclusionMatch && exclusionMatch.length === 2) {
        const [, name] = exclusionMatch
        return { type: "excludedCells" as const, name }
      }
      const areaMatch = line.match(/^Chip area for (top )?module '([^']+)': (\d*\.?\d*)$/)
      if (areaMatch) {
        const [, top, name, area] = areaMatch
        const isTop = top !== undefined
        return { type: "nameArea" as const, top: isTop, name: isTop ? TOP_METANAME : name, area }
      }
      const cellMatch = line.match(/^(.+?)\s+(\d+)$/)
      if (cellMatch && cellMatch.length === 3) {
        const [, name, count] = cellMatch
        return { type: "cell" as const, name, count: parseInt(count, 10) }
      }
      return null
    })
    const nameAreaDefs = data.filter((d) => d !== null && d.type === "nameArea") as {
      type: "nameArea"
      top: boolean
      name: string
      area: string
    }[]
    if (nameAreaDefs.length === 0) {
      return "No name or area definition found"
    } else if (nameAreaDefs.length > 1) {
      return "Multiple name or area definitions found"
    }
    const nameAreaDef = nameAreaDefs[0]
    let obj: ParsedModule = {
      name: nameAreaDef.name,
      top: nameAreaDef.top,
      area: parseFloat(nameAreaDef.area),
      stats: [],
      cells: {},
      excludedCells: [],
    }
    for (const d of data.filter((d) => d !== null)) {
      if (d.type === "stat") {
        obj.stats.push({ name: d.name, count: d.count })
      } else if (d.type === "cell") {
        obj.cells[d.name] = d.count
      } else if (d.type === "excludedCells") {
        obj.excludedCells.push(d.name)
      }
    }
    return obj
  })
  if (parsedRawModules.some((m) => typeof m === "string")) {
    throw new TextStatsParseError(parsedRawModules.filter((m) => typeof m === "string").shift()!)
  }
  if (parsedRawModules.length === 0 || !parsedRawModules.some((m) => (m as ParsedModule).top)) {
    throw new TextStatsParseError("Missing top module")
  }
  return parsedRawModules as ParsedModule[]
}

interface YosysJsonModule {
  num_wires: number
  num_wire_bits: number
  num_pub_wires: number
  num_pub_wire_bits: number
  num_memories: number
  num_memory_bits: number
  num_processes: number
  num_cells: number
  area: number
  num_cells_by_type: {
    [name: string]: number
  }
}

interface YosysJson {
  creator: string
  invocation: string
  modules: {
    [name: string]: YosysJsonModule
  }
  design: YosysJsonModule
}

function parseSingleYosysJsonModule(
  name: string,
  top: boolean,
  module: YosysJsonModule
): ParsedModule {
  const stats = Object.entries(module)
    .filter(([key]) => key.startsWith("num_") && key !== "num_cells_by_type")
    .map(([key, value]) => ({
      name: key
        .trim()
        .match(/^num_(.*)$/)![1]
        .replace("_", " "),
      count: value,
    }))
  return {
    name,
    top,
    area: module.area,
    stats,
    excludedCells: [],
    cells: module.num_cells_by_type,
  }
}

export function parseYosysJsonStats(json: string): ParsedModule[] {
  const parsedJson = JSON.parse(json)
  if (!parsedJson || typeof parsedJson !== "object") {
    throw new TextStatsParseError("Invalid JSON")
  }
  if (
    !("creator" in parsedJson) ||
    typeof parsedJson.creator !== "string" ||
    parsedJson.creator.match(/^Yosys [0-9]+\.[0-9]+ \(.+\)$/) === null
  ) {
    throw new YosysJsonStatsParseError("Missing or invalid creator signature")
  }
  if (!("design" in parsedJson) || typeof parsedJson.design !== "object") {
    throw new YosysJsonStatsParseError("Missing or invalid top module")
  }
  const yosysJson = parsedJson as YosysJson
  return Object.entries(yosysJson.modules)
    .map(([name, module]) => parseSingleYosysJsonModule(name, false, module))
    .concat([parseSingleYosysJsonModule(TOP_METANAME, true, yosysJson.design)])
}
