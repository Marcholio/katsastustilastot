import baseData from '../data/main.json' with { type: 'json' }
import fs from 'fs'
import { median, sort } from 'ramda'
import { InspectionStats } from '../types'
import { processRawJsonDump } from './processData'

const tickSize = 5000
const maxKms = 400000

const main = baseData as { data: any }
const processedData = processRawJsonDump(main.data)

fs.writeFileSync('./src/data/processed.json', JSON.stringify(processedData), {})

const percentile = (data: number[], percentile: number): number => {
  const idx = Math.round(percentile * data.length)
  const sorted = sort((a, b) => a - b, data)
  return sorted[idx]
}

const flatStats = Object.values(processedData).flatMap((d: any) =>
  Object.values(d).flatMap((s: any) => Object.values(s)),
) as InspectionStats[]

const percentagesByKm = flatStats.reduce(
  (acc: any, cur: any) => {
    // KEEP IN SYNC WITH Chart.ts
    const key = cur.avgKm - (cur.avgKm % tickSize)
    if (!(key in acc)) {
      acc[key] = []
    }

    if (cur.count > 0) {
      const perc = ((cur.failCount ?? 0) / cur.count) * 100

      acc[key].push(perc)
    }
    return acc
  },
  {} as Record<string, number[]>,
)

const baseLineData = Object.entries(percentagesByKm).reduce(
  (acc, [km, percentages]: any) =>
    Object.assign(acc, {
      [km]: {
        med: percentages.length > 0 ? median(percentages) : undefined,
        p75: percentages.length > 0 ? percentile(percentages, 0.75) : undefined,
        p25: percentages.length > 0 ? percentile(percentages, 0.25) : undefined,
      },
    }),
  {} as Record<
    string,
    {
      med: number | undefined
      p75: number | undefined
      p25: number | undefined
    }
  >,
)

fs.writeFileSync('./src/data/baseline.json', JSON.stringify(baseLineData), {})

const averageDiffsByModel = Object.keys(processedData).reduce(
  (acc, model) => {
    const allStats: InspectionStats[] = Object.values(
      processedData[model],
    ).flatMap((d: any) => Object.values(d))

    const diffs = allStats
      .filter((stat) => stat.avgKm <= maxKms)
      .map((stat) => {
        const kmSlot = stat.avgKm - (stat.avgKm % tickSize)
        const baseline = baseLineData[kmSlot.toString()]
        return baseline.med! - (100 * (stat.failCount || 0)) / stat.count
      })

    const avgDiff = diffs.reduce((total, cur) => total + cur, 0) / diffs.length

    return Object.assign(acc, { [model]: avgDiff })
  },
  {} as Record<string, number>,
)

fs.writeFileSync(
  './src/data/avgDiffs.json',
  JSON.stringify(averageDiffsByModel),
  {},
)
